-- Migration: Add status column to patients table
-- This is required because the frontend now tracks patient status (Active/Inactive) for KPIs.

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='status') THEN
        ALTER TABLE patients ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;
