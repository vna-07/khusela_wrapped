import requests
import time

URL = "http://localhost:8000/api/v1/webhooks/whatsapp"


def send_whatsapp_message(phone, text, label=""):
    """Simulate a Twilio WhatsApp inbound message (form-encoded Body + From)."""
    data = {
        "Body": text,
        "From": f"whatsapp:{phone}",
    }

    tag = f" [{label}]" if label else ""
    print(f"\n📱 {phone}{tag}: '{text}'")
    try:
        response = requests.post(URL, data=data, timeout=5)
        print(f"✅ {response.status_code}")
        # Print the TwiML message body, not the whole XML wrapper
        body = response.text
        start = body.find("<Message>") + len("<Message>")
        end = body.find("</Message>")
        if start > 9 and end > start:
            print(f"   → {body[start:end]}")
        else:
            print(f"   → {body}")
    except Exception as e:
        print(f"❌ Error: {e}. Is your backend running?")
    time.sleep(1)


if __name__ == "__main__":
    print("=" * 60)
    print("DEMO 1 — Fraudulent payment proof (network alert path)")
    print("=" * 60)

    # Phone A: walks the full state machine to a payment check
    phone_a = "27821234567"
    send_whatsapp_message(phone_a, "Thabo", label="1/4 name")
    send_whatsapp_message(phone_a, "1234", label="2/4 passcode")
    send_whatsapp_message(phone_a, "1", label="3/4 menu → check payment")
    send_whatsapp_message(
        phone_a,
        "Hi, I paid the R2450 for the sneakers. Here is the proof. Payment is pending.",
        label="4/4 payment text",
    )

    print("\n" + "=" * 60)
    print("DEMO 2 — Phishing message (message scan path)")
    print("=" * 60)

    # Phone B: separate session, walks to a message scan
    phone_b = "27829876543"
    send_whatsapp_message(phone_b, "Sipho", label="1/4 name")
    send_whatsapp_message(phone_b, "1234", label="2/4 passcode")
    send_whatsapp_message(phone_b, "2", label="3/4 menu → scan message")
    send_whatsapp_message(
        phone_b,
        "URGENT: Your account will be suspended. Click this link to verify: http://fake-bank.co.za",
        label="4/4 phishing text",
    )

    print("\n" + "=" * 60)
    print("Logs →  http://localhost:8000/api/v1/audit-logs")
    print("=" * 60)