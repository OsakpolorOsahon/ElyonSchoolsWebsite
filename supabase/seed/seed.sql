-- Seed data for Elyon Schools Management System
-- This creates demo accounts and sample data for development and testing

-- Note: In production, admin accounts should be created through Supabase Auth UI
-- These are example UUIDs - in real deployment, you'll use actual user IDs from auth.users

-- Insert sample subjects
INSERT INTO subjects (id, name, code) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Mathematics', 'MTH'),
  ('22222222-2222-2222-2222-222222222222', 'English Language', 'ENG'),
  ('33333333-3333-3333-3333-333333333333', 'Physics', 'PHY'),
  ('44444444-4444-4444-4444-444444444444', 'Chemistry', 'CHE'),
  ('55555555-5555-5555-5555-555555555555', 'Biology', 'BIO'),
  ('66666666-6666-6666-6666-666666666666', 'Economics', 'ECO'),
  ('77777777-7777-7777-7777-777777777777', 'Geography', 'GEO'),
  ('88888888-8888-8888-8888-888888888888', 'History', 'HIS'),
  ('99999999-9999-9999-9999-999999999999', 'Computer Science', 'CSC'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'French', 'FRE');

-- Insert sample classes
INSERT INTO classes (id, name) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'JSS 1A'),
  ('c2222222-2222-2222-2222-222222222222', 'JSS 2A'),
  ('c3333333-3333-3333-3333-333333333333', 'JSS 3A'),
  ('c4444444-4444-4444-4444-444444444444', 'SSS 1A'),
  ('c5555555-5555-5555-5555-555555555555', 'SSS 2A'),
  ('c6666666-6666-6666-6666-666666666666', 'SSS 3A');

-- Insert sample events
INSERT INTO events (id, title, description, start_ts, end_ts, location, category, image_url) VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'Inter-House Sports Competition',
    'Annual sports day featuring track and field events, football, basketball, and relay races.',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '30 days' + INTERVAL '8 hours',
    'School Sports Complex',
    'Sports',
    '/events/sports-day.jpg'
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'First Term Examination',
    'First term final examinations for all classes. Students should arrive 30 minutes early.',
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '75 days',
    'Main School Building',
    'Academic',
    NULL
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    'Cultural Day Celebration',
    'Showcase of Nigerian cultural heritage with traditional dances, attire, and food.',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '45 days' + INTERVAL '6 hours',
    'School Hall',
    'Cultural',
    '/events/cultural-day.jpg'
  ),
  (
    'e4444444-4444-4444-4444-444444444444',
    'Parents Teachers Meeting',
    'End of term meeting to discuss student progress and school developments.',
    NOW() + INTERVAL '90 days',
    NOW() + INTERVAL '90 days' + INTERVAL '4 hours',
    'School Hall',
    'Other',
    NULL
  );

-- Insert sample news posts
INSERT INTO news_posts (id, title, slug, body, summary, status, featured_url, published_at) VALUES
  (
    'n1111111-1111-1111-1111-111111111111',
    'Elyon Schools Wins National Science Competition',
    'elyon-schools-wins-national-science-competition',
    'We are thrilled to announce that our students from SSS 3 have won first place in the National Science Competition 2024. The team, comprising of Amara Okonkwo, Chidi Nwankwo, and Blessing Eze, presented an innovative project on renewable energy solutions for rural communities. Their hard work and dedication have brought honor to our school. Congratulations to the team and their supervising teacher, Mr. Johnson Adeyemi!',
    'SSS 3 students win first place in National Science Competition with renewable energy project.',
    'published',
    '/news/science-competition.jpg',
    NOW() - INTERVAL '5 days'
  ),
  (
    'n2222222-2222-2222-2222-222222222222',
    'New Computer Laboratory Inaugurated',
    'new-computer-laboratory-inaugurated',
    'Elyon Schools has inaugurated a state-of-the-art computer laboratory equipped with 40 modern computers, high-speed internet, and the latest educational software. The facility was commissioned by the State Commissioner for Education, Hon. Mrs. Funke Adebayo. This new lab will significantly enhance our ICT curriculum and prepare our students for the digital age. We thank our generous donors and the PTA for making this possible.',
    'State-of-the-art computer lab with 40 computers now available for student use.',
    'published',
    '/news/computer-lab.jpg',
    NOW() - INTERVAL '12 days'
  ),
  (
    'n3333333-3333-3333-3333-333333333333',
    'Admission Now Open for 2025/2026 Academic Session',
    'admission-now-open-2025-2026',
    'Applications are now being accepted for admission into Nursery, Primary, and Secondary classes for the 2025/2026 academic session. Elyon Schools continues to maintain its tradition of excellence in academics, character formation, and extracurricular activities. Interested parents can apply online through our website or visit the school office for physical forms. Early application is encouraged as spaces are limited. For more information, please contact our admissions office.',
    'Apply now for admission into Nursery, Primary, and Secondary classes for 2025/2026 session.',
    'published',
    '/news/admission-open.jpg',
    NOW() - INTERVAL '20 days'
  );

-- Insert sample exams
INSERT INTO exams (id, name, term, year) VALUES
  (
    'x1111111-1111-1111-1111-111111111111',
    'First Term Examination',
    'First Term',
    2024
  ),
  (
    'x2222222-2222-2222-2222-222222222222',
    'Mid-Term Test',
    'First Term',
    2024
  );

-- Contact form submissions sample (for testing admin view)
INSERT INTO contact_submissions (name, email, phone, subject, message) VALUES
  (
    'John Doe',
    'john.doe@example.com',
    '+234 803 123 4567',
    'Inquiry about Admission Process',
    'Hello, I would like to know more about the admission process for my child who will be starting JSS 1 next year. What documents are required?'
  ),
  (
    'Jane Smith',
    'jane.smith@example.com',
    '+234 805 987 6543',
    'Request for School Prospectus',
    'Please send me a copy of your school prospectus. I am interested in enrolling my two children for the next academic session.'
  );

-- Note: Actual user accounts (admin, teacher, parent, student) should be created via Supabase Auth
-- After creating auth users, their profiles should be inserted into the profiles table
-- Example profile inserts (replace UUIDs with actual auth.users IDs):

-- Admin profile example:
-- INSERT INTO profiles (id, full_name, role, phone) VALUES
--   ('actual-admin-uuid-from-auth', 'Dr. Emmanuel Okafor', 'admin', '+234 802 345 6789');

-- Teacher profile example:
-- INSERT INTO profiles (id, full_name, role, phone) VALUES
--   ('actual-teacher-uuid-from-auth', 'Mrs. Grace Adebayo', 'teacher', '+234 803 456 7890');

-- Parent profile example:
-- INSERT INTO profiles (id, full_name, role, phone) VALUES
--   ('actual-parent-uuid-from-auth', 'Mr. Chibuike Okonkwo', 'parent', '+234 804 567 8901');

-- Student profile example:
-- INSERT INTO profiles (id, full_name, role) VALUES
--   ('actual-student-uuid-from-auth', 'Amara Okonkwo', 'student');

-- Students records (linked to student profiles):
-- INSERT INTO students (profile_id, admission_number, class, dob, gender, parent_profile_id) VALUES
--   ('student-profile-uuid', 'ELY/2024/0001', 'JSS 2A', '2010-05-15', 'Female', 'parent-profile-uuid');
