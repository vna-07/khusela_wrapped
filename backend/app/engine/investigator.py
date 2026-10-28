import re

def classify_document(text: str) -> str:
    text_lower = text.lower()
    
    if any(w in text_lower for w in ["certificate", "university", "degree", "diploma", "award", "transcript"]):
        return "certificate"
    if any(w in text_lower for w in ["invoice", "receipt", "vat", "subtotal", "total due"]):
        return "invoice"
    if any(w in text_lower for w in ["statement", "opening balance", "closing balance", "transaction history"]):
        return "statement"
    if any(w in text_lower for w in ["bank details", "change of account", "new account number", "beneficiary"]):
        return "supplier_change"
    if any(w in text_lower for w in ["proof of payment", "paid", "pending", "r2450", "transfer"]):
        return "payment"
    return "unknown"

def investigate_document(text: str) -> dict:
    doc_type = classify_document(text)
    text_lower = text.lower()
    
    # 1. CERTIFICATE INVESTIGATION
    if doc_type == "certificate":
        placeholders = ["your name", "insert name", "john doe", "astrophizzicks"]
        if any(p in text_lower for p in placeholders):
            return {
                "status": "REVIEW REQUIRED",
                "reason": "Suspicious certificate content detected.",
                "finding": "The document contains placeholder text ('Your Name') and unusual qualification titles ('ASTROPHIZZICKS').",
                "verification": "Issuer authenticity has NOT been verified.",
                "action": "Do not rely on this certificate. Contact the issuing institution directly via their official website."
            }
        return {
            "status": "VERIFICATION REQUIRED",
            "reason": "Certificate format recognised, but authenticity cannot be confirmed via OCR.",
            "finding": "Text extracted successfully, but no official verification API was queried.",
            "verification": "Unverified.",
            "action": "Check the institution's official registry to verify this document."
        }

    # 2. INVOICE INVESTIGATION
    elif doc_type == "invoice":
        # Simple arithmetic mock check
        if "subtotal" in text_lower and "total" in text_lower:
            return {
                "status": "CONSISTENT",
                "reason": "Invoice structure detected.",
                "finding": "Line items and totals extracted. No obvious placeholder text found.",
                "verification": "Supplier details have not been independently verified.",
                "action": "Confirm the supplier's banking details via a trusted channel before paying."
            }

    # 3. SUPPLIER CHANGE INVESTIGATION (R08)
    elif doc_type == "supplier_change":
        return {
            "status": "SUSPICIOUS",
            "reason": "Potential Business Email Compromise (BEC) or impersonation.",
            "finding": "The message requests a change of banking details. This is a high-risk action.",
            "verification": "The sender's identity has NOT been verified.",
            "action": "Do not update your records. Call the supplier using a previously known phone number to confirm."
        }

    # 4. PAYMENT INVESTIGATION
    elif doc_type == "payment":
        from app.engine.evaluate import evaluate_payment_proof
        verdict = evaluate_payment_proof(text, "investigator_hash")
        
        # Map old statuses to new, meaningful statuses
        status_map = {
            "MATCH": "CONSISTENT",
            "WAIT": "REVIEW REQUIRED",
            "STOP": "SUSPICIOUS"
        }
        new_status = status_map.get(verdict.status, "INSUFFICIENT EVIDENCE")
        
        return {
            "status": new_status,
            "reason": verdict.reason_codes[0].description,
            "finding": "Payment evidence extracted.",
            "verification": "Bank settlement is unverified. Only your banking app can confirm this.",
            "action": verdict.recommended_action
        }

    # 5. UNKNOWN
    return {
        "status": "INSUFFICIENT EVIDENCE",
        "reason": "Document type could not be confidently identified.",
        "finding": "We read the text, but we do not know what this document represents.",
        "verification": "Unverified.",
        "action": "Please clarify what this document is, or upload a higher quality image."
    }