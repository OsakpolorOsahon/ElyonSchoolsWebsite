# Elyon Schools Management System

## Overview

Elyon Schools is a comprehensive school management platform for a Nigerian educational institution established in 1994. It provides a public-facing marketing website and role-based portals for administrators, teachers, parents, and students. The system handles admissions, Paystack payments, gallery management, announcements, content management, results, and day-to-day school operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Stack

- **Framework**: Next.js 16 (App Router) running on port 5000
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Auth**: Supabase Auth via `@supabase/ssr` (cookie-based sessions)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS (New York style)
- **Payments**: Paystack (inline JS popup + server-side verification)
- **Storage**: Supabase Storage (`gallery` bucket) for uploaded images
- **Color Scheme**: Green primary HSL(133 65% 28%), gold accent HSL(50 100% 50%)

### Routing Strategy (App Router route groups)

- `(marketing)` — Public pages: home, about, academics, admissions, gallery, news, payments, contact, downloads
- `(auth)` — Auth pages at `/login`, `/forgot-password`, `/reset-password`
- `(portal)` — Protected dashboards: `/admin`, `/teacher`, `/parent`, `/student`

### Key Files

- `proxy.ts` — Auth middleware (exported as `proxy` not `middleware` — Next.js 16 requirement)
- `next.config.js` — Next.js config with `allowedDevOrigins` for Replit
- `lib/supabase/server.ts` — Server-side Supabase client (cookie-based)
- `lib/supabase/client.ts` — Browser-side Supabase client
- `lib/supabase/admin.ts` — Service-role client for bypassing RLS on server writes
- `components/portal/PortalHeader.tsx` — Shared header with logout for all portals + current term badge from `academic_settings`
- `components/portal/PaymentReceiptModal.tsx` — Printable payment receipt modal
- `components/portal/ParentChildSelector.tsx` — Multi-child selector (tabs for 2-3, dropdown for 4+)

