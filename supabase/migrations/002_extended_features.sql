-- ============================================================
-- MIGRATION 002: Extended Features
-- Run this ONCE in your Supabase SQL Editor
-- Safe to re-run (all statements are idempotent)
-- ============================================================
-- Adds: student lifecycle fields, subject-class mapping,
--        exam publication control, academic settings,
--        fee structures, offline payment support,
--        staff profiles, report card comments
-- ============================================================


-- ============================================================
-- 1. STUDENT TABLE EXTENSIONS
-- ============================================================

-- Department for SSS1-3 students (Science / Commercial / Art)
ALTER TABLE students ADD COLUMN IF NOT EXISTS department TEXT;

-- Graduation year (set when student graduates)
ALTER TABLE students ADD COLUMN IF NOT EXISTS graduation_year INTEGER;

-- Transfer note (reason/destination when student transfers)
ALTER TABLE students ADD COLUMN IF NOT EXISTS transfer_note TEXT;

-- Add CHECK constraint for valid status values
-- (Drop first if it exists to make re-run safe)
DO $$ BEGIN
  ALTER TABLE students DROP CONSTRAINT IF EXISTS students_status_check;
  ALTER TABLE students ADD CONSTRAINT students_status_check
    CHECK (status IN ('active', 'graduated', 'withdrawn', 'transferred'));
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add CHECK constraint for valid department values
DO $$ BEGIN
  ALTER TABLE students DROP CONSTRAINT IF EXISTS students_department_check;
  ALTER TABLE students ADD CONSTRAINT students_department_check
    CHECK (department IS NULL OR department IN ('Science', 'Commercial', 'Art'));
EXCEPTION WHEN others THEN NULL;
END $$;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);


-- ============================================================
-- 2. SUBJECT TABLE EXTENSIONS
-- ============================================================

-- Which classes this subject applies to (empty array = all classes)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS applicable_classes TEXT[] DEFAULT '{}';

-- Which SSS departments this subject applies to (empty array = all departments)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS applicable_departments TEXT[] DEFAULT '{}';


-- ============================================================
-- 3. EXAMS TABLE EXTENSIONS
-- ============================================================

-- Results only visible to parents/students when published = true
ALTER TABLE exams ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT FALSE;

-- Whether teachers can still add/edit remarks
ALTER TABLE exams ADD COLUMN IF NOT EXISTS teacher_remarks_open BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_exams_published ON exams(published);


-- ============================================================
-- 4. ACADEMIC SETTINGS TABLE (single-row config)
-- ============================================================

CREATE TABLE IF NOT EXISTS academic_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  singleton_key   BOOLEAN NOT NULL DEFAULT TRUE UNIQUE CHECK (singleton_key = TRUE),
  current_term    TEXT NOT NULL DEFAULT 'First',
  current_year    INTEGER NOT NULL DEFAULT 2025,
  school_name     TEXT NOT NULL DEFAULT 'Elyon Schools',
  principal_name  TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row (singleton_key UNIQUE constraint prevents multiple rows)
INSERT INTO academic_settings (singleton_key, current_term, current_year, school_name)
VALUES (TRUE, 'First', 2025, 'Elyon Schools')
ON CONFLICT (singleton_key) DO NOTHING;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_academic_settings_updated_at ON academic_settings;
CREATE TRIGGER update_academic_settings_updated_at
  BEFORE UPDATE ON academic_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 5. FEE STRUCTURES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS fee_structures (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class      TEXT NOT NULL,
  term       TEXT NOT NULL,
  year       INTEGER NOT NULL,
  fee_type   TEXT NOT NULL DEFAULT 'tuition',
  amount     DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class, term, year, fee_type)
);

CREATE INDEX IF NOT EXISTS idx_fee_structures_class ON fee_structures(class);
CREATE INDEX IF NOT EXISTS idx_fee_structures_term_year ON fee_structures(term, year);


-- ============================================================
-- 6. PAYMENTS TABLE EXTENSIONS
-- ============================================================

-- Link payment to a specific student (for fee tracking)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE SET NULL;

-- Which admin recorded this offline payment
ALTER TABLE payments ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Admin notes for offline payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Term and year for fee payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS term TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS year INTEGER;

-- Enforce valid payment methods
DO $$ BEGIN
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
  ALTER TABLE payments ADD CONSTRAINT payments_method_check
    CHECK (method IN ('paystack', 'cash', 'bank_transfer'));
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_term_year ON payments(term, year);


-- ============================================================
-- 7. STAFF PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  subject_specialty TEXT,
  qualification     TEXT,
  phone             TEXT,
  bio               TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_profile_id ON staff_profiles(profile_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_staff_profiles_updated_at ON staff_profiles;
CREATE TRIGGER update_staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 8. REPORT CARD COMMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS report_card_comments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id           UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  principal_comment TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_report_card_comments_student_exam ON report_card_comments(student_id, exam_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_report_card_comments_updated_at ON report_card_comments;
CREATE TRIGGER update_report_card_comments_updated_at
  BEFORE UPDATE ON report_card_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 9. RLS FOR NEW TABLES
-- ============================================================

-- academic_settings
ALTER TABLE academic_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view academic settings" ON academic_settings;
DROP POLICY IF EXISTS "Admins can manage academic settings"            ON academic_settings;

CREATE POLICY "Authenticated users can view academic settings"
  ON academic_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage academic settings"
  ON academic_settings FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- fee_structures
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view fee structures" ON fee_structures;
DROP POLICY IF EXISTS "Admins can manage fee structures"            ON fee_structures;

CREATE POLICY "Authenticated users can view fee structures"
  ON fee_structures FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage fee structures"
  ON fee_structures FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- staff_profiles
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view staff profiles" ON staff_profiles;
DROP POLICY IF EXISTS "Admins can manage staff profiles"            ON staff_profiles;
DROP POLICY IF EXISTS "Teachers can update own staff profile"       ON staff_profiles;

CREATE POLICY "Authenticated users can view staff profiles"
  ON staff_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage staff profiles"
  ON staff_profiles FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- report_card_comments
ALTER TABLE report_card_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own report card comments"    ON report_card_comments;
DROP POLICY IF EXISTS "Parents can view children report card comments" ON report_card_comments;
DROP POLICY IF EXISTS "Teachers can view class report card comments"   ON report_card_comments;
DROP POLICY IF EXISTS "Admins can manage report card comments"         ON report_card_comments;

CREATE POLICY "Students can view own report card comments"
  ON report_card_comments FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE profile_id = auth.uid())
  );

CREATE POLICY "Parents can view children report card comments"
  ON report_card_comments FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE parent_profile_id = auth.uid())
  );

CREATE POLICY "Teachers can view class report card comments"
  ON report_card_comments FOR SELECT
  USING (
    student_id IN (
      SELECT s.id FROM students s
      INNER JOIN class_teacher ct ON ct.class = s.class
      WHERE ct.teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage report card comments"
  ON report_card_comments FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- ============================================================
-- 10. ADDITIONAL PAYMENT RLS (parents can view payments by student)
-- ============================================================

DROP POLICY IF EXISTS "Parents can view child payments" ON payments;

CREATE POLICY "Parents can view child payments"
  ON payments FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE parent_profile_id = auth.uid())
  );


-- ============================================================
-- DONE!
-- ============================================================
-- New tables: academic_settings, fee_structures, staff_profiles, report_card_comments
-- Extended tables: students, subjects, exams, payments
-- All RLS policies applied.
-- ============================================================
