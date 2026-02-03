-- Migration: Robust Repair for Appointments Table
-- This script adds missing columns and ensures relationships are correct.

DO $$ 
BEGIN 
    -- 1. Add patient_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='patient_id') THEN
        ALTER TABLE public.appointments ADD COLUMN patient_id UUID;
    END IF;

    -- 2. Add psychologist_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='psychologist_id') THEN
        ALTER TABLE public.appointments ADD COLUMN psychologist_id UUID;
    END IF;

    -- 3. Add scheduled_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='scheduled_at') THEN
        ALTER TABLE public.appointments ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- 4. Ensure foreign key for patients
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_patient_id_fkey' 
        AND table_name = 'appointments'
    ) THEN
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) REFERENCES public.patients(id) 
        ON DELETE CASCADE;
    END IF;

    -- 5. Ensure foreign key for profiles (psychologists)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'appointments_psychologist_id_fkey' 
        AND table_name = 'appointments'
    ) THEN
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_psychologist_id_fkey 
        FOREIGN KEY (psychologist_id) REFERENCES public.profiles(id) 
        ON DELETE SET NULL;
    END IF;

END $$;

-- 6. Refresh cache
NOTIFY pgrst, 'reload schema';
