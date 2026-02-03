-- Migration: Create profiles table and Auth triggers
-- This table stores additional user information linked to Supabase Auth.

-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('owner', 'psychologist', 'receptionist')) DEFAULT 'psychologist',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Profiles are viewable by everyone in the system
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Create a trigger to automatically create a profile when a new user signs up
-- This function will be called by the trigger. 
-- SECURITY DEFINER and explicit search_path are best practices for Supabase triggers.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'role', 'psychologist')
  );
  RETURN new;
END;
$$;

-- The trigger itself
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper function to set the first user as 'owner'
-- EXECUTE THIS NOW WITH YOUR UID:
INSERT INTO public.profiles (id, full_name, role)
VALUES ('63bb71bc-73fd-4824-9335-0389a0f6222d', 'Administrador', 'owner')
ON CONFLICT (id) DO UPDATE SET role = 'owner';
