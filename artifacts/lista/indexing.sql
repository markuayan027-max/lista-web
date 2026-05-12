-- ============================================================
-- LISTA DATABASE INDEXING FOR MASSIVE DATA PERFORMANCE
-- ============================================================

-- 1. ANALYTICS & FILTERING INDEXES
-- Optimized for Course Mix and Top Performing Courses
CREATE INDEX IF NOT EXISTS idx_enrollments_course_slug ON public.enrollments(course_slug);

-- Optimized for Status Breakdown and Dashboard KPIs (Active, Pending)
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);

-- Optimized for Enrollments Over Time (Time-series analytics)
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON public.enrollments(created_at);

-- 2. OPERATIONAL INDEXES
-- Optimized for trainee lookups and search
CREATE INDEX IF NOT EXISTS idx_enrollments_last_name ON public.enrollments(last_name);
CREATE INDEX IF NOT EXISTS idx_enrollments_first_name ON public.enrollments(first_name);
CREATE INDEX IF NOT EXISTS idx_enrollments_trainee_email ON public.enrollments(trainee_email);

-- Optimized for document monitoring and compliance
CREATE INDEX IF NOT EXISTS idx_enrollments_document_status ON public.enrollments(document_status);

-- Optimized for user-specific enrollment retrieval
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);

-- 3. COMPOSITE INDEXES
-- Optimized for filtered analytics (e.g., active students per course)
CREATE INDEX IF NOT EXISTS idx_enrollments_course_status ON public.enrollments(course_slug, status);

-- 4. FULL TEXT SEARCH (Optional but recommended for massive name searches)
-- CREATE INDEX IF NOT EXISTS idx_enrollments_name_search ON public.enrollments USING gin(to_tsvector('english', first_name || ' ' || last_name));
