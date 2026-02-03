-- 1. Create roles type if not exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'psychologist', 'receptionist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role user_role DEFAULT 'psychologist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ensure "role" column exists in profiles (in case table was created by someone else)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'psychologist';
    END IF;
END $$;

-- 4. Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  psychologist_id UUID REFERENCES profiles(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create clinical_notes table (Expediente)
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  psychologist_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE,
  tags TEXT[], -- initial, follow-up, crisis, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies to avoid conflicts
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
    DROP POLICY IF EXISTS "Owner can see all patients." ON patients;
    DROP POLICY IF EXISTS "Psychologist can see own patients." ON patients;
    DROP POLICY IF EXISTS "Receptionist can see all patients for scheduling." ON patients;
    DROP POLICY IF EXISTS "Psychologist can insert own patients." ON patients;
    DROP POLICY IF EXISTS "Receptionist can insert patients." ON patients;
    DROP POLICY IF EXISTS "Owner can see all notes." ON clinical_notes;
    DROP POLICY IF EXISTS "Psychologist can see own notes." ON clinical_notes;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 9. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- 10. Patients Policies
CREATE POLICY "Owner can see all patients." ON patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Psychologist can see own patients." ON patients FOR SELECT USING (
  psychologist_id = auth.uid()
);
CREATE POLICY "Receptionist can see all patients for scheduling." ON patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'receptionist')
);
CREATE POLICY "Psychologist can insert own patients." ON patients FOR INSERT WITH CHECK (
  psychologist_id = auth.uid()
);
CREATE POLICY "Receptionist can insert patients." ON patients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'receptionist')
);

-- 11. Clinical Notes Policies (Confidential)
CREATE POLICY "Owner can see all notes." ON clinical_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Psychologist can see own notes." ON clinical_notes FOR SELECT USING (
  psychologist_id = auth.uid()
);
