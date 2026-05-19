-- LISTA InsForge RLS baseline
-- Apply in SQL editor or: npx @insforge/cli db execute --file artifacts/lista/sql/rls-policies.sql
-- Adjust JWT paths if your InsForge tokens use different claim shapes.

-- Helper: role from JWT app metadata (matches set_admin.sql / auth-context)
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

-- ── Enable RLS ──────────────────────────────────────────────────────────────

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-applying (safe idempotent pattern)
DO $$ DECLARE r record;
BEGIN
  FOR r IN (
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
      AND tablename IN ('enrollments','users','announcements','schedules','courses','testimonials','faqs')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ── Courses / FAQs / Testimonials: public read ─────────────────────────────

CREATE POLICY courses_select_all ON public.courses FOR SELECT USING (true);
CREATE POLICY faqs_select_all ON public.faqs FOR SELECT USING (true);
CREATE POLICY testimonials_select_all ON public.testimonials FOR SELECT USING (true);

-- ── Announcements ───────────────────────────────────────────────────────────

CREATE POLICY announcements_select_all ON public.announcements FOR SELECT USING (true);
CREATE POLICY announcements_write_staff ON public.announcements
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- ── Schedules ─────────────────────────────────────────────────────────────────

CREATE POLICY schedules_select_all ON public.schedules FOR SELECT USING (true);
CREATE POLICY schedules_write_staff ON public.schedules
  FOR ALL USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- ── Users ─────────────────────────────────────────────────────────────────────

CREATE POLICY users_select_self ON public.users
  FOR SELECT USING (email = lower(auth.jwt() ->> 'email') OR public.is_staff_or_admin());

CREATE POLICY users_write_admin ON public.users
  FOR ALL USING (public.jwt_role() = 'admin') WITH CHECK (public.jwt_role() = 'admin');

-- ── Enrollments ───────────────────────────────────────────────────────────────

CREATE POLICY enrollments_select_own ON public.enrollments
  FOR SELECT USING (email = lower(auth.jwt() ->> 'email') OR public.is_staff_or_admin());

CREATE POLICY enrollments_insert_own ON public.enrollments
  FOR INSERT WITH CHECK (email = lower(auth.jwt() ->> 'email') OR public.is_staff_or_admin());

CREATE POLICY enrollments_update_trainee ON public.enrollments
  FOR UPDATE
  USING (email = lower(auth.jwt() ->> 'email'))
  WITH CHECK (
    email = lower(auth.jwt() ->> 'email')
    AND (
      status::text IN ('Pending', 'Cancelled', 'Ready to Apply')
      OR public.is_staff_or_admin()
    )
  );

CREATE POLICY enrollments_update_staff ON public.enrollments
  FOR UPDATE USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

CREATE POLICY enrollments_delete_admin ON public.enrollments
  FOR DELETE USING (public.jwt_role() = 'admin');