### Environment Variables (Replit Secrets)

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_KEY` — Supabase service role key (for admin writes)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — Paystack public key (optional)
- `PAYSTACK_SECRET_KEY` — Paystack secret key for server-side verification (optional)
- `NEXT_PUBLIC_SITE_URL` — Full URL of the site (used for invite redirects)

## Database Schema (Supabase)

The complete schema is in `supabase/setup.sql`. For existing installations, run migration files in `supabase/migrations/` in order:
1. `20240101000001_initial_schema.sql` — Core tables
2. `20240101000002_rls_policies.sql` — RLS policies for core tables
3. `20240102000001_new_features.sql` — New tables + payment columns
4. `002_extended_features.sql` — Student lifecycle, subjects mapping, fees, report cards, staff profiles

### Core Tables
- `profiles` — User profiles with `role` (admin | teacher | parent | student)
- `students` — Student records with `status` (active | graduated | withdrawn | transferred), `department` (Science | Commercial | Art, for SSS only), `graduation_year`, `transfer_note`, `repeating` (boolean, default false — when true, student stays in current class during bulk promotion and flag auto-clears after promotion run)
- `class_teacher` — Links one teacher to one class (14 classes: Nursery 1–2, Primary 1–6, JSS 1–3, SSS 1–3)
- `admissions` — Admission applications (`student_data` JSONB, `guardian_data` JSONB, `status`, `amount`)
- `payments` — Payment records with `student_id` FK, `recorded_by` (admin for offline), `notes`, `term`, `year`, `method` (paystack | cash | bank_transfer)
- `subjects` — Subject records with `applicable_classes` TEXT[] and `applicable_departments` TEXT[] (empty = applies to all)
- `exams` — Exam records with `published` BOOLEAN and `teacher_remarks_open` BOOLEAN. Publication is enforced by RLS: students and parents can only see results for published exams; teachers and admins see all.
- `student_results` — Results linked to student, exam, subject with `remarks` for teacher comments

### New Feature Tables
- `academic_settings` — Single-row config: `current_term`, `current_year`, `school_name`, `principal_name`, `principal_signature_url`
- `fee_structures` — Fee definitions per class/term/year/type with `amount`
- `staff_profiles` — Teacher profiles: `subject_specialty`, `qualification`, `phone`, `bio`
- `report_card_comments` — Principal's comments per student per exam with `teacher_comment` column
- `scholarships` — Student scholarships & fee waivers: `student_id`, `name`, `coverage_type` (full/percentage/fixed), `coverage_value`, `fee_types` TEXT[] (null=all fees), `applies_to_term`, `applies_to_year`, `active`, `notes`, `created_by`

### Other Tables
- `announcements` — School announcements with `target_audience`, `is_published`
- `gallery_items` — Gallery photos with `storage_path` and `public_url` from Supabase Storage
- `contact_submissions` — Contact form submissions
- `news_posts` — News articles with `status` (draft | published)
- `events` — School events with `start_ts`, `end_ts`, `category`

### Supabase Storage

- `gallery` bucket — Must be created in Supabase Storage with **public access enabled**
  - Go to Supabase → Storage → Create bucket named `gallery` → toggle Public ON

## Features Implemented

### Public Website
- Homepage with live events from Supabase (fallback to hardcoded if none)
- Gallery page (`/gallery`) — fetches from `gallery_items` table; falls back to gradient placeholders if empty
- News & Events page fetching from Supabase (server-rendered, revalidate: 60s)
- Contact form → saves to `contact_submissions` table
- Admission form (multi-step) → saves to `admissions` table → redirects to payment page
- Paystack payment page at `/admissions/payment` using inline popup → redirects to receipt on success
- **Public Payments page** (`/payments`) — School fees, donations via Paystack inline
- **Payment Receipt** (`/payments/receipt`) — Printable receipt page (query params: ref, amount, type, name)
- **Downloadable Prospectus** (`/downloads/prospectus`) — Print-friendly school prospectus
- **Downloadable Timetable** (`/downloads/timetable`) — Primary and secondary timetables

### API Routes
- `POST /api/contact` — Save contact form submission
- `POST /api/admissions` — Create admission application
- `POST /api/paystack/verify` — Verify Paystack admission payment + update admission status
- `POST /api/paystack/general` — Verify general Paystack payments (school fees, donations, parent fee payments) + record to DB. Auto-links `student_id` and `term/year` from metadata/academic_settings
- `GET/PATCH /api/admin/admissions` — Admin: list/update admissions (role-protected)
- `POST/PATCH /api/admin/students` — Admin: create student record (POST), update status/class/department (PATCH). Validates class against ALL_CLASSES whitelist, department restricted to SSS classes, graduation_year 1994-2100, transfer_note max 500 chars
- `POST /api/admin/students/promote` — Admin: bulk end-of-year promotion. Moves each active student to next class (SSS 3 → graduated). Accepts `skipIds` for repeating students. Returns per-student error details for unknown classes
- `GET/POST /api/admin/news` — Admin: manage news posts
- `GET/POST /api/admin/events` — Admin: manage events
- `GET/POST/PATCH/DELETE /api/admin/announcements` — Admin: manage announcements
- `GET/POST/DELETE /api/admin/gallery` — Admin: upload/manage gallery images (Supabase Storage)
- `GET/POST/PATCH /api/admin/users` — Admin: list users, update roles, invite by email
- `GET /api/report-card/[studentId]/[examId]` — Assemble report card data (student info, results, school settings, principal comment). Role-gated: students see only their own, parents see their children, teachers/admins see all. Unpublished exams blocked for student/parent roles.
- `POST /api/report-card/[studentId]/[examId]` — Admin only: upsert principal's comment per student per exam
- `GET/POST/DELETE /api/admin/fee-structures` — Admin: CRUD for fee structures. Server-side validation: class/term/fee_type allowlists, year 2000-2100, amount > 0. Unique constraint on (class, term, year, fee_type)
- `POST /api/admin/payments` — Admin: record offline payments (cash/bank_transfer). Validates student_id, amount, payment_type allowlist, method. Auto-generates reference if not provided
- `GET/POST/PATCH/DELETE /api/admin/scholarships` — Admin: full CRUD for student scholarships. GET supports ?student_id= filter. Validates coverage_type, percentage ≤ 100, positive values
- `POST/DELETE /api/admin/signature` — Admin: upload/delete principal signature to Supabase Storage. Upserts URL to `academic_settings`

### Admin Portal (`/admin`)
- Dashboard with live stats + **new payments notification badge** + "New" badges on recent payments
- **Quick Actions**: Process Admission, Upload Results, Announcements, Gallery, Post News, Create Event, Manage Users, Settings
- Admissions list with Accept/Reject actions
- **Students** (`/admin/students`) — Full lifecycle management: filter by status (active/graduated/withdrawn/transferred), search, add new students, change status, promote/graduate individual students, set SSS department. Buttons for individual promote/graduate and link to bulk promotion
- **End-of-Year Promotion** (`/admin/promotion`) — Bulk promotion page: preview all active students grouped by class level, mark individual students as "Repeating" to skip, confirm to promote all to next class (SSS 3 → graduated). Shows error details on partial failure
- **Announcements** (`/admin/announcements`) — list, publish/unpublish, delete
- **Announcements create** (`/admin/announcements/new`) — title, body, target audience, publish toggle
- **Gallery** (`/admin/gallery`) — grid view with delete; image upload to Supabase Storage
- **Gallery upload** (`/admin/gallery/upload`) — file picker, title, description, category
- **User management** (`/admin/users`) — list all users, inline role change, invite by email
- **Subjects** (`/admin/subjects`) — Create subjects, edit applicability (multi-select for `applicable_classes` and `applicable_departments`), delete subjects
- **Exams** (`/admin/exams`) — Create exams (default unpublished/draft), publish/unpublish toggle with Draft/Published badges, delete exams
- **Settings** (`/admin/settings`) — Academic configuration: current term, current year, school name, principal name (stored in `academic_settings` singleton)
- News management (list + create new post)
- Events management (list + create new event)
- **Payments** (`/admin/payments`) — Revenue summary card, Payment Records tab with filter by type (All/Admission Fee/School Fee/Donation/Offline), Outstanding Fees tab (per-student balance vs fee structures for current term, color badges: green=paid/amber=partial/red=unpaid, CSV export), Record Offline Payment dialog (student search, amount, type, method, date, reference, notes). Receipt buttons for successful payments
- **Fee Structures** (`/admin/fee-structures`) — CRUD for fee definitions per class/term/year/type (tuition, pta_levy, books, uniform, technology_fee, sports_fee, lab_fee, exam_fee). Grouped by class with totals. Filter by class and term
- **Scholarships** (`/admin/scholarships`) — Manage scholarships and fee waivers per student. Coverage types: full (100%), percentage (e.g. 50%), or fixed amount (e.g. ₦25,000). Can target all fees or specific fee types. Optionally restrict to a specific term/year. Toggle active/inactive, edit, delete. Also accessible via "Scholarship" button on each student card in the Students page
- **Principal Signature** (`/admin/settings`) — Upload/replace/remove principal's signature image (PNG/JPG, max 2 MB), stored at `gallery/signatures/principal.png`

### Teacher Portal (`/teacher`)
- Dashboard with assigned students and upcoming events (live data)
- Class view page (`/teacher/classes/[class]`) — exam selector + "View Report Card" links per student
- Results upload page (`/teacher/results/upload`) — select exam/subject, enter scores + remarks per student. Subjects are filtered by `applicable_classes` and `applicable_departments` (SSS classes only) — empty arrays mean "applies to all"

### Admin Portal — Edit & Delete Coverage (Task #12)
- **Students** (`/admin/students`): Edit button (admission_number, gender, parent link) + Delete button per student card. API (`/api/admin/students`): PATCH extended + DELETE added.
- **Exams** (`/admin/exams`): Edit button (name, term, year) opens inline dialog. Direct Supabase update.
- **Events** (`/admin/events`): Edit icon links to `/admin/events/[id]/edit` (new page). Delete button with confirm. API: PATCH + DELETE added.
- **News** (`/admin/news`): Edit link to `/admin/news/[id]/edit` (new page). Delete button. API: PATCH + DELETE added.
- **Announcements** (`/admin/announcements`): Edit button (title, body, audience) opens dialog. API PATCH extended for full edit.
- **Gallery** (`/admin/gallery`): Edit button (title, description, category) on hover overlay opens dialog. API PATCH added.

### Student Portal (`/student`)
- Dashboard with real profile data (name, class, admission number)
- **Announcements section** — shows published announcements targeting 'all' or 'students'
- Recent results with grade badges
- **Fee status card** — Shows current term expected fees (after scholarship discount if any), amount paid, outstanding balance with color-coded status badge (green=paid, amber=partial, red=unpaid). Shows scholarship name and credit amount when applicable
- Upcoming events
- Full results page (`/student/results`) — grouped by exam with averages, published-only filter, term selector, "View Report Card" link per exam

### Parent Portal (`/parent`)
- Dashboard with **child selector** — tabs for 2-3 children, dropdown for more. All data filters to selected child
- **Announcements section** — shows published announcements targeting 'all' or 'parents'
- **Fees page** (`/parent/fees`) — Current term fee breakdown by child's class. Shows scholarship discount notice when active (scholarship name + credit amount). Expected fees shown after scholarship deduction (original struck through). Fee breakdown table has "Scholarship" badge on applicable items. Outstanding balance and "Pay All" button. Payment history with receipt links
- Child results page (`/parent/results/[admissionNumber]`) — published-only filter, term selector, "View Report Card" link per exam
- Payment history page (`/parent/payments`) — includes child-linked offline payments, **Receipt** links to dedicated receipt page

### Report Card (`/report-card/[studentId]/[examId]`)
- Print-optimized report card page with school logo, student info, results table, grades, teacher remarks
- Principal's comment field (admin-editable textarea, saved to `report_card_comments` table)
- Signature lines and school stamp area
- "Print / Save as PDF" button triggers browser print dialog
- `@media print` CSS hides all navigation, only the report card prints on A4
- Role-gated: students see only their own, parents see their children, unpublished exams blocked for student/parent

## Auth Flow

1. `proxy.ts` intercepts all requests, checks Supabase session
2. Portal routes (`/admin`, `/teacher`, `/parent`, `/student`) redirect to `/login` if no valid session + matching role
3. Login/signup flow at `/login` → role-based redirect to appropriate dashboard
4. Sign Out: calls `supabase.auth.signOut()` → redirects to `/login`

## Setup Notes for Production

1. Run all SQL migrations in Supabase SQL Editor (in order)
2. Create `gallery` bucket in Supabase Storage with public access
3. Set all environment variables in Replit Secrets
4. Ensure `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` are set for payments to work
5. Ensure `NEXT_PUBLIC_SITE_URL` is set to the production URL for invite emails to work
