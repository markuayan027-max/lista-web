-- TESDA Form Migration for LISTA
-- Add all missing TESDA-required fields to enrollments table

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS extension_name TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Filipino';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS client_type TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS qualification_type TEXT DEFAULT 'Full Qualification';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS is_ip BOOLEAN DEFAULT FALSE;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS indigenous_group TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS telephone TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS mobile_number TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS barangay TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Region X — Northern Mindanao';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS zip_code TEXT DEFAULT '9014';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS year_graduated TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS employment_type TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS other_trainings JSONB DEFAULT '[]';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS licensure_exams JSONB DEFAULT '[]';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS competency_assessments JSONB DEFAULT '[]';

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'New Enrollee';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS consent BOOLEAN DEFAULT FALSE;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS document_status TEXT DEFAULT 'missing';
