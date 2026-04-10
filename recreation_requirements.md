# Elyon Schools Management System — Recreation Requirements

## Project Overview
A full-stack school management web application for Elyon Schools, a Nigerian K-12 institution. The system serves four user roles: Admin, Teacher, Parent, and Student.

## Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes (serverless), Supabase (PostgreSQL + Auth + RLS + Storage)
- **Payments**: Paystack integration (online + offline)
- **PDF Generation**: jsPDF for report cards and results

## Database (Supabase/PostgreSQL)
Core tables: `profiles`, `students`, `admissions`, `exam_results`, `payments`, `fee_structures`, `academic_settings`, `scholarships`, `news_posts`, `gallery_items`, `events`, `notifications`, `report_comments`, `attendance_records`, `subjects`

## Authentication & Roles
- Supabase Auth with JWT
- Role-based access: `admin`, `teacher`, `parent`, `student`
- RLS policies enforce data isolation per role

## Key Features
1. **Public Website**: Hero, About, Admissions (with online application), News, Gallery, Contact, Events
2. **Online Admissions**: Multi-step form, Paystack fee collection, status tracking
3. **Admin Portal**: Dashboard, student management, payments, fee structures, scholarships, exam/results management, report card generation, attendance oversight, news/gallery management, user management, academic settings
4. **Teacher Portal**: Class attendance, results upload (with grade auto-remarks), report card comments
5. **Parent Portal**: View child's results, attendance, fee records, notifications, school news
6. **Student Portal**: View own results, attendance, timetable, school news
7. **Report Cards**: PDF generation with principal signature, per-student comments, batch comment input
8. **PWA Support**: manifest.json, service worker for offline access

## School Details
- **Name**: Elyon Schools (formerly El-Shaddai Preparatory School)
- **Founded**: January 4, 1994
- **Address**: 6, Orija Street, Ile-Epo Bus Stop, Ikotun-Idimu, Lagos, Nigeria
- **Phone**: +234 703 517 5566, +234 806 655 5965
- **Email**: elyononcam@gmail.com
- **Facebook**: https://web.facebook.com/elyonchildrensworld
- **Motto**: "Hardwork and Determination"
- **Levels**: Nursery (N1–N2), Primary (P1–P6), JSS (JSS1–JSS3), SSS (SSS1–SSS3)
- **Nigerian locale**: en-NG, currency: ₦ (NGN)
- **Admission number format**: ELY/YYYY/NNNN

## Grading System (Nigerian)
- A1 (75–100): Excellent
- B2 (70–74): Very Good
- B3 (65–69): Good
- C4 (60–64): Credit
- C5 (55–59): Credit
- C6 (50–54): Credit
- D7 (45–49): Pass
- E8 (40–44): Pass
- F9 (0–39): Fail

## Student Classes Order
Nursery 1 → Nursery 2 → Primary 1 → Primary 2 → Primary 3 → Primary 4 → Primary 5 → Primary 6 → JSS 1 → JSS 2 → JSS 3 → SSS 1 → SSS 2 → SSS 3

## Key Design Decisions
- Portal-less students (direct entry by admin) have `profile_id = null`; always use `profiles?.full_name || full_name || admission_number` fallback
- Dark mode supported via CSS variables + Tailwind `dark:` classes
- All monetary amounts in NGN displayed with Nigerian Intl.NumberFormat
- Supabase RLS policies enforce data isolation; admin operations use `createAdminClient()` (service key)
