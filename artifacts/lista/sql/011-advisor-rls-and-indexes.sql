-- LISTA InsForge — address Backend Advisor issues (RLS + FK indexes)
-- Safe to re-run: every policy is DROP IF EXISTS before CREATE.
-- Apply in InsForge SQL Editor (run entire file) or MCP run-raw-sql.
-- Public catalog tables (courses, FAQs, testimonials) stay readable by anon by design.

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

-- ── Announcements: anon sees broadcast (target=all) only ────────────────────
DROP POLICY IF EXISTS announcements_select_all ON public.announcements;
DROP POLICY IF EXISTS announcements_select_anon ON public.announcements;
DROP POLICY IF EXISTS announcements_select_authenticated ON public.announcements;

CREATE POLICY announcements_select_anon ON public.announcements
  FOR SELECT TO anon
  USING (
    target = 'all'
    AND (publish_at IS NULL OR publish_at <= now())
  );

CREATE POLICY announcements_select_authenticated ON public.announcements
  FOR SELECT TO authenticated
  USING (
    target = 'all'
    OR target = public.jwt_role()
    OR public.is_staff_or_admin()
  );

DROP POLICY IF EXISTS announcements_write_staff ON public.announcements;
DROP POLICY IF EXISTS announcements_insert_staff ON public.announcements;
DROP POLICY IF EXISTS announcements_update_staff ON public.announcements;
DROP POLICY IF EXISTS announcements_delete_staff ON public.announcements;
CREATE POLICY announcements_insert_staff ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_admin());
CREATE POLICY announcements_update_staff ON public.announcements
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY announcements_delete_staff ON public.announcements
  FOR DELETE TO authenticated
  USING (public.is_staff_or_admin());

-- ── Public TVET catalog (intentional anon read for marketing site) ──────────
DROP POLICY IF EXISTS courses_select_all ON public.lms_courses_legacy;
DROP POLICY IF EXISTS lms_courses_public_read ON public.lms_courses_legacy;
CREATE POLICY lms_courses_public_read ON public.lms_courses_legacy
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS faqs_select_all ON public.faqs;
DROP POLICY IF EXISTS faqs_public_read ON public.faqs;
CREATE POLICY faqs_public_read ON public.faqs
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS testimonials_select_all ON public.testimonials;
DROP POLICY IF EXISTS testimonials_public_read ON public.testimonials;
CREATE POLICY testimonials_public_read ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (true);

-- Schedules: needed on public course detail pages
DROP POLICY IF EXISTS schedules_select_all ON public.schedules;
DROP POLICY IF EXISTS schedules_public_read ON public.schedules;
CREATE POLICY schedules_public_read ON public.schedules
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS schedules_write_staff ON public.schedules;
DROP POLICY IF EXISTS schedules_insert_staff ON public.schedules;
DROP POLICY IF EXISTS schedules_update_staff ON public.schedules;
DROP POLICY IF EXISTS schedules_delete_staff ON public.schedules;
CREATE POLICY schedules_insert_staff ON public.schedules
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_admin());
CREATE POLICY schedules_update_staff ON public.schedules
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY schedules_delete_staff ON public.schedules
  FOR DELETE TO authenticated
  USING (public.is_staff_or_admin());

-- ── Categories (legacy booking): staff-only ─────────────────────────────────
DROP POLICY IF EXISTS categories_select_all ON public.categories;
DROP POLICY IF EXISTS categories_write_staff ON public.categories;
DROP POLICY IF EXISTS categories_staff_only ON public.categories;
CREATE POLICY categories_staff_only ON public.categories
  FOR ALL TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- ── Course batches: authenticated app users only (not anonymous) ────────────
DROP POLICY IF EXISTS course_batches_select_all ON public.course_batches;
DROP POLICY IF EXISTS course_batches_select_authenticated ON public.course_batches;
DROP POLICY IF EXISTS course_batches_write_staff ON public.course_batches;
CREATE POLICY course_batches_select_authenticated ON public.course_batches
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY course_batches_insert_staff ON public.course_batches
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_admin());
CREATE POLICY course_batches_update_staff ON public.course_batches
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY course_batches_delete_staff ON public.course_batches
  FOR DELETE TO authenticated
  USING (public.is_staff_or_admin());

-- ── Staff write on catalog tables ───────────────────────────────────────────
DROP POLICY IF EXISTS courses_write_staff ON public.lms_courses_legacy;
DROP POLICY IF EXISTS lms_courses_write_staff ON public.lms_courses_legacy;
DROP POLICY IF EXISTS lms_courses_update_staff ON public.lms_courses_legacy;
DROP POLICY IF EXISTS lms_courses_delete_staff ON public.lms_courses_legacy;
CREATE POLICY lms_courses_write_staff ON public.lms_courses_legacy
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_admin());
CREATE POLICY lms_courses_update_staff ON public.lms_courses_legacy
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY lms_courses_delete_staff ON public.lms_courses_legacy
  FOR DELETE TO authenticated
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS faqs_write_staff ON public.faqs;
DROP POLICY IF EXISTS faqs_insert_staff ON public.faqs;
DROP POLICY IF EXISTS faqs_update_staff ON public.faqs;
DROP POLICY IF EXISTS faqs_delete_staff ON public.faqs;
CREATE POLICY faqs_insert_staff ON public.faqs
  FOR INSERT TO authenticated WITH CHECK (public.is_staff_or_admin());
CREATE POLICY faqs_update_staff ON public.faqs
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY faqs_delete_staff ON public.faqs
  FOR DELETE TO authenticated USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS testimonials_write_staff ON public.testimonials;
DROP POLICY IF EXISTS testimonials_insert_staff ON public.testimonials;
DROP POLICY IF EXISTS testimonials_update_staff ON public.testimonials;
DROP POLICY IF EXISTS testimonials_delete_staff ON public.testimonials;
CREATE POLICY testimonials_insert_staff ON public.testimonials
  FOR INSERT TO authenticated WITH CHECK (public.is_staff_or_admin());
CREATE POLICY testimonials_update_staff ON public.testimonials
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY testimonials_delete_staff ON public.testimonials
  FOR DELETE TO authenticated USING (public.is_staff_or_admin());

-- ── FK indexes (performance advisor) ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements (created_by);
CREATE INDEX IF NOT EXISTS idx_schedules_created_by ON public.schedules (created_by);
CREATE INDEX IF NOT EXISTS idx_lms_enrollments_legacy_user_id ON public.lms_enrollments_legacy (user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_case_id ON public.incidents (case_id);
CREATE INDEX IF NOT EXISTS idx_incidents_student_id ON public.incidents (student_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services (category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings (customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings (service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_technician_id ON public.bookings (technician_id);
