# Elyon Schools Management System

## Overview

Elyon Schools is a comprehensive school management platform for a Nigerian educational institution established in 1994. It provides a public-facing marketing website and role-based portals for administrators, teachers, parents, and students. The system handles admissions, Paystack payments, content management, results, and day-to-day school operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Stack

- **Framework**: Next.js 16 (App Router) running on port 5000
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Auth**: Supabase Auth via `@supabase/ssr` (cookie-based sessions)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS (New York style)
- **Payments**: Paystack (inline JS popup + server-side verification)
- **Color Scheme**: Green primary HSL(133 65% 28%), gold accent HSL(50 100% 50%)

### Routing Strategy (App Router route groups)

- `(marketing)` — Public pages: home, about, academics, admissions, contact, gallery, news
- `(auth)` — Auth pages at `/login`, `/forgot-password`, `/reset-password`
- `(portal)` — Protected dashboards: `/admin`, `/teacher`, `/parent`, `/student`

### Key Files

- `proxy.ts` — Auth middleware (exported as `proxy` not `middleware` — Next.js 16 requirement)
- `next.config.js` — Next.js config with `allowedDevOrigins` for Replit
- `lib/supabase/server.ts` — Server-side Supabase client (cookie-based)
- `lib/supabase/client.ts` — Browser-side Supabase client
- `lib/supabase/admin.ts` — Service-role client for bypassing RLS on server writes
- `components/portal/PortalHeader.tsx` — Shared header with logout for all portals

### Environment Variables (Replit Secrets)

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_KEY` — Supabase service role key (for admin writes)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — Paystack public key (optional)
- `PAYSTACK_SECRET_KEY` — Paystack secret key for server-side verification (optional)

## Database Schema (Supabase)

Key tables:
- `profiles` — User profiles with `role` (admin | teacher | parent | student)
- `students` — Student records linked to profiles and parent
- `admissions` — Admission applications (`student_data` JSONB, `guardian_data` JSONB, `status`, `amount`)
- `payments` — Payment records linked to admissions
- `contact_submissions` — Contact form submissions
- `news_posts` — News articles with `status` (draft | published)
- `events` — School events with `start_ts`, `end_ts`, `category`
- `exams` — Exam records (name, term, year)
- `subjects` — Subject records
- `student_results` — Results linked to student, exam, subject
- `teacher_assignments` — Links teachers to students

## Features Implemented

### Public Website
- Homepage with live events from Supabase (fallback to hardcoded if none)
- News & Events page fetching from Supabase (server-rendered, revalidate: 60s)
- Contact form → saves to `contact_submissions` table
- Admission form (multi-step) → saves to `admissions` table → redirects to payment page
- Paystack payment page at `/admissions/payment` using inline popup

### API Routes
- `POST /api/contact` — Save contact form submission
- `POST /api/admissions` — Create admission application
- `POST /api/paystack/verify` — Verify Paystack payment + update admission status
- `GET/PATCH /api/admin/admissions` — Admin: list/update admissions (role-protected)
- `GET/POST /api/admin/news` — Admin: manage news posts
- `GET/POST /api/admin/events` — Admin: manage events

### Admin Portal (`/admin`)
- Dashboard with live stats (pending admissions, active students, revenue, upcoming events)
- Admissions list with Accept/Reject actions
- Students list with search
- News management (list + create new post)
- Events management (list + create new event)
- Payments view with revenue summary

### Teacher Portal (`/teacher`)
- Dashboard with assigned students and upcoming events (live data)
- Class view page (`/teacher/classes/[class]`)
- Results upload page (`/teacher/results/upload`) — select exam/subject, enter scores per student

### Student Portal (`/student`)
- Dashboard with real profile data (name, class, admission number)
- Recent results with grade badges
- Upcoming events
- Full results page (`/student/results`) — grouped by exam with averages

### Parent Portal (`/parent`)
- Dashboard listing real children from Supabase
- Child results page (`/parent/results/[admissionNumber]`)
- Payment history page (`/parent/payments`)

## Auth Flow

1. `proxy.ts` intercepts all requests, checks Supabase session
2. Portal routes (`/admin`, `/teacher`, `/parent`, `/student`) redirect to `/login` if no valid session + matching role
3. Login/signup flow at `/login` → role-based redirect to appropriate dashboard
4. Sign Out: calls `supabase.auth.signOut()` → redirects to `/login`
