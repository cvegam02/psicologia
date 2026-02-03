-- Seed Data for psicologIA
-- This script populates the database with sample data for testing.
-- IMPORTANT: Replace '63bb71bc-73fd-4824-9335-0389a0f6222d' with your real User ID if it's different.

-- 1. Insert Sample Patients
INSERT INTO public.patients (id, psychologist_id, full_name, email, phone, address, birth_date)
VALUES 
    (uuid_generate_v4(), '63bb71bc-73fd-4824-9335-0389a0f6222d', 'Carlos Rodríguez', 'carlos.rod@ejemplo.com', '+525512345678', 'Av. Reforma 123, CDMX', '1985-05-15'),
    (uuid_generate_v4(), '63bb71bc-73fd-4824-9335-0389a0f6222d', 'Marta Sánchez', 'marta.s@ejemplo.com', '+525587654321', 'Colonia Roma Norte, CDMX', '1992-10-20'),
    (uuid_generate_v4(), '63bb71bc-73fd-4824-9335-0389a0f6222d', 'Roberto Gómez', 'roberto.g@ejemplo.com', '+525555555555', 'Polanco II Secc, CDMX', '1978-03-30')
ON CONFLICT DO NOTHING;

-- 2. Insert Sample Appointments
-- Using current_date to ensure they show up in the "Today" dashboard
-- Appointment 1: Today, 1 hour from now
INSERT INTO public.appointments (patient_id, psychologist_id, scheduled_at, status, notes)
SELECT 
    id as patient_id, 
    psychologist_id, 
    (current_date + interval '10 hours') as scheduled_at, 
    'scheduled' as status,
    'Sesión de seguimiento semanal' as notes
FROM public.patients 
WHERE full_name = 'Carlos Rodríguez'
LIMIT 1;

-- Appointment 2: Today, 2 hours from now
INSERT INTO public.appointments (patient_id, psychologist_id, scheduled_at, status, notes)
SELECT 
    id as patient_id, 
    psychologist_id, 
    (current_date + interval '14 hours') as scheduled_at, 
    'scheduled' as status,
    'Primera entrevista - Evaluación' as notes
FROM public.patients 
WHERE full_name = 'Marta Sánchez'
LIMIT 1;

-- Appointment 3: Tomorrow
INSERT INTO public.appointments (patient_id, psychologist_id, scheduled_at, status, notes)
SELECT 
    id as patient_id, 
    psychologist_id, 
    (current_date + interval '1 day' + interval '11 hours') as scheduled_at, 
    'scheduled' as status,
    'Terapia cognitiva conductual' as notes
FROM public.patients 
WHERE full_name = 'Roberto Gómez'
LIMIT 1;

-- 3. Insert Clinical Notes
INSERT INTO public.clinical_notes (patient_id, psychologist_id, content, session_date, tags)
SELECT 
    id as patient_id, 
    psychologist_id, 
    'El paciente muestra avances significativos en el manejo de la ansiedad. Se recomienda continuar con los ejercicios de respiración.' as content,
    current_date - interval '7 days' as session_date,
    ARRAY['avancé', 'seguimiento'] as tags
FROM public.patients 
WHERE full_name = 'Carlos Rodríguez'
LIMIT 1;

-- Verification query:
-- SELECT p.full_name, a.scheduled_at, a.status 
-- FROM patients p 
-- JOIN appointments a ON p.id = a.patient_id;
