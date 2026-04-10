# Elyon Schools Management System — Recreation Prompt

You are building a full-stack Nigerian school management system called **Elyon Schools Management System** for a K-12 institution.

## Core Goal
Create a production-ready, role-based school management web application using **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, **Shadcn UI**, **Supabase** (PostgreSQL + Auth + RLS), and **Paystack** for payments.

## Requirements

### Roles & Portals
Build dashboards and feature pages for 4 user roles:
1. **Admin** — Full control: students, fees, results, scholarships, admissions, reports, news, gallery, settings
2. **Teacher** — Attendance, results upload, report card comments
3. **Parent** — View child results, fees, attendance, notifications
4. **Student** — View own results, attendance, news

### School Info
- Name: **Elyon Schools**
- Address: 6, Orija Street, Ile-Epo Bus Stop, Ikotun-Idimu, Lagos, Nigeria
- Phone: +234 703 517 5566 | +234 806 655 5965
- Email: elyononcam@gmail.com
- Motto: **"Hardwork and Determination"**
- Founded: January 4, 1994 (as El-Shaddai Preparatory School)
- Classes: Nursery 1–2, Primary 1–6, JSS 1–3, SSS 1–3

### Database (Supabase)
Create tables: `profiles`, `students`, `admissions`, `exam_results`, `payments`, `fee_structures`, `academic_settings`, `scholarships`, `news_posts`, `gallery_items`, `events`, `notifications`, `report_comments`, `attendance_records`, `subjects`

Use Row Level Security (RLS) policies to enforce role-based data access.

### Authentication
Use Supabase Auth. After signup/login, look up `profiles.role` to determine the user's role and redirect them to the appropriate portal (`/admin`, `/teacher`, `/parent`, `/student`).

### Key Features to Build
1. **Public website**: landing page with hero (use school campus photo), about page (Our Story since 1994, 5 core values), admissions page (WhatsApp inquiry for fees), news listing, gallery, contact page with campus photo
2. **Online admissions**: multi-step form, Paystack payment for application fee, admin review and accept/reject workflow
3. **Payments module**: Paystack online payments + admin offline payment recording, outstanding fees tracker (subtract scholarship credits), fee type filter, CSV export
4. **Results management**: admin creates exams, teachers upload student scores + auto-generated remarks from grade, lock results once published
5. **Report cards**: PDF generation (jsPDF), principal signature, per-student comments, batch comment input for efficiency
6. **Scholarship management**: admin grants scholarships (full/percentage/fixed), visible in outstanding fees calculation
7. **Attendance**: teacher marks daily attendance per class, admin reviews
8. **News & Gallery**: admin creates/edits news posts with featured image URL, gallery management
9. **Notifications**: admin broadcasts to parents/students
10. **Policy pages**: `/teacher/policy` (staff handbook), `/parent/policy` (parent handbook), `/student/policy` (student rules)
11. **PWA**: manifest.json, service worker
12. **SEO**: sitemap.ts, robots.txt, metadata per page
13. **Security**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers in next.config.js

### Technical Notes
- Portal-less students have `profile_id = null`; always use `profiles?.full_name || full_name || admission_number`
- Nigerian currency: `new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })`
- Admission numbers: `ELY/YYYY/NNNN`
- Grade→Remark: A=Excellent, B=Very Good, C=Good/Credit, D=Pass, E=Pass, F=Fail
- Sort students by class order (N1→N2→P1…→SSS3) then alphabetically
- All Supabase admin operations use `createAdminClient()` with service key

### Design
- Primary colour: deep navy blue (#1a3a6b)
- Use Shadcn UI components throughout
- Mobile-responsive layouts
- Dark mode support
- Data tables with search, filter, and sort capabilities
- Toast notifications for all async operations
