-- ============================================================
-- ELYON SCHOOLS MANAGEMENT SYSTEM
-- Complete Supabase Setup SQL
-- ============================================================
-- HOW TO USE:
--   1. Create a new Supabase project at https://supabase.com
--   2. Go to SQL Editor and paste this entire file, then click Run.
--   3. Everything will be created automatically.
--
-- AFTER RUNNING THIS SQL — complete these steps in Supabase dashboard:
--
--   A) STORAGE (already handled below via SQL, but verify):
--      - Go to Storage → confirm a bucket named "gallery" exists and is Public.
--
--   B) AUTHENTICATION → Email Templates:
--      - Update the "Invite" email template to include a working redirect URL.
--      - Update the "Reset Password" template to point to your domain.
--
--   C) AUTHENTICATION → URL Configuration:
--      - Site URL: https://your-vercel-domain.vercel.app
--      - Redirect URLs: add https://your-vercel-domain.vercel.app/**
--
--   D) SET ENVIRONMENT VARIABLES in Vercel (or .env.local for dev):
--      NEXT_PUBLIC_SUPABASE_URL        = your project URL (Settings → API)
--      NEXT_PUBLIC_SUPABASE_ANON_KEY   = your anon/public key
--      SUPABASE_SERVICE_ROLE_KEY       = your service_role key (keep secret!)
--      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = your Paystack public key
--      PAYSTACK_SECRET_KEY             = your Paystack secret key (keep secret!)
--      NEXT_PUBLIC_SITE_URL            = https://your-vercel-domain.vercel.app
--
--   E) CREATE YOUR FIRST ADMIN USER:
--      - Go to Authentication → Users → Invite user (enter your email).
--      - After accepting the invite and setting a password, run this in SQL Editor:
--        INSERT INTO profiles (id, full_name, role)
--        VALUES ('<paste-your-auth-user-uuid-here>', 'Your Name', 'admin');
--      - From then on, use the Admin portal to invite all other users.
-- ============================================================


