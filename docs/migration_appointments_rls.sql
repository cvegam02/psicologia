-- Add RLS Policies for Appointments Table

-- 1. Owner can do everything with appointments
CREATE POLICY "Owner can manage all appointments." ON appointments
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- 2. Psychologist can view and manage their own appointments
CREATE POLICY "Psychologist can manage own appointments." ON appointments
USING (
  psychologist_id = auth.uid()
)
WITH CHECK (
  psychologist_id = auth.uid()
);

-- 3. Receptionist can view ALL appointments (to manage schedule)
CREATE POLICY "Receptionist can view all appointments." ON appointments
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'receptionist')
);

-- 4. Receptionist can create appointments (usually for any doctor)
CREATE POLICY "Receptionist can create appointments." ON appointments
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'receptionist')
);

-- 5. Receptionist can update appointments (re-schedule, cancel)
CREATE POLICY "Receptionist can update appointments." ON appointments
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'receptionist')
);
