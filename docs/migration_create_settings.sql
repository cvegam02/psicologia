-- Migration: Create settings table
-- This table stores encrypted or sensitive app-wide configurations.

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only owners can see and manage settings
CREATE POLICY "Owners can manage all settings" 
ON public.settings 
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Seed initial records if needed
INSERT INTO public.settings (key, value)
VALUES 
    ('whatsapp_config', '{"phone_id": "", "token": "", "test_number": ""}'::jsonb),
    ('general_config', '{"clinic_name": "Ana López", "specialty": "Psicología Clínica"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
