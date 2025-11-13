export type UserRole = 'admin' | 'teacher' | 'parent' | 'student'

export type AdmissionStatus = 'pending_payment' | 'processing' | 'accepted' | 'rejected'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export type NewsStatus = 'draft' | 'published'

export type EventCategory = 'Academic' | 'Sports' | 'Cultural' | 'Other'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  address: string | null
  photo_url: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  profile_id: string | null
  admission_number: string
  class: string
  dob: string | null
  gender: string | null
  parent_profile_id: string | null
  status: string
  created_at: string
}

export interface Admission {
  id: string
  student_data: Record<string, any>
  guardian_data: Record<string, any>
  class_applied: string
  status: AdmissionStatus
  amount: number
  paystack_reference: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  admission_id: string | null
  amount: number
  status: PaymentStatus
  method: string
  reference: string
  paystack_response: Record<string, any> | null
  receipt_url: string | null
  created_at: string
}

export interface Subject {
  id: string
  name: string
  code: string
}

export interface Exam {
  id: string
  name: string
  term: string
  year: number
  created_by: string
  created_at: string
}

export interface StudentResult {
  id: string
  student_id: string
  exam_id: string
  subject_id: string
  score: number
  grade: string | null
  remarks: string | null
  uploaded_by: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  start_ts: string
  end_ts: string
  location: string | null
  image_url: string | null
  category: EventCategory
  created_by: string
  created_at: string
}

export interface NewsPost {
  id: string
  title: string
  slug: string
  body: string
  summary: string | null
  status: NewsStatus
  author_id: string
  featured_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  name: string
  teacher_in_charge_id: string | null
}

export interface TeacherAssignment {
  id: string
  teacher_profile_id: string
  student_id: string
  created_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  created_at: string
}
