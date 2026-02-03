-- Create psychologist_schedules table
CREATE TABLE IF NOT EXISTS public.psychologist_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    psychologist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '20:00:00',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(psychologist_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.psychologist_schedules ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone authenticated can view schedules (needed for scheduling by anyone)
DROP POLICY IF EXISTS "Schedules are viewable by authenticated users." ON public.psychologist_schedules;
CREATE POLICY "Schedules are viewable by authenticated users." ON public.psychologist_schedules
FOR SELECT TO authenticated USING (true);

-- 2. Only Owners can manage schedules
DROP POLICY IF EXISTS "Owners can manage all schedules." ON public.psychologist_schedules;
CREATE POLICY "Owners can manage all schedules." ON public.psychologist_schedules
FOR ALL TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Seed some default schedules for existing profiles if needed
-- This is optional but helpful to ensure there's always a baseline
INSERT INTO public.psychologist_schedules (psychologist_id, day_of_week, start_time, end_time)
SELECT p.id, d.day, '08:00:00', '20:00:00'
FROM public.profiles p
CROSS JOIN (SELECT generate_series(1, 5) AS day) d -- Mon-Fri
WHERE p.role IN ('psychologist', 'owner')
ON CONFLICT DO NOTHING;
