-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent', 'student');
CREATE TYPE admission_status AS ENUM ('pending_payment', 'processing', 'accepted', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE news_status AS ENUM ('draft', 'published');
CREATE TYPE event_category AS ENUM ('Academic', 'Sports', 'Cultural', 'Other');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  phone TEXT,
  address TEXT,
  photo_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  teacher_in_charge_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admission_number TEXT NOT NULL UNIQUE,
  class TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  parent_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_profile_id ON students(profile_id);
CREATE INDEX idx_students_parent_profile_id ON students(parent_profile_id);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_students_admission_number ON students(admission_number);

-- Admissions table
CREATE TABLE admissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_data JSONB NOT NULL,
  guardian_data JSONB NOT NULL,
  class_applied TEXT NOT NULL,
  status admission_status DEFAULT 'pending_payment',
  amount DECIMAL(10, 2) NOT NULL,
  paystack_reference TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_paystack_reference ON admissions(paystack_reference);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admission_id UUID REFERENCES admissions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status payment_status DEFAULT 'pending',
  method TEXT DEFAULT 'paystack',
  reference TEXT NOT NULL UNIQUE,
  paystack_response JSONB,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_admission_id ON payments(admission_id);
CREATE INDEX idx_payments_reference ON payments(reference);
CREATE INDEX idx_payments_status ON payments(status);

-- Subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subjects_code ON subjects(code);

-- Exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exams_term_year ON exams(term, year);
CREATE INDEX idx_exams_created_by ON exams(created_by);

-- Student Results table
CREATE TABLE student_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  score DECIMAL(5, 2) NOT NULL CHECK (score >= 0 AND score <= 100),
  grade TEXT,
  remarks TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, exam_id, subject_id)
);

CREATE INDEX idx_student_results_student_id ON student_results(student_id);
CREATE INDEX idx_student_results_exam_id ON student_results(exam_id);
CREATE INDEX idx_student_results_subject_id ON student_results(subject_id);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  category event_category DEFAULT 'Other',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_start_ts ON events(start_ts);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_created_by ON events(created_by);

-- News Posts table
CREATE TABLE news_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  summary TEXT,
  status news_status DEFAULT 'draft',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  featured_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_posts_slug ON news_posts(slug);
CREATE INDEX idx_news_posts_status ON news_posts(status);
CREATE INDEX idx_news_posts_author_id ON news_posts(author_id);
CREATE INDEX idx_news_posts_published_at ON news_posts(published_at);

-- Teacher Assignments table
CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_profile_id, student_id)
);

CREATE INDEX idx_teacher_assignments_teacher_profile_id ON teacher_assignments(teacher_profile_id);
CREATE INDEX idx_teacher_assignments_student_id ON teacher_assignments(student_id);

-- Contact Submissions table
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admissions_updated_at
  BEFORE UPDATE ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
