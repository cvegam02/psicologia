from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.whatsapp import whatsapp_service
import asyncio

load_dotenv()

app = FastAPI(title="PsicologIA API")

# Supabase Configuration
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Scheduler
scheduler = AsyncIOScheduler()

async def check_upcoming_reminders():
    """
    Scans appointments for the next 24-48 hours and sends reminders 
    if a notification hasn't been sent yet.
    """
    print(f"[{datetime.now()}] Scanning for reminders...")
    try:
        # Get appointments scheduled for tomorrow
        tomorrow = datetime.now() + timedelta(days=1)
        start_time = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        end_time = tomorrow.replace(hour=23, minute=59, second=59, microsecond=999)

        # Query appointments with patient info and joined notifications
        # Note: We filter for appointments that DON'T have a 'whatsapp_reminder' notification yet
        response = supabase.table("appointments").select(
            "*, patients(full_name, phone)"
        ).gte("scheduled_at", start_time.isoformat()).lte("scheduled_at", end_time.isoformat()).execute()

        appointments = response.data or []
        
        for appt in appointments:
            patient = appt.get("patients")
            if not patient or not patient.get("phone"):
                continue

            # Check if already sent
            notif_check = supabase.table("notifications").select("id").eq("appointment_id", appt["id"]).eq("type", "whatsapp_reminder").execute()
            if notif_check.data:
                continue

            # Send reminder
            time_str = datetime.fromisoformat(appt["scheduled_at"]).strftime("%I:%M %p")
            result = await whatsapp_service.send_reminder(
                to_phone=patient["phone"],
                patient_name=patient["full_name"],
                appt_time=time_str
            )

            # Log notification
            supabase.table("notifications").insert({
                "appointment_id": appt["id"],
                "status": "sent" if result["status"] == "sent" or result["status"] == "mock_sent" else "failed",
                "provider_message_id": result.get("message_id"),
                "error_message": result.get("error"),
                "sent_at": datetime.now().isoformat()
            }).execute()

    except Exception as e:
        print(f"Error in background worker: {e}")

@app.on_event("startup")
async def startup_event():
    scheduler.add_job(check_upcoming_reminders, 'interval', minutes=60) # Scan every hour
    scheduler.start()
    print("Scheduler started...")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

class PatientCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[str] = None
    psychologist_id: str

@app.get("/")
async def root():
    return {"message": "PsicologIA API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Patient Endpoints
@app.get("/patients", response_model=List[dict])
async def get_patients(psychologist_id: Optional[str] = None):
    query = supabase.table("patients").select("*")
    if psychologist_id:
        query = query.eq("psychologist_id", psychologist_id)
    
    response = query.execute()
    return response.data

from services.admin import admin_service

# ... (rest of imports)

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str

class SettingsUpdate(BaseModel):
    key: str
    value: Dict[str, Any]

# Admin Endpoints (Owner only)
# TODO: Add real RBAC check via JWT middleware. 
# For now, we assume the frontend only calls these if the user is an owner.

@app.post("/admin/users")
async def create_user(user: UserCreate):
    result = await admin_service.create_user(
        user.email, user.password, user.full_name, user.role
    )
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: str):
    result = await admin_service.delete_user(user_id)
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.get("/settings")
async def get_settings():
    response = supabase.table("settings").select("*").execute()
    return response.data

@app.post("/settings")
async def update_settings(setting: SettingsUpdate):
    response = supabase.table("settings").upsert({
        "key": setting.key,
        "value": setting.value,
        "updated_at": datetime.now().isoformat()
    }).execute()
    return response.data
