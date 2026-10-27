import requests
import json
import time

URL = "http://localhost:8000/api/v1/webhooks/whatsapp"

def send_whatsapp_message(phone, text):
    payload = {
        "object": "whatsapp_business_account",
        "entry": [{
            "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "changes": [{
                "value": {
                    "messaging_product": "whatsapp",
                    "metadata": {"display_phone_number": "27831234567", "phone_number_id": "PHONE_NUMBER_ID"},
                    "contacts": [{"profile": {"name": "Test User"}, "wa_id": phone}],
                    "messages": [{
                        "from": phone,
                        "id": "wamid.HBgL",
                        "timestamp": str(int(time.time())),
                        "text": {"body": text},
                        "type": "text"
                    }]
                },
                "field": "messages"
            }]
        }]
    }
    
    print(f"\n📱 Sending WhatsApp message from {phone}: '{text}'")
    try:
        response = requests.post(URL, json=payload, timeout=5)
        print(f"✅ Webhook Response: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}. Is your backend running?")

if __name__ == "__main__":
    send_whatsapp_message("27821234567", "Hi, I paid the R2450 for the sneakers. Here is the proof.")
    time.sleep(2)
    send_whatsapp_message("27829876543", "URGENT: Your account will be suspended. Click this link to verify: http://fake-bank.co.za")