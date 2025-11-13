-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Profiles policies
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

-- Students policies
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

-- Admissions policies (public can create, admins can manage)
CREATE POLICY "Anyone can create admissions"
  ON admissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view own admission by email"
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

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Subjects policies (read-only for authenticated users, manage for admins)
CREATE POLICY "Authenticated users can view subjects"
  ON subjects FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Exams policies
CREATE POLICY "Students can view exams"
  ON exams FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can create exams"
  ON exams FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) = 'teacher');

CREATE POLICY "Teachers can view all exams"
  ON exams FOR SELECT
  USING (get_user_role(auth.uid()) IN ('teacher', 'admin'));

CREATE POLICY "Admins can manage exams"
  ON exams FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Student Results policies
CREATE POLICY "Students can view own results"
  ON student_results FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view children results"
  ON student_results FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE parent_profile_id = auth.uid()
    )
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

-- Events policies (public read, admins manage)
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- News Posts policies (public read published, admins manage)
CREATE POLICY "Anyone can view published news"
  ON news_posts FOR SELECT
  USING (status = 'published' OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage news posts"
  ON news_posts FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Classes policies
CREATE POLICY "Authenticated users can view classes"
  ON classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage classes"
  ON classes FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Teacher Assignments policies
CREATE POLICY "Teachers can view own assignments"
  ON teacher_assignments FOR SELECT
  USING (teacher_profile_id = auth.uid());

CREATE POLICY "Admins can manage teacher assignments"
  ON teacher_assignments FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Contact Submissions policies
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (get_user_role(auth.uid()) = 'admin');
