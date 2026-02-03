-- Migration: Repair Appointment Status Constraint
-- Fixes error 23514 (check constraint violation) when confirming appointments.

DO $$ 
BEGIN 
    -- 1. Ensure the status column has the updated check constraint
    -- Drop the existing one to avoid duplicates or outdated lists
    ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

    -- 2. Add the comprehensive constraint including 'confirmed' and 'rescheduled'
    ALTER TABLE public.appointments 
    ADD CONSTRAINT appointments_status_check 
    CHECK (status IN ('scheduled', 'confirmed', 'attended', 'no_show', 'cancelled', 'rescheduled'));

    -- 3. Ensure defaults and clean up any stray legacy statuses
    ALTER TABLE public.appointments ALTER COLUMN status SET DEFAULT 'scheduled';
    UPDATE public.appointments SET status = 'scheduled' WHERE status = 'pending';
    
END $$;

-- Refresh cache for PostgREST
NOTIFY pgrst, 'reload schema';
