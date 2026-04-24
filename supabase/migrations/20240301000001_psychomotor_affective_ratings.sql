-- ============================================================
-- MIGRATION: Psychomotor & Affective Ratings + Resumption Date
-- Run this ONCE in your Supabase SQL Editor
-- Safe to re-run (all statements use IF NOT EXISTS / IF EXISTS)
-- ============================================================

-- Add resumption date to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS resumption_date TEXT;

-- Add teacher_comment column to report_card_comments if missing
ALTER TABLE report_card_comments ADD COLUMN IF NOT EXISTS teacher_comment TEXT;

-- ============================================================
-- PSYCHOMOTOR RATINGS TABLE (7 traits, rated 1-5)
-- ============================================================
CREATE TABLE IF NOT EXISTS psychomotor_ratings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id          UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  handwriting      INTEGER CHECK (handwriting BETWEEN 1 AND 5),
  verbal_fluency   INTEGER CHECK (verbal_fluency BETWEEN 1 AND 5),
  games            INTEGER CHECK (games BETWEEN 1 AND 5),
  sport            INTEGER CHECK (sport BETWEEN 1 AND 5),
  handling_tool    INTEGER CHECK (handling_tool BETWEEN 1 AND 5),
  drawing_painting INTEGER CHECK (drawing_painting BETWEEN 1 AND 5),
  musical_skills   INTEGER CHECK (musical_skills BETWEEN 1 AND 5),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_psychomotor_student_exam ON psychomotor_ratings(student_id, exam_id);

DROP TRIGGER IF EXISTS update_psychomotor_ratings_updated_at ON psychomotor_ratings;
CREATE TRIGGER update_psychomotor_ratings_updated_at
  BEFORE UPDATE ON psychomotor_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AFFECTIVE RATINGS TABLE (13 traits, rated 1-5)
-- ============================================================
CREATE TABLE IF NOT EXISTS affective_ratings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id              UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id                 UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  punctuality             INTEGER CHECK (punctuality BETWEEN 1 AND 5),
  neatness                INTEGER CHECK (neatness BETWEEN 1 AND 5),
  politeness              INTEGER CHECK (politeness BETWEEN 1 AND 5),
  honesty                 INTEGER CHECK (honesty BETWEEN 1 AND 5),
  cooperation             INTEGER CHECK (cooperation BETWEEN 1 AND 5),
  leadership              INTEGER CHECK (leadership BETWEEN 1 AND 5),
  helping_others          INTEGER CHECK (helping_others BETWEEN 1 AND 5),
  emotional_stability     INTEGER CHECK (emotional_stability BETWEEN 1 AND 5),
  health                  INTEGER CHECK (health BETWEEN 1 AND 5),
  attitude_to_school_work INTEGER CHECK (attitude_to_school_work BETWEEN 1 AND 5),
  attentiveness           INTEGER CHECK (attentiveness BETWEEN 1 AND 5),
  perseverance            INTEGER CHECK (perseverance BETWEEN 1 AND 5),
  speaking_handwriting    INTEGER CHECK (speaking_handwriting BETWEEN 1 AND 5),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_affective_student_exam ON affective_ratings(student_id, exam_id);

DROP TRIGGER IF EXISTS update_affective_ratings_updated_at ON affective_ratings;
CREATE TRIGGER update_affective_ratings_updated_at
  BEFORE UPDATE ON affective_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS FOR NEW TABLES
-- ============================================================

-- psychomotor_ratings
ALTER TABLE psychomotor_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own psychomotor ratings"  ON psychomotor_ratings;
DROP POLICY IF EXISTS "Parents can view children psychomotor"      ON psychomotor_ratings;
DROP POLICY IF EXISTS "Teachers can manage class psychomotor"      ON psychomotor_ratings;
DROP POLICY IF EXISTS "Admins can manage psychomotor ratings"      ON psychomotor_ratings;

CREATE POLICY "Students can view own psychomotor ratings"
  ON psychomotor_ratings FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE POLICY "Parents can view children psychomotor"
  ON psychomotor_ratings FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE parent_profile_id = auth.uid()));

CREATE POLICY "Teachers can manage class psychomotor"
  ON psychomotor_ratings FOR ALL
  USING (
    student_id IN (
      SELECT s.id FROM students s
      INNER JOIN class_teacher ct ON ct.class = s.class
      WHERE ct.teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage psychomotor ratings"
  ON psychomotor_ratings FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');


-- affective_ratings
ALTER TABLE affective_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view own affective ratings"  ON affective_ratings;
DROP POLICY IF EXISTS "Parents can view children affective"      ON affective_ratings;
DROP POLICY IF EXISTS "Teachers can manage class affective"      ON affective_ratings;
DROP POLICY IF EXISTS "Admins can manage affective ratings"      ON affective_ratings;

CREATE POLICY "Students can view own affective ratings"
  ON affective_ratings FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE profile_id = auth.uid()));

CREATE POLICY "Parents can view children affective"
  ON affective_ratings FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE parent_profile_id = auth.uid()));

CREATE POLICY "Teachers can manage class affective"
  ON affective_ratings FOR ALL
  USING (
    student_id IN (
      SELECT s.id FROM students s
      INNER JOIN class_teacher ct ON ct.class = s.class
      WHERE ct.teacher_profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage affective ratings"
  ON affective_ratings FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- DONE
-- New tables: psychomotor_ratings, affective_ratings
-- Modified tables: exams (resumption_date), report_card_comments (teacher_comment)
-- ============================================================
