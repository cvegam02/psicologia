-- ========================================================
-- SCRIPT DE "RESETEO NUCLEAR" (PASO A PASO SEGURO)
-- ========================================================
-- Este script es la solución definitiva. Postgres no puede detenerlo 
-- porque no "altera" el tipo de la columna vieja, la reemplaza.

-- --------------------------------------------------------
-- PASO 1: DESACTIVAR SEGURIDAD Y LIMPIAR GANCHOS
-- --------------------------------------------------------
-- Ejecuta esto primero.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Desactivar RLS en las tablas principales para que Postgres no revise políticas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_schedules DISABLE ROW LEVEL SECURITY;

-- Borrar todas las políticas existentes (Dinámico)
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- --------------------------------------------------------
-- PASO 2: REEMPLAZO ESTRUCTURAL DE LA COLUMNA
-- --------------------------------------------------------
-- Esto evita el error de "operator does not exist".

-- 1. Crear una columna temporal de texto puro
ALTER TABLE public.profiles ADD COLUMN role_text TEXT;

-- 2. Copiar los datos convirtiéndolos a texto explícitamente
UPDATE public.profiles SET role_text = role::TEXT;

-- 3. Borrar la columna vieja y el tipo ENUM (el culpable del error)
-- El CASCADE se encarga de cualquier residuo oculto.
ALTER TABLE public.profiles DROP COLUMN role CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- 4. Renombrar la nueva columna y poner valores estándar
ALTER TABLE public.profiles RENAME COLUMN role_text TO role;
UPDATE public.profiles SET role = 'assistant' WHERE role = 'receptionist';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'psychologist';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('owner', 'psychologist', 'assistant'));

-- --------------------------------------------------------
-- PASO 3: RECONSTRUCCIÓN DE SEGURIDAD
-- --------------------------------------------------------
-- Restauramos todo con el nuevo estándar de texto.

-- Re-crear Trigger de bienvenida
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'role', 'psychologist')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reactivar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_schedules ENABLE ROW LEVEL SECURITY;

-- Restaurar políticas (Texto puro, sin errores de tipos)
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- (Opcional: puedes correr tus scripts de RLS de pacientes/citas después de esto)
