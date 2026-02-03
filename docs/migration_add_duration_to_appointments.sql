-- Migration: Add duration column to appointments table
-- Therapy sessions can have different lengths (e.g., 30, 45, 60 mins).

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='duration') THEN
        ALTER TABLE appointments ADD COLUMN duration INTEGER DEFAULT 60;
    END IF;
END $$;
