-- HEAL & SEED Script (V2)
-- This script fixes multiple legacy constraints and populates the database.

-- 1. FIX: Handle multiple legacy columns in 'appointments'
DO $$ 
BEGIN 
    -- Handling 'client_id' (from previous error)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='client_id') THEN
        ALTER TABLE public.appointments ALTER COLUMN client_id DROP NOT NULL;
    END IF;

    -- Handling 'date_time' (from current error)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='date_time') THEN
        ALTER TABLE public.appointments ALTER COLUMN date_time DROP NOT NULL;
    END IF;

    -- Ensuring 'scheduled_at' exists as our primary timing column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='scheduled_at') THEN
        ALTER TABLE public.appointments ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Ensuring 'patient_id' exists and is correctly linked
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='patient_id') THEN
        ALTER TABLE public.appointments ADD COLUMN patient_id UUID REFERENCES public.patients(id);
    END IF;
END $$;

-- 2. SEED: Cleanup (Careful with existing data)
-- We use TRUNCATE CASCADE to clean all relevant tables safely
TRUNCATE public.clinical_notes, public.appointments, public.patients CASCADE;

-- 3. SEED: Insert Sample Patients
-- Using your Owner ID: '63bb71bc-73fd-4824-9335-0389a0f6222d'
INSERT INTO public.patients (id, psychologist_id, full_name, email, phone, address, birth_date)
VALUES 
    (uuid_generate_v4(), '63bb71bc-73fd-4824-9335-0389a0f6222d', 'Carlos Rodríguez', 'carlos.rod@ejemplo.com', '+525512345678', 'Av. Reforma 123, CDMX', '1985-05-15'),
    (uuid_generate_v4(), '63bb71bc-73fd-4824-9335-0389a0f6222d', 'Marta Sánchez', 'marta.s@ejemplo.com', '+525587654321', 'Colonia Roma Norte, CDMX', '1992-10-20'),
    (uuid_generate_v4(), '63bb71bc-73fd-4824-9335-0389a0f6222d', 'Roberto Gómez', 'roberto.g@ejemplo.com', '+525555555555', 'Polanco II Secc, CDMX', '1978-03-30');

-- 4. SEED: Insert Sample Appointments
-- Today AM
INSERT INTO public.appointments (patient_id, psychologist_id, scheduled_at, status, notes)
SELECT id, psychologist_id, (current_date + time '10:00:00'), 'scheduled', 'Sesión de seguimiento semanal'
FROM public.patients WHERE full_name = 'Carlos Rodríguez';

-- Today PM
INSERT INTO public.appointments (patient_id, psychologist_id, scheduled_at, status, notes)
SELECT id, psychologist_id, (current_date + time '16:00:00'), 'scheduled', 'Primera entrevista - Evaluación'
FROM public.patients WHERE full_name = 'Marta Sánchez';

-- Tomorrow
INSERT INTO public.appointments (patient_id, psychologist_id, scheduled_at, status, notes)
SELECT id, psychologist_id, (current_date + interval '1 day' + time '11:00:00'), 'scheduled', 'Terapia cognitiva conductual'
FROM public.patients WHERE full_name = 'Roberto Gómez';

-- 5. SEED: Insert Clinical Note
INSERT INTO public.clinical_notes (patient_id, psychologist_id, content, session_date, tags)
SELECT id, psychologist_id, 'El paciente muestra avances significativos. Se recomienda continuar con el plan actual.', current_date - interval '7 days', ARRAY['seguimiento']
FROM public.patients WHERE full_name = 'Carlos Rodríguez';
