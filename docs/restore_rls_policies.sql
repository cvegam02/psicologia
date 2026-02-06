-- ========================================================
-- RESTAURACIÓN DE POLÍTICAS RLS (POST-MIGRACIÓN DE ROLES)
-- ========================================================
-- Este script restaura las políticas de seguridad para todas las tablas
-- asegurando que se use el nuevo rol 'assistant' en lugar de 'receptionist'.

-- 1. Asegurar que RLS esté activado en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_schedules ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas existentes para evitar duplicados (Opcional si usas DROP)
-- El script update_roles.sql ya hizo un DROP masivo, así que esto es por seguridad.

-- --------------------------------------------------------
-- TABLA: profiles (Ya restaurada por update_roles, pero la incluimos por completitud)
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Own profile update" ON public.profiles;
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --------------------------------------------------------
-- TABLA: patients
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Owner can see all patients." ON public.patients;
CREATE POLICY "Owner can see all patients." ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

DROP POLICY IF EXISTS "Psychologist can see own patients." ON public.patients;
CREATE POLICY "Psychologist can see own patients." ON public.patients FOR SELECT USING (
  psychologist_id = auth.uid()
);

DROP POLICY IF EXISTS "Assistant can see all patients." ON public.patients;
CREATE POLICY "Assistant can see all patients." ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'assistant')
);

DROP POLICY IF EXISTS "Psychologist can insert own patients." ON public.patients;
CREATE POLICY "Psychologist can insert own patients." ON public.patients FOR INSERT WITH CHECK (
  psychologist_id = auth.uid()
);

DROP POLICY IF EXISTS "Assistant can insert patients." ON public.patients;
CREATE POLICY "Assistant can insert patients." ON public.patients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'assistant')
);

-- --------------------------------------------------------
-- TABLA: appointments
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Owner can manage all appointments." ON public.appointments;
CREATE POLICY "Owner can manage all appointments." ON public.appointments USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

DROP POLICY IF EXISTS "Psychologist can manage own appointments." ON public.appointments;
CREATE POLICY "Psychologist can manage own appointments." ON public.appointments USING (
  psychologist_id = auth.uid()
) WITH CHECK (
  psychologist_id = auth.uid()
);

DROP POLICY IF EXISTS "Assistant can view all appointments." ON public.appointments;
CREATE POLICY "Assistant can view all appointments." ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'assistant')
);

DROP POLICY IF EXISTS "Assistant can create appointments." ON public.appointments;
CREATE POLICY "Assistant can create appointments." ON public.appointments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'assistant')
);

DROP POLICY IF EXISTS "Assistant can update appointments." ON public.appointments;
CREATE POLICY "Assistant can update appointments." ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'assistant')
);

-- --------------------------------------------------------
-- TABLA: clinical_notes
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Owner can see all notes." ON public.clinical_notes;
CREATE POLICY "Owner can see all notes." ON public.clinical_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

DROP POLICY IF EXISTS "Psychologist can see own notes." ON public.clinical_notes;
CREATE POLICY "Psychologist can see own notes." ON public.clinical_notes FOR SELECT USING (
  psychologist_id = auth.uid()
);

DROP POLICY IF EXISTS "Psychologist can manage own notes." ON public.clinical_notes;
CREATE POLICY "Psychologist can manage own notes." ON public.clinical_notes FOR ALL USING (
  psychologist_id = auth.uid()
) WITH CHECK (
  psychologist_id = auth.uid()
);

-- --------------------------------------------------------
-- TABLA: psychologist_schedules
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Schedules are viewable by authenticated users." ON public.psychologist_schedules;
CREATE POLICY "Schedules are viewable by authenticated users." ON public.psychologist_schedules 
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Owners can manage all schedules." ON public.psychologist_schedules;
CREATE POLICY "Owners can manage all schedules." ON public.psychologist_schedules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);
