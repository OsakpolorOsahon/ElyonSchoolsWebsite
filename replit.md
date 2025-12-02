# Elyon Schools Management System

## Overview

Elyon Schools is a comprehensive school management platform built with Next.js 14, providing both public-facing marketing pages and role-based portals for administrators, teachers, parents, and students. The system handles admissions, payments, content management, and day-to-day school operations for a Nigerian educational institution established in 1994.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14 with App Router
- **Hybrid Rendering**: Server components for marketing pages, client components for interactive portals
- **Routing Strategy**: App Router with route groups for logical separation
  - `(marketing)` - Public pages (home, about, admissions, contact)
  - `(auth)` - Authentication pages (login, registration, password reset)
  - `(portal)` - Protected admin/teacher/parent/student dashboards
- **State Management**: React Query (@tanstack/react-query) for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system (New York style variant)
- **Typography**: Inter font family (400, 500, 600, 700 weights) via Google Fonts

**Design System Principles**:
- Dual personality: Professional/institutional for public pages, efficient/practical for portals
- Color scheme: Green-based primary (HSL 133 65% 28%), gold accent (HSL 50 100% 50%)
- Component library: Full shadcn/ui suite with consistent spacing primitives (Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24)
- Responsive breakpoints: Mobile-first with 768px mobile threshold

### Backend Architecture

**Server Strategy**: Next.js Server Components and Server Actions
- **Development Server**: Custom server wrapper (`server/index.ts`) spawning Next.js dev process
- **API Layer**: Next.js Route Handlers for API endpoints (planned, currently minimal in `server/routes.ts`)
- **Data Fetching**: Server components fetch directly, client components use React Query
- **Session Management**: Supabase Auth with SSR support via `@supabase/ssr`

**Storage Pattern**:
- In-memory storage interface defined (`server/storage.ts`) with `MemStorage` implementation
- Interface supports CRUD operations for users (currently basic schema)
- Designed for future database integration (Drizzle ORM configured but minimal schema)

### Data Storage Solutions

**Database**: PostgreSQL (via Neon serverless driver)
- **ORM**: Drizzle ORM with schema defined in `shared/schema.ts`
- **Current Schema**: Minimal users table (id, username, password) - appears to be initial setup
- **Migration Strategy**: Drizzle Kit configured with migrations output to `./migrations`
- **Connection**: Environment-based DATABASE_URL required

**Type Definitions** (`types/database.ts`):
- UserRole: admin | teacher | parent | student
- Entities: Profile, Student, Admission, Payment (with status enums)
- Indicates planned comprehensive data model not yet implemented in actual schema

**File Storage**: Configured for Supabase Storage
- Image optimization setup for `*.supabase.co` domains
- 5MB body size limit for server actions

### Authentication and Authorization

**Provider**: Supabase Auth
- **Session Management**: Cookie-based with middleware handling (`middleware.ts`)
- **Client/Server Split**: Separate Supabase clients for browser and server contexts
- **Graceful Degradation**: Middleware allows public pages when Supabase not configured
- **Protected Routes**: Portal paths redirect to login if unauthenticated
- **Role-Based Access**: Profile-based roles (admin, teacher, parent, student) stored in database

**Auth Flow**:
1. Middleware intercepts all requests
2. Checks Supabase credentials availability
3. Public paths bypass authentication
4. Portal paths require session, redirect to login otherwise
5. Post-login routing based on user profile role

### External Dependencies

**Third-Party Services**:
- **Supabase**: Authentication, database, storage (optional - app degrades gracefully)
- **Neon Database**: PostgreSQL hosting (via `@neondatabase/serverless`)
- **Vercel**: Deployment target (vercel.json configuration present)

**Payment Integration** (planned):
- Paystack reference fields in database types suggest Nigerian payment gateway integration
- Not yet implemented in codebase

**Key NPM Packages**:
- **UI**: @radix-ui/* primitives (20+ components), cmdk, vaul (drawer), embla-carousel
- **Forms**: react-hook-form, @hookform/resolvers, zod
- **Data**: @tanstack/react-query, drizzle-orm, drizzle-zod
- **Calendar**: react-big-calendar, react-day-picker
- **Utilities**: clsx, tailwind-merge, class-variance-authority, papaparse
- **Development**: Replit-specific tooling (@replit/vite-plugin-*)

**Build Tools**:
- Vite for development with React plugin
- esbuild for production server bundling
- TypeScript with strict mode enabled
- PostCSS with Tailwind and Autoprefixer

**Deployment Configuration**:
- Next.js framework with custom build command
- Turbopack enabled for faster development
- Environment variables required: DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY