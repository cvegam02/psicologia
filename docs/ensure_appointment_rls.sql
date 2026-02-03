-- Migration: Ensure RLS Policies for Appointments Table
-- Use this if you are unable to update appointment statuses from the UI.
-- This script ensures psychologists can manage their own appointments.

-- 1. Enable RLS (if not already enabled)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (clean slate)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Owner can manage all appointments." ON public.appointments;
    DROP POLICY IF EXISTS "Psychologist can manage own appointments." ON public.appointments;
    DROP POLICY IF EXISTS "Receptionist can view all appointments." ON public.appointments;
    DROP POLICY IF EXISTS "Receptionist can create appointments." ON public.appointments;
    DROP POLICY IF EXISTS "Receptionist can update appointments." ON public.appointments;
END $$;

-- 3. Owner Policy
CREATE POLICY "Owner can manage all appointments." ON public.appointments
FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- 4. Psychologist Policy (Most important for the reported fix)
CREATE POLICY "Psychologist can manage own appointments." ON public.appointments
FOR ALL
TO authenticated
USING (
  psychologist_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
)
WITH CHECK (
  psychologist_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- 5. Receptionist Policies
CREATE POLICY "Receptionist view policy" ON public.appointments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'receptionist'));

CREATE POLICY "Receptionist insert policy" ON public.appointments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'receptionist'));

CREATE POLICY "Receptionist update policy" ON public.appointments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'receptionist'));

-- Refresh cache
NOTIFY pgrst, 'reload schema';
