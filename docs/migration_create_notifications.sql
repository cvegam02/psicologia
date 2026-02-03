-- Migration: Create notifications table
-- This table tracks automated WhatsApp reminders sent to patients.

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'whatsapp_reminder',
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, read
    sent_at TIMESTAMP WITH TIME ZONE,
    provider_message_id TEXT, -- ID from WhatsApp/Twilio/Kapso
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for scanning pending appointments
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies: Owners and Psychologists can view notifications
CREATE POLICY "Owners and Psychologists can view notifications" 
ON notifications FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'owner' OR profiles.role = 'psychologist')
    )
);
