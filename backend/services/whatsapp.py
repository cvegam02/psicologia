import os
import httpx
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class WhatsAppService:
    """
    Service to handle WhatsApp notifications via WhatsApp Business API (Meta), Twilio, or Kapso.
    Currently defaults to a mock/logger implementation until credentials are provided.
    """
    
    def __init__(self):
        self.whatsapp_token = os.environ.get("WHATSAPP_TOKEN")
        self.phone_number_id = os.environ.get("WHATSAPP_PHONE_ID")
        self.api_url = f"https://graph.facebook.com/v18.0/{self.phone_number_id}/messages" if self.phone_number_id else None

    async def send_reminder(self, to_phone: str, patient_name: str, appt_time: str) -> Dict[str, Any]:
        """
        Sends a professional reminder message.
        """
        message_body = (
            f"Hola {patient_name}, te recordamos tu cita con la Psic. Ana López "
            f"programada para el {appt_time}. \n\n"
            "Por favor, confirma tu asistencia respondiendo a este mensaje. ¡Te esperamos!"
        )

        if not self.api_url or not self.whatsapp_token:
            print(f"[MOCK WHATSAPP] To: {to_phone} | Message: {message_body}")
            return {"status": "mock_sent", "message_id": "mock_123"}

        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": "text",
            "text": {"body": message_body}
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.api_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                return {"status": "sent", "message_id": data.get("messages", [{}])[0].get("id")}
            except Exception as e:
                print(f"Error sending WhatsApp: {e}")
                return {"status": "failed", "error": str(e)}

whatsapp_service = WhatsAppService()
