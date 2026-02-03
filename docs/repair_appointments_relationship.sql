-- Migration: Repair Relationship between Appointments and Patients
-- This script ensures the foreign key exists and refreshes the PostgREST cache.

-- 1. Ensure the foreign key exists
DO $$ 
BEGIN 
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
END $$;

-- 2. Force a schema cache refresh
-- This tells PostgREST to reload the schema information
NOTIFY pgrst, 'reload schema';

-- 3. Verify joined data works (you can run this in the SQL editor)
-- SELECT a.*, p.full_name 
-- FROM appointments a 
-- JOIN patients p ON a.patient_id = p.id 
-- LIMIT 5;