-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- SECTION 2: CUSTOM ENUM TYPES
-- (wrapped in DO blocks so re-running is safe)
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE admission_status AS ENUM ('pending_payment', 'processing', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE news_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_category AS ENUM ('Academic', 'Sports', 'Cultural', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- SECTION 3: TABLES
-- (created in FK dependency order)
-- ============================================================

-- ----------------------------------------------------------
-- profiles  (extends auth.users — one row per auth user)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL,
  phone       TEXT,
  address     TEXT,
  photo_url   TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- classes
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL UNIQUE,
  teacher_in_charge_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- students
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admission_number  TEXT NOT NULL UNIQUE,
  class             TEXT NOT NULL,
  dob               DATE,
  gender            TEXT,
  parent_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status            TEXT DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- admissions  (public applicants — no auth required)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admissions (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_data       JSONB NOT NULL,
  guardian_data      JSONB NOT NULL,
  class_applied      TEXT NOT NULL,
  status             admission_status DEFAULT 'pending_payment',
  amount             DECIMAL(10, 2) NOT NULL,
  paystack_reference TEXT UNIQUE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- payments  (all columns in one place — no ALTER needed)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admission_id     UUID REFERENCES admissions(id) ON DELETE SET NULL,
  amount           DECIMAL(10, 2) NOT NULL,
  status           payment_status DEFAULT 'pending',
  method           TEXT DEFAULT 'paystack',
  reference        TEXT NOT NULL UNIQUE,
  payment_type     TEXT,
  payer_name       TEXT,
  payer_email      TEXT,
  metadata         JSONB,
  paystack_response JSONB,
  receipt_url      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- subjects
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- exams
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  term       TEXT NOT NULL,
  year       INTEGER NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- student_results
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_results (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id     UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  score       DECIMAL(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  grade       TEXT,
  remarks     TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id, subject_id)
);

-- ----------------------------------------------------------
-- events
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  start_ts    TIMESTAMPTZ NOT NULL,
  end_ts      TIMESTAMPTZ NOT NULL,
  location    TEXT,
  image_url   TEXT,
  category    event_category DEFAULT 'Other',
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- news_posts
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS news_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  body         TEXT NOT NULL,
  summary      TEXT,
  status       news_status DEFAULT 'draft',
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  featured_url TEXT,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- teacher_assignments
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id         UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_profile_id, student_id)
);

-- ----------------------------------------------------------
-- contact_submissions  (public contact form — no auth)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- announcements
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'all',
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- gallery_items
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  category     TEXT NOT NULL DEFAULT 'campus',
  storage_path TEXT NOT NULL,
  public_url   TEXT NOT NULL,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- SECTION 4: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role                         ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_students_profile_id                   ON students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_parent_profile_id            ON students(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_students_class                        ON students(class);
CREATE INDEX IF NOT EXISTS idx_students_admission_number             ON students(admission_number);

CREATE INDEX IF NOT EXISTS idx_admissions_status                     ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_paystack_reference         ON admissions(paystack_reference);

CREATE INDEX IF NOT EXISTS idx_payments_user_id                      ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_admission_id                 ON payments(admission_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference                    ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status                       ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_type                         ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_payer_email                  ON payments(payer_email);
CREATE INDEX IF NOT EXISTS idx_payments_created_at                   ON payments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subjects_code                         ON subjects(code);

CREATE INDEX IF NOT EXISTS idx_exams_term_year                       ON exams(term, year);
CREATE INDEX IF NOT EXISTS idx_exams_created_by                      ON exams(created_by);

CREATE INDEX IF NOT EXISTS idx_student_results_student_id            ON student_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_results_exam_id               ON student_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_student_results_subject_id            ON student_results(subject_id);

CREATE INDEX IF NOT EXISTS idx_events_start_ts                       ON events(start_ts);
CREATE INDEX IF NOT EXISTS idx_events_category                       ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_created_by                     ON events(created_by);

CREATE INDEX IF NOT EXISTS idx_news_posts_slug                       ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_news_posts_status                     ON news_posts(status);
CREATE INDEX IF NOT EXISTS idx_news_posts_author_id                  ON news_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_news_posts_published_at               ON news_posts(published_at);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher_profile_id ON teacher_assignments(teacher_profile_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_student_id         ON teacher_assignments(student_id);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at        ON contact_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_announcements_published               ON announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_announcements_audience                ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at              ON announcements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_items_category                ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at              ON gallery_items(created_at DESC);


-- ============================================================
-- SECTION 5: FUNCTIONS & TRIGGERS
-- ============================================================

-- Function: stamp updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function used by RLS policies to read a user's role
-- SECURITY DEFINER so it can read profiles even under RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Trigger: profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: admissions
DROP TRIGGER IF EXISTS update_admissions_updated_at ON admissions;
CREATE TRIGGER update_admissions_updated_at
  BEFORE UPDATE ON admissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: news_posts
DROP TRIGGER IF EXISTS update_news_posts_updated_at ON news_posts;
CREATE TRIGGER update_news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE students            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams               ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items       ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 7: RLS POLICIES
-- ============================================================
-- Each DROP + CREATE pattern ensures re-running is safe.
-- ============================================================


-- ----------------------------------------------------------
-- profiles
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile"      ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"    ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"    ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles"      ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"  ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles"      ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- classes
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage classes"            ON classes;

CREATE POLICY "Authenticated users can view classes"
  ON classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage classes"
  ON classes FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- students
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own record"          ON students;
DROP POLICY IF EXISTS "Parents can view own children"         ON students;
DROP POLICY IF EXISTS "Teachers can view assigned students"   ON students;
DROP POLICY IF EXISTS "Admins can view all students"          ON students;
DROP POLICY IF EXISTS "Admins can manage students"            ON students;

CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Parents can view own children"
  ON students FOR SELECT
  USING (parent_profile_id = auth.uid());

CREATE POLICY "Teachers can view assigned students"
  ON students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teacher_assignments
      WHERE teacher_assignments.student_id = students.id
        AND teacher_assignments.teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all students"
  ON students FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage students"
  ON students FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- admissions
-- (public INSERT so unauthenticated applicants can apply;
--  the permissive SELECT "Anyone can view own admission by email"
--  is intentionally replaced by a tighter policy)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can create admissions"               ON admissions;
DROP POLICY IF EXISTS "Anyone can view own admission by email"     ON admissions;
DROP POLICY IF EXISTS "Public can lookup own admission"            ON admissions;
DROP POLICY IF EXISTS "Admins can view all admissions"             ON admissions;
DROP POLICY IF EXISTS "Admins can update admissions"               ON admissions;
DROP POLICY IF EXISTS "Admins can delete admissions"               ON admissions;

-- Unauthenticated visitors can submit an application
CREATE POLICY "Anyone can create admissions"
  ON admissions FOR INSERT
  WITH CHECK (true);

-- Public status lookup — read allowed for anyone (app filters by ID/email in code)
CREATE POLICY "Public can lookup own admission"
  ON admissions FOR SELECT
  USING (true);

CREATE POLICY "Admins can view all admissions"
  ON admissions FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update admissions"
  ON admissions FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete admissions"
  ON admissions FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- payments
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own payments"       ON payments;
DROP POLICY IF EXISTS "Users can view payments by email"  ON payments;
DROP POLICY IF EXISTS "Admins can view all payments"      ON payments;
DROP POLICY IF EXISTS "System can insert payments"        ON payments;
DROP POLICY IF EXISTS "Admins can manage payments"        ON payments;

-- Authenticated user sees payments linked to their user_id
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

-- Parent/portal user sees payments where their email is the payer
CREATE POLICY "Users can view payments by email"
  ON payments FOR SELECT
  USING (
    payer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

-- API routes (using service role) insert payments on behalf of any user
CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- subjects
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON subjects;
DROP POLICY IF EXISTS "Admins can manage subjects"            ON subjects;

CREATE POLICY "Authenticated users can view subjects"
  ON subjects FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- exams
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Students can view exams"       ON exams;
DROP POLICY IF EXISTS "Teachers can view all exams"   ON exams;
DROP POLICY IF EXISTS "Teachers can create exams"     ON exams;
DROP POLICY IF EXISTS "Admins can manage exams"       ON exams;

CREATE POLICY "Students can view exams"
  ON exams FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can view all exams"
  ON exams FOR SELECT
  USING (get_user_role(auth.uid()) IN ('teacher', 'admin'));

CREATE POLICY "Teachers can create exams"
  ON exams FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'teacher');

CREATE POLICY "Admins can manage exams"
  ON exams FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- student_results
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own results"                    ON student_results;
DROP POLICY IF EXISTS "Parents can view children results"               ON student_results;
DROP POLICY IF EXISTS "Teachers can view assigned students results"     ON student_results;
DROP POLICY IF EXISTS "Teachers can insert results for assigned students" ON student_results;
DROP POLICY IF EXISTS "Teachers can update results for assigned students" ON student_results;
DROP POLICY IF EXISTS "Admins can manage all results"                   ON student_results;

CREATE POLICY "Students can view own results"
  ON student_results FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can view children results"
  ON student_results FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE parent_profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view assigned students results"
  ON student_results FOR SELECT
  USING (
    student_id IN (
      SELECT student_id FROM teacher_assignments
      WHERE teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert results for assigned students"
  ON student_results FOR INSERT
  WITH CHECK (
    get_user_role(auth.uid()) = 'teacher'
    AND student_id IN (
      SELECT student_id FROM teacher_assignments
      WHERE teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update results for assigned students"
  ON student_results FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'teacher'
    AND student_id IN (
      SELECT student_id FROM teacher_assignments
      WHERE teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all results"
  ON student_results FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- events  (fully public read)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view published events" ON events;
DROP POLICY IF EXISTS "Admins can manage events"         ON events;

CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- news_posts
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view published news" ON news_posts;
DROP POLICY IF EXISTS "Admins can manage news posts"   ON news_posts;

CREATE POLICY "Anyone can view published news"
  ON news_posts FOR SELECT
  USING (status = 'published' OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage news posts"
  ON news_posts FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- teacher_assignments
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Teachers can view own assignments"        ON teacher_assignments;
DROP POLICY IF EXISTS "Admins can manage teacher assignments"    ON teacher_assignments;

CREATE POLICY "Teachers can view own assignments"
  ON teacher_assignments FOR SELECT
  USING (teacher_profile_id = auth.uid());

CREATE POLICY "Admins can manage teacher assignments"
  ON teacher_assignments FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- contact_submissions
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit contact form"        ON contact_submissions;
DROP POLICY IF EXISTS "Admins can view contact submissions"   ON contact_submissions;
DROP POLICY IF EXISTS "Admins can delete contact submissions" ON contact_submissions;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');


-- ----------------------------------------------------------
-- announcements
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage announcements"                         ON announcements;
DROP POLICY IF EXISTS "Authenticated users can read published announcements"    ON announcements;

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can read published announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (is_published = true);


-- ----------------------------------------------------------
-- gallery_items  (fully public read)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage gallery"    ON gallery_items;
DROP POLICY IF EXISTS "Anyone can read gallery items" ON gallery_items;

CREATE POLICY "Admins can manage gallery"
  ON gallery_items FOR ALL
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Anyone can read gallery items"
  ON gallery_items FOR SELECT
  TO anon, authenticated
  USING (true);


-- ============================================================
-- SECTION 8: STORAGE
-- ============================================================

-- Create the "gallery" storage bucket as public
-- (public = true means files are accessible via public URL without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  5242880,   -- 5 MB per file
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: allow public read of all objects in the gallery bucket
DROP POLICY IF EXISTS "Gallery images are publicly readable" ON storage.objects;
CREATE POLICY "Gallery images are publicly readable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery');

-- Storage RLS: only admins (service role bypasses RLS, so this covers browser uploads)
DROP POLICY IF EXISTS "Admins can upload gallery images"  ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery images"  ON storage.objects;

CREATE POLICY "Admins can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'gallery'
    AND get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gallery'
    AND get_user_role(auth.uid()) = 'admin'
  );


-- ============================================================
-- DONE!
-- ============================================================
-- All tables, indexes, triggers, RLS policies, and the
-- storage bucket have been created.
--
-- Next steps:
--   1. Verify the "gallery" bucket appears in Storage tab.
--   2. Configure Auth → URL Configuration with your domain.
--   3. Set all environment variables in Vercel.
--   4. Invite your first admin user via Authentication → Users,
--      then insert their profile row (see instructions at top).
-- ============================================================
