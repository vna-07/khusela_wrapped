from datetime import datetime

# Empty list to start. We will seed demo logs dynamically.
AUDIT_LOGS = []

def add_audit_log(channel: str, sender: str, event_type: str, description: str, context: str, status: str = "info", is_demo: bool = False):
    log = {
        "id": f"aud-{len(AUDIT_LOGS) + 1}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "channel": channel,
        "sender": sender,
        "event_type": event_type,
        "description": description,
        "context": context,
        "status": status,
        "is_demo": is_demo
    }
    AUDIT_LOGS.insert(0, log) # Newest first
    return log

def get_audit_logs(is_demo: bool = False):
    # Seed the demo log once if it doesn't exist
    if is_demo and not any(log.get("is_demo") for log in AUDIT_LOGS):
        AUDIT_LOGS.append({
            "id": "aud-demo-1",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "channel": "Web Dashboard",
            "sender": "Thabo",
            "event_type": "Payment Check",
            "description": "Checked R2,450 proof of payment",
            "context": "Verdict: WAIT · Amount mismatch",
            "status": "warning",
            "is_demo": True
        })

    # Filter logs based on whether the user is in demo mode or not
    return [log for log in AUDIT_LOGS if log.get("is_demo") == is_demo]