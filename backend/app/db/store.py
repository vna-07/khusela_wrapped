from datetime import datetime

# In a real production app, this would be your Turso/Postgres database
AUDIT_LOGS = [
    {
        "id": "aud-1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "channel": "Web Dashboard",
        "sender": "Thabo",
        "event_type": "Payment Check",
        "description": "Checked R2,450 proof of payment",
        "context": "Verdict: WAIT · Amount mismatch",
        "status": "warning"
    }
]

def add_audit_log(channel: str, sender: str, event_type: str, description: str, context: str, status: str = "info"):
    log = {
        "id": f"aud-{len(AUDIT_LOGS) + 1}",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "channel": channel,
        "sender": sender,
        "event_type": event_type,
        "description": description,
        "context": context,
        "status": status
    }
    AUDIT_LOGS.insert(0, log) # Newest first
    return log

def get_audit_logs():
    return AUDIT_LOGS