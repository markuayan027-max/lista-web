-- Multi-enrollment lifecycle + TESDA NC sent tracking
-- Run on InsForge/Postgres before deploying API changes.

ALTER TABLE lms_enrollments_legacy
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE lms_enrollments_legacy
  ADD COLUMN IF NOT EXISTS cycle_number integer NOT NULL DEFAULT 1;

ALTER TABLE lms_enrollments_legacy
  ADD COLUMN IF NOT EXISTS previous_enrollment_id uuid NULL;

ALTER TABLE lms_enrollments_legacy
  ADD COLUMN IF NOT EXISTS tesda_nc_sent_at timestamptz NULL;

ALTER TABLE lms_enrollments_legacy
  ADD COLUMN IF NOT EXISTS tesda_nc_sent_by uuid NULL;

ALTER TABLE lms_enrollments_legacy
  ADD COLUMN IF NOT EXISTS tesda_nc_note text NULL;

ALTER TABLE lms_enrollments_legacy
  ADD COLUMN IF NOT EXISTS placement_type text NULL;

-- Backfill: existing rows are cycle 1 and active unless terminal
UPDATE lms_enrollments_legacy
SET cycle_number = 1
WHERE cycle_number IS NULL OR cycle_number < 1;

UPDATE lms_enrollments_legacy
SET is_active = false
WHERE is_active = true
  AND status IN ('Completed', 'Cancelled', 'Rejected')
  AND tesda_nc_sent_at IS NOT NULL;

UPDATE lms_enrollments_legacy
SET is_active = true
WHERE is_active IS NULL;

CREATE INDEX IF NOT EXISTS enrollment_email_active_idx
  ON lms_enrollments_legacy (email, is_active);

CREATE INDEX IF NOT EXISTS enrollment_email_cycle_idx
  ON lms_enrollments_legacy (email, cycle_number DESC);

-- At most one active enrollment per email
CREATE UNIQUE INDEX IF NOT EXISTS enrollment_one_active_per_email_idx
  ON lms_enrollments_legacy (lower(email))
  WHERE is_active = true;
