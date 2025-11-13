# Elyon Schools Design Guidelines

## Design Approach

**Hybrid Strategy**: Reference-based for public marketing pages (drawing from modern university and professional service websites) + Design System approach for portals (Material Design patterns for data-dense dashboards).

**Core Principles**:
- **Institutional Trust**: Professional polish with warm, approachable aesthetics suitable for families
- **Clarity Over Decoration**: Clear information hierarchy, purposeful animations only
- **Dual Personality**: Welcoming public face + efficient administrative tools

## Typography

**Font System**:
- Primary: Inter (via Google Fonts CDN) - clean, professional, excellent readability
- Headings: Inter Bold/SemiBold (weights: 600, 700)
- Body: Inter Regular/Medium (weights: 400, 500)

**Scale**:
- Hero Headlines: text-5xl md:text-6xl (bold)
- Section Headers: text-3xl md:text-4xl (semibold)
- Subsections: text-xl md:text-2xl (semibold)
- Body Text: text-base md:text-lg (regular)
- Captions/Meta: text-sm (medium)

## Layout System

**Spacing Primitives**: Use Tailwind units `2, 4, 6, 8, 12, 16, 20, 24` for consistent rhythm
- Component padding: `p-6 md:p-8`
- Section spacing: `py-16 md:py-24`
- Card gaps: `gap-6 md:gap-8`
- Button padding: `px-6 py-3`

**Container Strategy**:
- Public pages: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Portal dashboards: `max-w-screen-2xl mx-auto px-4 md:px-6`
- Content blocks: `max-w-3xl` for readability

## Component Library

### Public Pages

**Navigation**:
- Sticky header with transparent-to-solid transition on scroll
- Logo left, horizontal nav center/right (desktop), hamburger menu (mobile)
- Two-tier: main nav + quick actions (Sign In, Apply Now CTA)
- Include social proof badge: "Trusted since 1994" with small badge icon

**Hero Section** (Home):
- Split layout: School crest/building image (40% width) left, content right
- Gradient overlay on image for depth
- Large headline + mission statement + dual CTAs (primary: "Start Admission", secondary: "Explore Programs")
- Subtle parallax scroll effect on background image

**Feature/Info Sections**:
- Alternating 2-column layouts (image-text, text-image)
- Stats counters: 3-4 column grid on About page (Students, Teachers, Years, Success Rate)
- Card grids: 3 columns desktop, 2 tablet, 1 mobile for features/programs

**Admissions Form**:
- Multi-step progress bar at top (steps 1-4: Personal Info, Guardian Details, Documents, Payment)
- Single-column form layout with grouped fields in cards
- Clear visual separation between sections
- Inline validation with green checkmarks for completed fields
- Save-as-draft button (ghost style) alongside primary "Continue" button

**Events Calendar**:
- Month view as default with list toggle
- Event cards: image thumbnail, title, date badge, location, brief description
- Filters: By category (Academic, Sports, Cultural), By month dropdown
- Large "Add to Calendar" buttons with icon (Google, iCal download)

**News/Blog**:
- Grid: 3 columns desktop showing featured image, title, excerpt, date, author
- Featured post: Full-width hero treatment at top
- Category tags as pills below each post
- "Read More" links, no truncated text

**Gallery**:
- Masonry grid layout with Supabase Storage images
- Lightbox modal on click with navigation arrows
- Category filters (Events, Campus, Students, Achievements)
- Lazy loading for performance

### Portal Dashboards

**Dashboard Layout Pattern** (All Roles):
- Left sidebar navigation (collapsible on mobile/tablet)
- Top bar: breadcrumb, search, notifications bell, profile dropdown
- Main content area with welcome card + quick stats row + data tables/cards

**Admin Dashboard**:
- 4-stat cards row: Pending Admissions, Active Students, Total Revenue, Upcoming Events
- Quick actions card: "Process Admission", "Upload Results", "Create Event", "Post News"
- Recent activity feed + charts (admission trends, payment status)
- Data tables with filters, sort, pagination for managing users/payments

**Teacher Portal**:
- Assigned classes cards (2-3 columns)
- "Upload Results" prominent CTA button
- Students list table with quick actions (view profile, message parent)
- Calendar widget showing upcoming classes/events

**Parent Portal**:
- Children cards (if multiple) - photo, name, class, quick stats
- Results viewer: tabbed by term, table format with subject/grade/remarks
- Fee payment history table with "Pay Now" CTAs
- Messages/announcements feed

**Student Portal**:
- Profile card with photo, admission number, class
- Results display: subject cards with grade visualization (progress bars/badges)
- Timetable view (weekly grid)
- Upcoming events list

**Shared Portal Components**:
- Cards: white background, rounded-lg, shadow-sm, hover:shadow-md transition
- Tables: striped rows, hover highlight, sortable headers with icons
- Buttons: solid primary for main actions, outline secondary, ghost for tertiary
- Form inputs: consistent height (h-12), focus rings in brand colors
- Status badges: colored pills (pending=yellow, approved=green, rejected=red, paid=blue)

### Forms & Interactions

**Input Fields**:
- Full-width inputs with clear labels above
- Placeholder text for examples
- Error states: red border + error message below
- Success states: green border + checkmark icon
- File upload: drag-and-drop zone with preview thumbnails

**Buttons**:
- Primary: solid green (#2FA84F), white text, rounded-md, shadow-sm
- Secondary: white background, green border, green text
- Disabled: gray with opacity, cursor-not-allowed
- Loading state: spinner icon + "Processing..." text
- Icon buttons: circular for actions like edit/delete

**Modals**:
- Centered overlay with backdrop blur
- Confirmation dialogs: icon, message, dual buttons (Cancel/Confirm)
- Form modals: header with close X, body with form, footer with actions

**Animations** (Minimal):
- Page transitions: subtle fade (200ms)
- Card hover: lift with shadow increase (150ms)
- Button hover: slight scale (1.02) or brightness increase
- Collapse/expand: smooth height transition (300ms)
- Avoid scroll-triggered animations beyond initial hero parallax

## Images

**Hero Image** (Home):
- Large, high-quality photo of school building or students in classroom
- Positioned left side (40% width on desktop), full-width on mobile above text
- Apply subtle gradient overlay (dark-to-transparent) for text contrast

**Additional Images**:
- About Page: School founder/principal photo, campus photos (2-3 images in grid)
- Academics: Classroom scenes, laboratory/library images
- Gallery Page: 20-30 diverse school photos (events, facilities, students)
- Events: Featured image for each event (16:9 aspect ratio)
- News: Featured image per post (landscape orientation)
- Profile Photos: Circular avatars throughout portals

**Image Treatment**:
- Rounded corners: rounded-lg for cards, rounded-xl for hero
- Aspect ratios: 16:9 for events/news, 4:3 for gallery, 1:1 for avatars
- Loading: blur-up placeholders during load

**Buttons on Images**:
- CTAs on hero: Frosted glass effect (backdrop-blur-md, bg-white/20)
- No hover color changes - rely on Button component's built-in states

This design creates a professional, trustworthy school website with efficient portals that serve distinct user needs while maintaining visual consistency through the brand's green and yellow palette.