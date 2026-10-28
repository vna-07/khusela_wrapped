import re


def classify_document(text: str) -> str:
    text_lower = text.lower()

    # 1. Check for supplier change (highest risk)
    if any(w in text_lower for w in ["bank details", "new account", "beneficiary", "change of account"]):
        return "supplier_change"

    # 2. Check for certificate
    if any(w in text_lower for w in ["certificate", "diploma", "degree", "university", "award"]):
        return "certificate"

    # 3. Check for invoice/receipt
    if any(w in text_lower for w in [
        "invoice", "receipt", "bill to", "vat", "subtotal", "total due",
        "payment amount", "paid on",
    ]):
        return "invoice"

    # 4. Check for statement
    if any(w in text_lower for w in ["statement", "opening balance", "closing balance", "transaction history"]):
        return "statement"

    # 5. Check for payment
    if any(w in text_lower for w in ["proof of payment", "paid", "pending", "transfer", "settled"]):
        return "payment"

    return "unknown"


def investigate_document(text: str) -> dict:
    doc_type = classify_document(text)
    text_lower = text.lower()

    # CERTIFICATE INVESTIGATION
    if doc_type == "certificate":
        placeholders = ["your name", "insert name", "john doe", "astrophizzicks"]
        if any(p in text_lower for p in placeholders):
            return {
                "status": "REVIEW REQUIRED",
                "reason": "Suspicious certificate content detected.",
                "finding": "The document contains placeholder text or unusual qualification titles.",
                "verification": "Issuer authenticity has NOT been verified.",
                "action": "Do not rely on this certificate. Contact the issuing institution directly.",
            }
        return {
            "status": "VERIFICATION REQUIRED",
            "reason": "Certificate format recognised, but authenticity cannot be confirmed via OCR.",
            "finding": "Text extracted successfully, but no official verification API was queried.",
            "verification": "Unverified.",
            "action": "Check the institution's official registry to verify this document.",
        }

    # INVOICE / RECEIPT INVESTIGATION
    elif doc_type == "invoice":
        return {
            "status": "CONSISTENT",
            "reason": "Invoice/receipt structure detected.",
            "finding": "The document claims to be a receipt or invoice for payment.",
            "verification": "Supplier details and payment settlement have NOT been independently verified.",
            "action": "Confirm the payment in your own banking app before releasing goods. Verify the supplier's banking details via a trusted channel.",
        }

    # SUPPLIER CHANGE INVESTIGATION
    elif doc_type == "supplier_change":
        return {
            "status": "SUSPICIOUS",
            "reason": "Potential Business Email Compromise (BEC) or impersonation.",
            "finding": "The message requests a change of banking details. This is a high-risk action.",
            "verification": "The sender's identity has NOT been verified.",
            "action": "Do not update your records. Call the supplier using a previously known phone number to confirm.",
        }

    # PAYMENT INVESTIGATION
    elif doc_type == "payment":
        from app.engine.evaluate import evaluate_payment_proof
        verdict = evaluate_payment_proof(text, "investigator_hash")

        status_map = {
            "MATCH": "CONSISTENT",
            "WAIT": "REVIEW REQUIRED",
            "STOP": "SUSPICIOUS",
            "ESCALATE": "SUSPICIOUS",
        }
        new_status = status_map.get(verdict.status, "INSUFFICIENT EVIDENCE")

        return {
            "status": new_status,
            "reason": verdict.reason_codes[0].description if verdict.reason_codes else "No specific reason recorded.",
            "finding": "Payment evidence extracted.",
            "verification": "Bank settlement is unverified. Only your banking app can confirm this.",
            "action": verdict.recommended_action,
        }

    # UNKNOWN
    return {
        "status": "INSUFFICIENT EVIDENCE",
        "reason": "Document type could not be confidently identified.",
        "finding": "We read the text, but we do not know what this document represents.",
        "verification": "Unverified.",
        "action": "Please clarify what this document is, or upload a higher quality image.",
    }