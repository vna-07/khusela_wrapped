"""
WhatsApp Cloud API webhook.
- GET  verifies the subscription
- POST checks X-Hub-Signature-256, returns 200 immediately, processes in background
"""
import hashlib
import hmac

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse

from app.config import settings

router = APIRouter(prefix="/webhook/whatsapp", tags=["whatsapp"])


@router.get("")
async def verify(
    mode: str = Query(None, alias="hub.mode"),
    challenge: str = Query(None, alias="hub.challenge"),
    token: str = Query(None, alias="hub.verify_token"),
):
    if mode == "subscribe" and token == settings.wa_verify_token:
        return PlainTextResponse(challenge or "")
    raise HTTPException(status_code=403, detail="verification failed")


def _valid_signature(body: bytes, header: str | None) -> bool:
    if not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(
        settings.wa_app_secret.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, header.removeprefix("sha256="))


@router.post("")
async def receive(request: Request, background: BackgroundTasks):
    body = await request.body()
    if not _valid_signature(body, request.headers.get("X-Hub-Signature-256")):
        raise HTTPException(status_code=403, detail="bad signature")
    payload = await request.json()
    background.add_task(process_payload, payload)
    return {"status": "received"}


async def process_payload(payload: dict) -> None:
    # TODO: dedupe on message id -> load session -> route (menu / media / text)
    #       -> engine.evaluate or assistant -> send reply
    return None
