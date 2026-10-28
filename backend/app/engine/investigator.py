import re
from typing import Any

# Weights for classification
DOCUMENT_PATTERNS = {
    "certificate": {"certificate": 3, "university": 2, "degree": 2, "diploma": 2, "award": 2},
    "invoice": {"invoice": 3, "receipt": 3, "subtotal": 2, "total due": 2, "vat": 2},
    "statement": {"statement": 3, "opening balance": 3, "closing balance": 3, "transaction history": 2},
    "supplier_change": {"bank details": 3, "new account": 3, "change of account": 3, "beneficiary": 2},
    "payment": {"proof of payment": 3, "paid": 1, "pending": 2, "transfer": 2}
}

def classify_document(text: str) -> dict:
    text_lower = text.lower()
    scores = {}
    for doc_type, patterns in DOCUMENT_PATTERNS.items():
        scores[doc_type] = sum(weight for phrase, weight in patterns.items() if phrase in text_lower)
    
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    best_type, best_score = ranked[0]

    if best_score < 2:
        return {"type": "unknown", "needs_clarification": True}

    return {"type": best_type, "needs_clarification": False}

def extract_amounts(text: str) -> list[float]:
    # Regex to find numbers with 2 decimal places or comma separated
    matches = re.findall(r'(?:R|\$)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2}))', text)
    return [float(m.replace(',', '')) for m in matches]

def investigate_document(text: str, ai_insights: dict = None) -> dict:
    classification = classify_document(text)
    doc_type = classification["type"]
    
    if classification["needs_clarification"]:
        return {
            "status": "INSUFFICIENT EVIDENCE",
            "reason": "Document type could not be confidently identified.",
            "finding": "The text extracted does not match any known document formats (Invoice, Receipt, Certificate, etc.).",
            "verification": "Unverified.",
            "action": "Please clarify what this document represents or upload a clearer image."
        }

    findings = []
    recommendations = []
    verification_gaps = []

    # 1. CERTIFICATE CHECKS
    if doc_type == "certificate":
        placeholders = ["your name", "insert name", "john doe", "astrophizzicks"]
        if any(p in text.lower() for p in placeholders):
            findings.append("Document contains placeholder text (e.g., 'Your Name') or unusual titles.")
            recommendations.append("Do not rely on this certificate. Contact the issuing institution directly.")
        else:
            recommendations.append("Check the institution's official registry to verify the award.")
        verification_gaps.append("Issuer authenticity has NOT been verified against an official registry.")

    # 2. INVOICE CHECKS
    elif doc_type == "invoice":
        amounts = extract_amounts(text)
        if len(amounts) >= 2:
            findings.append(f"Detected multiple financial amounts. Please manually verify totals: {amounts[-3:]}")
        recommendations.append("Confirm the payment in your own banking app before releasing goods.")
        verification_gaps.append("Supplier banking details and payment settlement are UNVERIFIED.")

    # 3. SUPPLIER CHANGE CHECKS
    elif doc_type == "supplier_change":
        findings.append("The document requests a change of banking details, which is a high-risk action.")
        recommendations.append("Call the supplier using a previously known phone number to confirm.")
        verification_gaps.append("The sender's identity has NOT been verified.")

    # 4. PAYMENT CHECKS
    elif doc_type == "payment":
        from app.engine.evaluate import evaluate_payment_proof
        verdict = evaluate_payment_proof(text, "investigator_hash")
        
        status_map = {"MATCH": "CONSISTENT", "WAIT": "REVIEW REQUIRED", "STOP": "SUSPICIOUS"}
        findings.append(verdict.reason_codes[0].description)
        recommendations.append(verdict.recommended_action)
        verification_gaps.append("Bank settlement is unverified. Only your banking app can confirm this.")
        
        if ai_insights:
            findings.append(ai_insights.get("summary", "AI analysis complete."))
            recommendations.extend(ai_insights.get("recommendations", []))

    # Combine deterministic findings with AI (if available)
    return {
        "status": "REVIEW REQUIRED" if findings else "CONSISTENT",
        "reason": f"Document classified as: {doc_type.capitalize()}",
        "finding": " ".join(findings) if findings else "Document structure looks standard.",
        "verification": " ".join(verification_gaps) if verification_gaps else "Verified.",
        "action": " ".join(recommendations) if recommendations else "Proceed with standard caution."
    }