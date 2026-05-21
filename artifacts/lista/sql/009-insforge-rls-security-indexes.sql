-- LISTA NANO (InsForge) — RLS hardening + FK indexes
-- Apply: InsForge SQL editor or MCP run-raw-sql
-- Does NOT disable RLS. Revokes open anon access on legacy booking `users` table.

-- ── Helpers (idempotent) ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.jwt_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'trainee'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.jwt_role() IN ('admin', 'staff');
$$;

-- ── Legacy booking `users` (not lms_users_legacy): remove permissive anon ALL ─
DROP POLICY IF EXISTS anon_auth_users ON public.users;

-- ── Tables with RLS OFF → enable + staff-scoped policies ───────────────────
ALTER TABLE public.course_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS course_batches_select_all ON public.course_batches;
DROP POLICY IF EXISTS course_batches_write_staff ON public.course_batches;
CREATE POLICY course_batches_select_all ON public.course_batches
  FOR SELECT USING (true);
CREATE POLICY course_batches_write_staff ON public.course_batches
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS cases_staff_all ON public.cases;
CREATE POLICY cases_staff_all ON public.cases
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS categories_select_all ON public.categories;
DROP POLICY IF EXISTS categories_write_staff ON public.categories;
CREATE POLICY categories_select_all ON public.categories
  FOR SELECT USING (true);
CREATE POLICY categories_write_staff ON public.categories
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS incidents_staff_all ON public.incidents;
DROP POLICY IF EXISTS incidents_select_own ON public.incidents;
CREATE POLICY incidents_staff_all ON public.incidents
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY incidents_select_own ON public.incidents
  FOR SELECT USING (
    public.is_staff_or_admin()
    OR student_id IN (
      SELECT id FROM public.lms_users_legacy
      WHERE email = lower(auth.jwt() ->> 'email')
    )
  );

-- ── SELECT-only tables → add staff write policies ───────────────────────────
DROP POLICY IF EXISTS faqs_write_staff ON public.faqs;
CREATE POLICY faqs_write_staff ON public.faqs
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS testimonials_write_staff ON public.testimonials;
CREATE POLICY testimonials_write_staff ON public.testimonials
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS courses_write_staff ON public.lms_courses_legacy;
CREATE POLICY courses_write_staff ON public.lms_courses_legacy
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- ── lms_users_legacy: trainee read self; admin manage ───────────────────────
DROP POLICY IF EXISTS users_insert_own ON public.lms_users_legacy;
CREATE POLICY users_insert_own ON public.lms_users_legacy
  FOR INSERT WITH CHECK (email = lower(auth.jwt() ->> 'email') OR public.is_staff_or_admin());

DROP POLICY IF EXISTS users_update_own ON public.lms_users_legacy;
CREATE POLICY users_update_own ON public.lms_users_legacy
  FOR UPDATE
  USING (email = lower(auth.jwt() ->> 'email') OR public.is_staff_or_admin())
  WITH CHECK (email = lower(auth.jwt() ->> 'email') OR public.is_staff_or_admin());

-- ── FK indexes (IF NOT EXISTS) ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements (created_by);
CREATE INDEX IF NOT EXISTS idx_schedules_created_by ON public.schedules (created_by);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services (category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings (service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_technician_id ON public.bookings (technician_id);
CREATE INDEX IF NOT EXISTS idx_lms_enrollments_legacy_batch_id ON public.lms_enrollments_legacy (batch_id);
CREATE INDEX IF NOT EXISTS idx_lms_users_legacy_enrollment_id ON public.lms_users_legacy (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_course_batches_created_by ON public.course_batches (created_by);
