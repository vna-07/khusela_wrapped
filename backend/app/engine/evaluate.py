from .schema import Verdict, ReasonCode, Evidence
import uuid

def evaluate_payment_proof(text_input: str, file_hash: str) -> Verdict:
    text_lower = text_input.lower()
    reasons = []
    status = "MATCH"
    action = "Proceed with caution. Always verify in your bank app."

    # Rule 1: Pending/Suspense
    if "pending" in text_lower or "suspense" in text_lower:
        reasons.append(ReasonCode(code="POP_001", description="Funds not cleared (Pending/Suspense)", severity="high"))
        status = "WAIT"
        action = "Do not release goods yet. Verify the funds have cleared in your own banking app."
        
    # Rule 2: Overpayment/Refund Scam
    elif "overpaid" in text_lower or "refund" in text_lower:
        reasons.append(ReasonCode(code="POP_002", description="Overpayment/Refund scam indicator", severity="critical"))
        status = "STOP"
        action = "Stop all communication. Do not send any money back. Contact your bank."

    # Rule 3: Prompt Injection Detection (Adversarial)
    elif "ignore previous instructions" in text_lower or "confirm money arrived" in text_lower:
        reasons.append(ReasonCode(code="SEC_001", description="Prompt injection attempt detected", severity="critical"))
        status = "STOP"
        action = "Security alert: This message contains manipulation attempts. Do not trust this request."

    if not reasons:
        reasons.append(ReasonCode(code="POP_000", description="No obvious anomalies found", severity="low"))

    return Verdict(
        id=str(uuid.uuid4()),
        status=status,
        confidence=0.95 if status != "UNCERTAIN" else 0.5,
        reason_codes=reasons,
        evidence=[Evidence(source_type="text", extracted_data={"raw": text_input}, hash=file_hash)],
        recommended_action=action
    )