from fastapi import FastAPI, Request, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

from app.engine.evaluate import evaluate_payment_proof
from app.assistant.orchestrator import explain_verdict
from app.llm.provider import generate_ai_response
from app.db.store import add_audit_log, get_audit_logs

app = FastAPI(title="Khusela Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CheckRequest(BaseModel):
    text_input: str
    file_hash: str = "mock_hash_123"

class AssistantRequest(BaseModel):
    verdict: dict

class MessageScanRequest(BaseModel):
    text_input: str

class ChatRequest(BaseModel):
    message: str


# ----------------------------- Helpers -----------------------------

# Payment indicators — same pattern as frontend, word-boundary safe
_PAYMENT_RE = re.compile(
    r"\b(r\s?\d|paid|payment|eft|deposit(?:ed)?|transfer(?:red)?|"
    r"proof|screenshot|receipt|confirmation|overpaid|underpaid|"
    r"invoice|supplier|pending|amount)\b",
    re.IGNORECASE,
)


def scan_message(text: str) -> dict:
    """
    Shared message scanning logic — used by /check/message AND the WhatsApp
    webhook. Keeping it in one place stops the two rules from drifting.
    """
    text_lower = text.lower()
    reasons = []
    status = "INFO"

    if any(word in text_lower for word in ["urgent", "immediately", "suspend", "arrest", "2 hours"]):
        reasons.append({"code": "MSG_001", "description": "High-pressure urgency tactics detected", "severity": "high"})
        status = "STOP"

    if any(word in text_lower for word in ["otp", "pin", "password", "verify your account", "login"]):
        reasons.append({"code": "MSG_002", "description": "Request for sensitive credentials (OTP/PIN)", "severity": "critical"})
        status = "STOP"

    if re.search(r"http[s]?://", text_lower):
        reasons.append({"code": "MSG_003", "description": "Contains an unverified URL", "severity": "medium"})
        if status != "STOP":
            status = "WAIT"

    if not reasons:
        reasons.append({"code": "MSG_000", "description": "No obvious red flags detected.", "severity": "low"})

    return {
        "id": "msg-123",
        "status": status,
        "reason_codes": reasons,
        "recommended_action": "Do not click any links or share credentials." if status != "INFO" else "Proceed with caution.",
    }


# ----------------------------- Routes -----------------------------

@app.get("/")
def health():
    return {"status": "Khusela Core is online. Secure the bag."}


@app.post("/api/v1/check/payment")
async def check_payment(req: CheckRequest):
    return evaluate_payment_proof(req.text_input, req.file_hash)


@app.post("/api/v1/assistant/explain")
async def assistant_explain(req: AssistantRequest):
    explanation = await explain_verdict(req.verdict)
    return {"response": explanation}


@app.post("/api/v1/check/message")
async def check_message(req: MessageScanRequest):
    return scan_message(req.text_input)


@app.post("/api/v1/assistant/chat")
async def general_chat(req: ChatRequest):
    system_prompt = """
    Role: You are Khuzeka, an empathetic, sharp AI assistant designed to protect South African users and business owners from fraud.
    Keep your answers short, helpful, and reassuring. Never share PINs or passwords.
    """
    response = await generate_ai_response(system_prompt, f"User says: {req.message}")
    return {"response": response}


# --- WHATSAPP WEBHOOK ---

@app.get("/api/v1/webhooks/whatsapp")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
):
    if hub_mode == "subscribe" and hub_challenge:
        return Response(content=hub_challenge, media_type="text/plain")
    return Response(content="Verification failed", status_code=403)


@app.post("/api/v1/webhooks/whatsapp")
async def receive_whatsapp_message(request: Request):
    payload = await request.json()
    try:
        entry = payload.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        if not messages:
            return {"status": "no_message"}

        message = messages[0]
        sender_phone = message.get("from")

        if message.get("type") == "text":
            text_body = message["text"]["body"]

            # ---- Smart routing ----
            # Payment keywords → payment engine (returns Pydantic objects)
            # Everything else     → scanner (returns plain dicts)
            if _PAYMENT_RE.search(text_body):
                verdict = evaluate_payment_proof(text_body, "wa_hash_123")
                status = verdict.status
                reason_desc = (
                    verdict.reason_codes[0].description
                    if verdict.reason_codes
                    else "no reason"
                )
                route = "payment"
            else:
                scan = scan_message(text_body)
                status = scan["status"]
                reason_desc = (
                    scan["reason_codes"][0]["description"]
                    if scan["reason_codes"]
                    else "no reason"
                )
                route = "scan"

            add_audit_log(
                channel="WhatsApp",
                sender=sender_phone,
                event_type="Message Scan",
                description=f"Received: '{text_body[:30]}...'",
                context=f"[{route}] Verdict: {status} · {reason_desc}",
                status="warning" if status in ["STOP", "WAIT"] else "success",
            )
            print(f"Processed WhatsApp message [{route}]: {status}")

        elif message.get("type") == "image":
            image_id = message["image"]["id"]
            add_audit_log(
                channel="WhatsApp",
                sender=sender_phone,
                event_type="Image Upload",
                description="Received payment screenshot",
                context=f"Media ID: {image_id}. Pending OCR extraction.",
                status="info",
            )

        return {"status": "success"}
    except Exception as e:
        print(f"Webhook Error: {e}")
        return {"status": "error"}


# --- AUDIT LOG API ---

@app.get("/api/v1/audit-logs")
async def fetch_audit_logs():
    return get_audit_logs()