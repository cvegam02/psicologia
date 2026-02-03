-- Update Appointment Statuses and Workflow
-- This script ensures the 'status' column supports our new lifecycle.

DO $$ 
BEGIN 
    -- 1. Ensure the status column has a check constraint for the allowed values
    -- First, remove any existing constraint if we had one (optional, but safer)
    ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

    -- 2. Add the new constraint
    ALTER TABLE public.appointments 
    ADD CONSTRAINT appointments_status_check 
    CHECK (status IN ('scheduled', 'confirmed', 'attended', 'no_show', 'cancelled', 'rescheduled'));

    -- 3. Set default status for new appointments
    ALTER TABLE public.appointments ALTER COLUMN status SET DEFAULT 'scheduled';

    -- 4. Update existing 'pending' statuses if any (from old schemas)
    UPDATE public.appointments SET status = 'scheduled' WHERE status = 'pending';
END $$;
