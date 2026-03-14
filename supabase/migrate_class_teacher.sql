-- ============================================================
-- MIGRATION: Replace teacher_assignments with class_teacher
-- Run this ONCE in your Supabase SQL Editor
-- Safe to run on existing data
-- ============================================================

-- 1. Create the new class_teacher table
CREATE TABLE IF NOT EXISTS class_teacher (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  class              TEXT        NOT NULL UNIQUE,
  teacher_profile_id UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE class_teacher ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies for class_teacher
DROP POLICY IF EXISTS "Teachers can view own class assignment" ON class_teacher;
DROP POLICY IF EXISTS "Admins can manage class teachers"      ON class_teacher;

CREATE POLICY "Teachers can view own class assignment"
  ON class_teacher FOR SELECT
  USING (teacher_profile_id = auth.uid());

CREATE POLICY "Admins can manage class teachers"
  ON class_teacher FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Drop old student_results policies that reference teacher_assignments
DROP POLICY IF EXISTS "Teachers can view assigned students results"         ON student_results;
DROP POLICY IF EXISTS "Teachers can insert results for assigned students"   ON student_results;
DROP POLICY IF EXISTS "Teachers can update results for assigned students"   ON student_results;

-- 5. New class-based student_results policies
CREATE POLICY "Teachers can view class results"
  ON student_results FOR SELECT
  USING (
    student_id IN (
      SELECT s.id FROM students s
      INNER JOIN class_teacher ct ON ct.class = s.class
      WHERE ct.teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert class results"
  ON student_results FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM students s
      INNER JOIN class_teacher ct ON ct.class = s.class
      WHERE ct.teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update class results"
  ON student_results FOR UPDATE
  USING (
    student_id IN (
      SELECT s.id FROM students s
      INNER JOIN class_teacher ct ON ct.class = s.class
      WHERE ct.teacher_profile_id = auth.uid()
    )
  );

-- 6. Drop old students SELECT policy for teachers, replace with class-based
DROP POLICY IF EXISTS "Teachers can view assigned students" ON students;

CREATE POLICY "Teachers can view class students"
  ON students FOR SELECT
  USING (
    class IN (
      SELECT class FROM class_teacher
      WHERE teacher_profile_id = auth.uid()
    )
  );

-- 7. Drop old teacher_assignments table (CASCADE removes indexes + policies)
DROP TABLE IF EXISTS teacher_assignments CASCADE;

-- Done! The class_teacher table is ready.
-- Use the Admin Dashboard → Class Teachers to assign teachers to classes.
