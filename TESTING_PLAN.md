# Elyon Schools — Complete Testing Plan

> This document tells you exactly how to test every single page, button, link, form, and feature in the Elyon Schools application.
> Work through each section in order. Tick every checkbox [ ] as you complete it.
> Nothing is left out.

---

## Table of Contents

- [Section 0 — Before You Start](#section-0--before-you-start)
- [Section 1 — Public Website Pages](#section-1--public-website-pages-no-login-required)
- [Section 2 — Auth Pages (Login & Password)](#section-2--auth-pages)
- [Section 3 — Admissions Flow (End-to-End)](#section-3--admissions-flow-end-to-end)
- [Section 4 — Public Payments Page](#section-4--public-payments-page)
- [Section 5 — Admin Portal](#section-5--admin-portal)
- [Section 6 — Teacher Portal](#section-6--teacher-portal)
- [Section 7 — Parent Portal](#section-7--parent-portal)
- [Section 8 — Student Portal](#section-8--student-portal)
- [Section 9 — Security & Access Control](#section-9--security--access-control)
- [Section 10 — Navigation & Links](#section-10--navigation--links)
- [Section 11 — Mobile Responsiveness](#section-11--mobile-responsiveness)
- [Section 12 — Edge Cases & Validation](#section-12--edge-cases--validation)
- [What To Do When a Test Fails](#what-to-do-when-a-test-fails)

---

---

## Section 0 — Before You Start

Set up everything below FIRST before running any tests. Without these, several tests will fail.

### 0.1 — Test Accounts You Need

You need one account for each role. Create them in this order:

| Account | How to create it |
|---|---|
| **Admin** | Already exists from your setup in DEPLOYMENT_GUIDE.md |
| **Teacher** | Admin Dashboard → Users → Invite User → role: Teacher → accept the email invite |
| **Parent** | Admin Dashboard → Users → Invite User → role: Parent → accept the email invite |
| **Student** | Admin Dashboard → Users → Invite User → role: Student → accept the email invite |

> **NOTE:** Keep a Notepad open with all four email addresses and passwords so you can switch between them easily during testing.

### 0.2 — Test Data You Need

Before testing Teacher, Parent, and Student features, the admin must set up this data:

1. **Create at least 2 Subjects** — Admin Dashboard → Subjects → Add (e.g. "Mathematics" / `MATH`, "English Language" / `ENG`)
2. **Create at least 1 Exam** — Admin Dashboard → Exams → New Exam (e.g. "First Term Examination", First Term, 2025)
3. **Create a Student Record** linked to the student user — this requires the admin to go to Supabase SQL Editor and insert a row:
   ```sql
   INSERT INTO students (profile_id, admission_number, class, status, parent_profile_id)
   VALUES (
     'STUDENT-USER-UUID',   -- replace with student's auth UUID
     'ELY/2025/001',        -- any admission number
     'JSS 1',               -- any class
     'active',
     'PARENT-USER-UUID'     -- replace with parent's auth UUID
   );
   ```
4. **Assign the Teacher to the Student** — Supabase SQL Editor:
   ```sql
   INSERT INTO teacher_assignments (teacher_profile_id, student_id)
   VALUES (
     'TEACHER-USER-UUID',   -- teacher's auth UUID
     (SELECT id FROM students WHERE admission_number = 'ELY/2025/001')
   );
   ```

### 0.3 — Paystack Test Card Details

Use these details whenever a payment form appears. They simulate a real payment without charging any money.

| Field | Value |
|---|---|
| Card Number | `4084 0840 8408 4081` |
| Expiry Date | `12/26` (any future date works) |
| CVV | `408` |
| PIN | `0000` |
| OTP (one-time password) | `123456` |

### 0.4 — Browser Setup

- Use **Google Chrome** for testing (best compatibility)
- Open the website in a **normal browser window** (not incognito) when logged in
- To test multiple roles at the same time, open a **second window** in Incognito mode (`Ctrl+Shift+N` or `Cmd+Shift+N`)
- Keep your website URL handy: `https://your-vercel-address.vercel.app`

---

---

## Section 1 — Public Website Pages (No Login Required)

These pages must work for anyone visiting the website, without logging in.

---

### 1.1 — Homepage ( / )

Go to the root of your website (e.g. `https://elyon-schools.vercel.app`).

**Header / Navigation Bar**
- [ ] The school logo or name appears at the top left
- [ ] Navigation links are visible: Home, About, Academics, Admissions, News, Events, Gallery, Contact
- [ ] Clicking **"Home"** stays on the homepage
- [ ] Clicking **"About"** goes to `/about`
- [ ] Clicking **"Academics"** goes to `/academics` (or opens a dropdown)
- [ ] Clicking **"Admissions"** goes to `/admissions`
- [ ] Clicking **"News"** goes to `/news`
- [ ] Clicking **"Events"** goes to `/events`
- [ ] Clicking **"Gallery"** goes to `/gallery`
- [ ] Clicking **"Contact"** goes to `/contact`
- [ ] The **"Login"** button is visible and goes to `/login`

**Hero / Banner Section**
- [ ] A large banner image or coloured hero section is visible at the top
- [ ] The school name "Elyon Schools" appears
- [ ] Two CTA (call-to-action) buttons are visible: one for Admissions, one for more info
- [ ] Both CTA buttons navigate to the correct pages when clicked

**Stats Section**
- [ ] A section with numbers appears (e.g. years of excellence, students, staff) — content is visible and readable

**Features / Why Choose Us Section**
- [ ] A grid of feature cards is visible (e.g. qualified teachers, modern facilities, etc.)
- [ ] All card icons and text are readable

**Events Section on Homepage**
- [ ] An "Upcoming Events" section is visible
- [ ] If events have been created in Admin, they appear here
- [ ] If no events exist, placeholder events or a "no events" message shows
- [ ] Any "View All Events" button goes to `/events`

**News Section on Homepage**
- [ ] A news/updates section is visible
- [ ] If news posts have been published, they appear
- [ ] Any "View All News" or "Read More" button goes to `/news`

**Admissions CTA Section**
- [ ] A banner or section encouraging applications is visible
- [ ] The "Apply Now" button goes to `/admissions/apply`

**Gallery Preview**
- [ ] A grid or preview of gallery images appears
- [ ] Any "View Gallery" button goes to `/gallery`

**Footer**
- [ ] School name and description appear
- [ ] Quick links section has links: Home, About, Admissions, News, Events, Gallery, Contact
- [ ] **"Parent Portal"** or **"Login"** link goes to `/login`
- [ ] **"Student Portal"** link goes to `/login`
- [ ] **"Privacy Policy"** link goes to `/privacy`
- [ ] **"Terms of Service"** link goes to `/terms`
- [ ] School contact details (phone, email, address) are visible
- [ ] Copyright notice at the bottom is readable

---

### 1.2 — About Page ( /about )

- [ ] Page loads without errors
- [ ] School history and mission content is visible
- [ ] Page has a header and footer like all other pages
- [ ] Any buttons or links on the page work correctly

---

### 1.3 — Academics Pages

**Main Academics Page ( /academics )**
- [ ] Page loads
- [ ] Links or cards to sub-sections are visible: Nursery, Primary, Secondary
- [ ] Clicking "Nursery" or similar goes to `/academics/nursery`
- [ ] Clicking "Primary" goes to `/academics/primary`
- [ ] Clicking "Secondary" goes to `/academics/secondary`

**Nursery Page ( /academics/nursery )**
- [ ] Page loads with content about the nursery programme
- [ ] Back/navigation buttons work

**Primary Page ( /academics/primary )**
- [ ] Page loads with content about the primary programme
- [ ] Back/navigation buttons work

**Secondary Page ( /academics/secondary )**
- [ ] Page loads with content about the secondary programme
- [ ] Back/navigation buttons work

---

### 1.4 — Admissions Landing Page ( /admissions )

- [ ] Page loads without errors
- [ ] Content about the admission process is visible
- [ ] **"Apply Now"** button is present and goes to `/admissions/apply`
- [ ] **"Check Application Status"** link goes to `/admissions/status`
- [ ] Any download links (prospectus, timetable) work correctly

---

### 1.5 — Gallery Page ( /gallery )

- [ ] Page loads without errors
- [ ] Tab filters are visible: All Photos, Campus, Events, Sports, Graduation, Student Life
- [ ] Clicking **"All Photos"** shows all available images
- [ ] Clicking **"Campus"** filters to campus photos only
- [ ] Clicking **"Events"** filters to events photos only
- [ ] Clicking other tabs filters correctly
- [ ] If no real images are uploaded yet, placeholder/sample images appear
- [ ] Images load and display without broken image icons

---

### 1.6 — News Page ( /news )

- [ ] Page loads without errors
- [ ] If news posts have been published, they appear with title, summary, and date
- [ ] If no news exists, a "No news yet" or similar message shows
- [ ] Any individual news post links work (if implemented)

---

### 1.7 — Events Page ( /events )

- [ ] Page loads without errors
- [ ] "Upcoming Events" section appears
- [ ] If events have been created, they show with title, date, location, and category badge
- [ ] Category badges are colour-coded (Academic = blue, Sports = green, Cultural = purple, Other = grey)
- [ ] "Past Events" section appears at the bottom if any events are in the past
- [ ] **"View News & Updates"** button at the bottom goes to `/news`

---

### 1.8 — Contact Page ( /contact )

- [ ] Page loads without errors
- [ ] School contact information is visible (address, phone, email)
- [ ] The contact form has all fields: Name, Email, Phone, Subject (dropdown), Message
- [ ] **Test the form — submit with all fields filled in correctly:**
  - Fill in all fields with valid information
  - Click the **"Send Message"** or **"Submit"** button
  - [ ] A green success message or toast appears
  - [ ] The form resets (fields become empty again)
- [ ] The school address, phone numbers, and email addresses shown on the page are readable

---

### 1.9 — Downloads — Prospectus ( /downloads/prospectus )

- [ ] Page loads with the school prospectus document content
- [ ] School name, address, and contact details appear at the top
- [ ] Sections are visible: Vision, Mission, subjects, programmes, fees, etc.
- [ ] The **"Print / Save as PDF"** button works — clicking it opens the browser print dialog
- [ ] The **"Back to Admissions"** button goes to `/admissions`

---

### 1.10 — Downloads — Timetable ( /downloads/timetable )

- [ ] Page loads with the school timetable
- [ ] The **Primary School Timetable** table is visible with time slots and subjects
- [ ] The **Secondary School Timetable** table is visible with time slots and subjects
- [ ] BREAK and LUNCH rows appear in the timetable
- [ ] The **"Print / Save as PDF"** button works
- [ ] The **"Back"** button navigates correctly

---

### 1.11 — Terms of Service ( /terms )

- [ ] Page loads without errors
- [ ] Content about terms of service is visible and readable
- [ ] Header and footer are present

---

### 1.12 — Privacy Policy ( /privacy )

- [ ] Page loads without errors
- [ ] Content about the privacy policy (NDPR compliance) is visible
- [ ] Header and footer are present

---

---

## Section 2 — Auth Pages

### 2.1 — Login Page ( /login )

- [ ] Page loads without errors
- [ ] Email address field is present
- [ ] Password field is present
- [ ] **"Forgot your password?"** link is visible

**Test: Wrong credentials**
- [ ] Type any random email and password
- [ ] Click **"Sign In"**
- [ ] An error message appears (e.g. "Invalid credentials" or "Invalid login")
- [ ] You stay on the login page — you are NOT logged in

**Test: Correct Admin credentials**
- [ ] Type the admin email and password
- [ ] Click **"Sign In"**
- [ ] You are automatically redirected to `/admin` (the Admin Dashboard)

**Test: Correct Teacher credentials**
- [ ] Log out first (if logged in)
- [ ] Type the teacher email and password → click Sign In
- [ ] You are redirected to `/teacher` (the Teacher Dashboard)

**Test: Correct Parent credentials**
- [ ] Log out → type parent email and password → Sign In
- [ ] You are redirected to `/parent` (the Parent Dashboard)

**Test: Correct Student credentials**
- [ ] Log out → type student email and password → Sign In
- [ ] You are redirected to `/student` (the Student Dashboard)

**Test: Already logged-in redirect**
- [ ] While logged in as any user, manually go to `/login` in your browser
- [ ] You should be redirected to your dashboard automatically (not shown the login page again)

---

### 2.2 — Forgot Password Page ( /forgot-password )

- [ ] Click **"Forgot your password?"** from the login page — the page loads
- [ ] An email address field is present
- [ ] **"Back to Sign In"** link is present and goes back to `/login`
- [ ] Type a valid email address and click **"Send Reset Link"** (or similar)
- [ ] A success message appears (e.g. "Check your email for a password reset link")
- [ ] Check the email inbox — a password reset email arrives
  *(If not, check Spam. If still not there, check that your Supabase Auth URL Configuration is set correctly.)*

---

### 2.3 — Reset Password Page ( /reset-password )

*(This page is only reachable by clicking the link inside the password reset email.)*

- [ ] Click the reset link in the email — the page loads correctly
- [ ] A "New Password" field is present
- [ ] A "Confirm Password" field is present
- [ ] Type a new password in both fields
- [ ] Click **"Update Password"** or similar
- [ ] You are redirected to the login page (or logged in automatically)
- [ ] Try logging in with the new password — it works

---

---

## Section 3 — Admissions Flow (End-to-End)

Test the complete application journey from start to receipt.

### 3.1 — Application Form ( /admissions/apply )

The form has **4 steps**. Test each step.

**Step 1 — Student Information**
- [ ] Page loads with Step 1 visible
- [ ] Progress indicator shows Step 1 of 4
- [ ] Fields present: Student's First Name, Last Name, Date of Birth, Gender, Nationality
- [ ] Try clicking **"Next"** with all fields empty — validation errors appear, you cannot proceed
- [ ] Fill in all fields correctly → click **"Next"**
- [ ] You advance to Step 2

**Step 2 — Guardian Details**
- [ ] Fields present: Guardian Name, Phone Number, Email Address, Address
- [ ] **"Back"** button returns to Step 1 with your Step 1 data still filled in
- [ ] Try clicking **"Next"** with empty fields — validation errors appear
- [ ] Fill in all fields correctly → click **"Next"**
- [ ] You advance to Step 3

**Step 3 — Academic Information**
- [ ] Fields present: Class Applying For (dropdown), Previous School, How did you hear about us
- [ ] The class dropdown shows a list of all classes from Creche to SSS 3
- [ ] Fill in all fields → click **"Next"**
- [ ] You advance to Step 4

**Step 4 — Review & Submit**
- [ ] All the information you entered in Steps 1–3 is displayed for review
- [ ] **"Back"** button returns to Step 3
- [ ] Click **"Submit Application"**
- [ ] A success message or loading state appears
- [ ] You are automatically redirected to the payment page (`/admissions/payment?id=...&amount=...&email=...`)

---

### 3.2 — Payment Page ( /admissions/payment )

- [ ] Page loads correctly (if you are redirected here after applying)
- [ ] The payment amount is displayed (in Naira)
- [ ] The applicant's email is shown
- [ ] A **"Pay Now"** button is present
- [ ] Click **"Pay Now"** — the Paystack payment popup appears
- [ ] Enter the test card details from Section 0.3:
  - Card: `4084 0840 8408 4081`
  - Expiry: `12/26`
  - CVV: `408`
  - PIN: `0000`
  - OTP: `123456`
- [ ] Payment completes successfully
- [ ] You are redirected to the receipt page (`/payments/receipt?ref=...`)

---

### 3.3 — Application Status Lookup ( /admissions/status )

- [ ] Page loads without errors
- [ ] A search form is visible with a text field
- [ ] **Test by Application ID:** Type the Application ID from your test application → click Search
  - [ ] The application details appear: applicant name, class applied, status badge, date
- [ ] **Test by Guardian Email:** Clear the search, type the guardian email used in the application → click Search
  - [ ] The same application details appear
- [ ] **Test with invalid ID:** Type a random string → click Search
  - [ ] A "not found" or "no application found" message appears — NOT an error crash

---

### 3.4 — Payment Receipt Page ( /payments/receipt )

**Test with a real reference:**
- [ ] After completing the payment in Step 3.2, you land here automatically
- [ ] The receipt shows: payment reference, amount in Naira, payment type, payer name/email, date
- [ ] A **"Print Receipt"** button is visible — clicking it opens the print dialog
- [ ] A **"Back to Home"** or similar button is visible and works

**Test with a fake reference:**
- [ ] Manually go to: `https://your-website/payments/receipt?ref=FAKEREFERENCE123`
- [ ] The page shows a clear **"Receipt Not Found"** error message
- [ ] The page does NOT crash or show a blank white screen

---

---

## Section 4 — Public Payments Page ( /payments )

- [ ] Page loads without errors
- [ ] Three payment type cards are visible:
  1. **School Fees** — pay tuition for an enrolled student
  2. **Application Fee** — links to the admissions form
  3. **Donation** — voluntary contribution

**Test: Application Fee card**
- [ ] Click the Application Fee card or its button
- [ ] You are taken to `/admissions/apply`

**Test: School Fees payment**
- [ ] Click the **School Fees** card
- [ ] A form appears asking for Student ID (admission number) and Amount
- [ ] Fill in a valid admission number (e.g. `ELY/2025/001`) and an amount (e.g. `50000`)
- [ ] Click **"Pay"** or **"Proceed"**
- [ ] The Paystack popup opens
- [ ] Complete with test card details (Section 0.3)
- [ ] Payment succeeds → redirected to receipt page

**Test: Donation payment**
- [ ] Click the **Donation** card
- [ ] A form appears asking for Amount
- [ ] Enter an amount (e.g. `5000`) and your name/email
- [ ] Click **"Donate"** or **"Pay"**
- [ ] Paystack popup opens → complete with test card
- [ ] Receipt page shows after payment

---

---

## Section 5 — Admin Portal

**First:** Log in with your Admin account. You should be on the Admin Dashboard at `/admin`.

---

### 5.1 — Admin Dashboard ( /admin )

- [ ] Page loads — you see "Admin Dashboard" at the top
- [ ] Your name appears in the welcome message
- [ ] **5 statistics cards** are visible:
  - [ ] Pending Admissions — shows a number
  - [ ] Total Students — shows a number
  - [ ] Total Revenue — shows a Naira amount
  - [ ] Upcoming Events — shows a number
  - [ ] New Payments Today — shows a number
- [ ] **Quick Actions grid** shows 9 buttons: Process Admissions, Manage Exams, Manage Subjects, Announcements, Gallery, Post News, Create Event, Manage Users, All Students
- [ ] Each Quick Action button navigates to the correct page when clicked (test each one)
- [ ] **Recent Payments** table shows the last few payments (or "no payments" if none yet)
- [ ] Clicking the school logo or a "Visit Site" link opens the public homepage

---

### 5.2 — Admin Users Page ( /admin/users )

- [ ] Page loads — you see "Users" heading
- [ ] The table shows all users with columns: Name, Email, Role badge, Date Joined
- [ ] Role badges are colour-coded: Admin (red), Teacher (blue), Parent (purple), Student (green)
- [ ] The **search box** works — type a name or email, the table filters in real-time
- [ ] Clearing the search box shows all users again

**Test: Change a user's role**
- [ ] Find the test Teacher account in the list
- [ ] Click the Role dropdown next to their name
- [ ] Change it to "Parent"
- [ ] A success toast/message appears
- [ ] The badge on that row changes immediately to purple "Parent"
- [ ] Change it back to "Teacher" — confirm it reverts correctly

**Test: Invite a new user**
- [ ] Click the **"Invite User"** button
- [ ] A dialog/popup appears with fields: Full Name, Email, Role (dropdown)
- [ ] Fill in a new unique email address, a name, and select "Parent" as the role
- [ ] Click **"Send Invitation"**
- [ ] A success toast appears
- [ ] The dialog closes
- [ ] The new user appears in the table after refreshing

---

### 5.3 — Admin Students Page ( /admin/students )

- [ ] Page loads — "Students" heading visible
- [ ] A table of students is visible showing: Name, Admission Number, Class, Status
- [ ] If the test student record was created, it appears here
- [ ] Data in the table is readable

---

### 5.4 — Admin Admissions Page ( /admin/admissions )

- [ ] Page loads — "Admissions" heading visible
- [ ] All application records appear in the list
- [ ] Each card/row shows: student name, class applied, status badge, date submitted, guardian details

**Test: Filter tabs**
- [ ] Click **"All"** — all applications are shown
- [ ] Click **"Pending Payment"** — only pending_payment applications show
- [ ] Click **"Processing"** — only processing applications show
- [ ] Click **"Accepted"** — only accepted show
- [ ] Click **"Rejected"** — only rejected show
- [ ] Filter correctly hides applications of other statuses

**Test: Approve an application**
- [ ] Find your test application (it should be in "Processing" after payment was made)
- [ ] Click the **green "Accept"** button
- [ ] A success message appears
- [ ] The status badge on that application changes to "Accepted" (green)

**Test: Reject an application** *(use a second test application, or reset the accepted one)*
- [ ] Find an application in "Processing" status
- [ ] Click the **red "Reject"** button
- [ ] A success message appears
- [ ] The status badge changes to "Rejected" (red)

---

### 5.5 — Admin Payments Page ( /admin/payments )

- [ ] Page loads — "Payments" heading visible
- [ ] All payment records appear in a table or list
- [ ] Each payment shows: payer name, amount (₦), type badge, status badge, date
- [ ] Type badges appear in correct colours (blue for Application Fee, green for School Fee, etc.)
- [ ] Status badges appear: Paid (green), Pending (yellow), Failed (red)

**Test: Filter tabs**
- [ ] Click each filter tab — the list updates to show only that payment type
- [ ] "All" tab shows everything

---

### 5.6 — Admin News ( /admin/news and /admin/news/new )

**News List Page ( /admin/news )**
- [ ] Page loads — shows list of news posts with title and status (Published / Draft)
- [ ] **"New Post"** button is visible → click it → goes to `/admin/news/new`

**Create News Post ( /admin/news/new )**
- [ ] Page loads with a form
- [ ] Fields present: Title, Slug, Summary, Body (text area), Featured Image URL (optional), Status (dropdown: Draft/Published)
- [ ] Fill in all required fields:
  - Title: `Test News Article`
  - Slug: `test-news-article`
  - Summary: `This is a test`
  - Body: `This is the full content of the test article.`
  - Status: `Published`
- [ ] Click **"Save"** or **"Publish"**
- [ ] A success message appears
- [ ] You are redirected back to the news list (or see the post in the list)
- [ ] Go to the public website `/news` page — the new article appears there

---

### 5.7 — Admin Events ( /admin/events and /admin/events/new )

**Events List Page ( /admin/events )**
- [ ] Page loads — all events listed with title, category, date, location
- [ ] **"New Event"** button navigates to `/admin/events/new`

**Create Event ( /admin/events/new )**
- [ ] Page loads with a form
- [ ] Fields present: Title, Description, Start Date & Time, End Date & Time, Location, Category (dropdown: Academic/Sports/Cultural/Other)
- [ ] Fill in all fields:
  - Title: `Test Sports Day`
  - Start: pick any future date and time
  - End: pick a time after the start time
  - Location: `School Grounds`
  - Category: `Sports`
- [ ] Click **"Create Event"** or **"Save"**
- [ ] A success message appears
- [ ] Go to the public `/events` page — the new event appears in "Upcoming Events"

**Test: Invalid end time**
- [ ] Try setting the End time to be BEFORE the Start time
- [ ] Click Save — a validation error appears, form does not submit

---

### 5.8 — Admin Announcements ( /admin/announcements and /admin/announcements/new )

**Announcements List ( /admin/announcements )**
- [ ] Page loads — all announcements listed with title, target audience badge, published/draft badge
- [ ] **"New Announcement"** button navigates to `/admin/announcements/new`

**Test: Publish toggle**
- [ ] Find a published announcement — its badge says "Published" (green)
- [ ] Click the toggle/button to unpublish it — badge changes to "Draft" (yellow)
- [ ] Click it again — it goes back to "Published"

**Test: Delete**
- [ ] Find an announcement you can delete (use the test one)
- [ ] Click the **Delete** button (bin icon)
- [ ] A confirmation prompt appears — click Confirm/OK
- [ ] The announcement disappears from the list

**Create Announcement ( /admin/announcements/new )**
- [ ] Page loads with a form
- [ ] Fields present: Title, Body (text area), Target Audience (dropdown: All/Parents/Students/Teachers), Publish toggle
- [ ] Fill in:
  - Title: `Important Notice`
  - Body: `This is a test announcement for parents.`
  - Audience: `Parents`
  - Published: ON
- [ ] Click **"Create"** or **"Save"**
- [ ] Success message appears
- [ ] Log in as a Parent — the announcement appears on the Parent Dashboard ✓
- [ ] Log in as a Student — the announcement does NOT appear (it was set to Parents only)

---

### 5.9 — Admin Gallery ( /admin/gallery and /admin/gallery/upload )

**Gallery List ( /admin/gallery )**
- [ ] Page loads — image grid visible (empty or with images)
- [ ] **"Upload Image"** button navigates to `/admin/gallery/upload`

**Upload Image ( /admin/gallery/upload )**
- [ ] Page loads with an upload form
- [ ] A file picker area is present (click or drag-and-drop)
- [ ] Select a valid image file from your computer (JPG or PNG, under 5MB)
- [ ] A preview of the image appears after selection
- [ ] Fields present: Title, Description (optional), Category (dropdown)
- [ ] Fill in: Title: `Test School Photo`, Category: `Campus`
- [ ] Click **"Upload"**
- [ ] A success message/toast appears
- [ ] Go back to `/admin/gallery` — the new image appears in the grid
- [ ] Go to the public `/gallery` page — the image appears there too (it may take a moment to refresh)

**Test: Delete a photo**
- [ ] On the admin gallery page, hover over the test photo
- [ ] A **"Delete"** button appears on top of the image
- [ ] Click it → a confirmation prompt appears
- [ ] Click Confirm — the image disappears from the grid

---

### 5.10 — Admin Exams ( /admin/exams )

- [ ] Page loads — exam list visible
- [ ] **"New Exam"** form is visible with fields: Name, Term (dropdown: First/Second/Third), Year (number)
- [ ] Fill in: Name: `Mid-Term Test`, Term: `First`, Year: `2025`
- [ ] Click **"Create"** or **"Add"**
- [ ] The new exam appears in the list
- [ ] Each exam has a **Delete** button → click it → the exam is removed

---

### 5.11 — Admin Subjects ( /admin/subjects )

- [ ] Page loads — subject list visible with Name and Code columns
- [ ] **"New Subject"** form is visible with fields: Name, Code (short abbreviation)
- [ ] Fill in: Name: `Physics`, Code: `PHY`
- [ ] Click **"Add"** or **"Create"**
- [ ] The new subject appears in the list
- [ ] Each subject has a **Delete** button → click it → the subject is removed

---

---

## Section 6 — Teacher Portal

**Log out from Admin, then log in as the Teacher account.**

---

### 6.1 — Teacher Dashboard ( /teacher )

- [ ] Page loads — "Teacher Dashboard" heading with teacher's name in the welcome message
- [ ] **Summary cards** appear:
  - [ ] Assigned Students — shows the number of students assigned to this teacher
  - [ ] Classes — shows how many classes
- [ ] **Large green "Upload Student Results" button** is visible at the top
- [ ] **Class cards** appear below (e.g. "JSS 1 — 1 Student") — one card for each class in the assignment
- [ ] **Upcoming Events** section shows school events at the bottom

---

### 6.2 — View Class Students ( /teacher/classes/[class] )

- [ ] Click on a class card from the Teacher Dashboard
- [ ] A page loads showing the class name in the heading
- [ ] A table of students shows: Name, Admission Number, Class, Gender
- [ ] The test student `ELY/2025/001` appears in the list
- [ ] **"Back"** button returns to the Teacher Dashboard

---

### 6.3 — Upload Results ( /teacher/results/upload )

- [ ] Page loads — "Upload Student Results" heading
- [ ] **Exam dropdown** is present — it shows exams created by the Admin
- [ ] **Subject dropdown** is present — it shows subjects created by the Admin
- [ ] When NEITHER is selected, no student table is shown yet

**Test: Select exam and subject**
- [ ] Select the exam you created (e.g. "First Term Examination 2025")
- [ ] Select a subject (e.g. "Mathematics")
- [ ] A table appears below with your assigned students (the test student should be listed)

**Test: Enter a score**
- [ ] In the score box next to the test student, type `75`
- [ ] Click **"Save Results"**
- [ ] A success toast/message appears: "Results saved successfully" or similar
- [ ] The page stays open (you can now switch to a different subject)

**Test: Update existing score**
- [ ] Keep the same exam and subject selected
- [ ] Change the score from `75` to `80`
- [ ] Click **"Save Results"**
- [ ] A success message appears (no error about duplicate)
- [ ] Later when the parent/student views results, the score shows as `80`

**Test: Enter invalid score**
- [ ] Type `150` in a score box (above 100)
- [ ] Click **"Save Results"**
- [ ] A validation error appears — form does NOT submit

---

---

## Section 7 — Parent Portal

**Log out from Teacher, then log in as the Parent account.**

---

### 7.1 — Parent Dashboard ( /parent )

- [ ] Page loads — "Parent Dashboard" with parent's name
- [ ] **Announcements banner** appears at the top if any announcements targeted "Parents" or "All" have been published
  - The test announcement from Section 5.8 ("Important Notice" for Parents) should appear here
- [ ] **Children cards** appear — the linked student should appear with:
  - [ ] Student name
  - [ ] Class (e.g. JSS 1)
  - [ ] Admission number (e.g. ELY/2025/001)
  - [ ] **"View Results"** button
- [ ] **Upcoming Events** section at the bottom shows school events

> **NOTE:** If no children appear, the student record was not linked to this parent account. Go back to Section 0.2 and re-run the SQL to link the student.

---

### 7.2 — View Child Results ( /parent/results/[admissionNumber] )

- [ ] Click **"View Results"** on the child's card
- [ ] A page loads showing the child's name, class, and admission number at the top
- [ ] A results table is visible with columns: Exam, Term, Year, Subject, Score, Grade
- [ ] The result entered by the teacher (score: 80, subject: Mathematics, exam: First Term Examination) appears
- [ ] Grade is shown as a coloured badge (e.g. "A" in green for scores 70+)
- [ ] **"Back"** button returns to the Parent Dashboard

---

### 7.3 — Payment History ( /parent/payments )

- [ ] Navigate to Payments from the Parent Dashboard (look for a "Payment History" link or button)
- [ ] Page loads — "Payment History" heading
- [ ] All payments associated with this parent's email appear
  - The admission application fee payment should appear here
- [ ] Each row shows: Amount, Type, Status (Paid/Pending/Failed), Date
- [ ] Click on any payment row — a **receipt popup/modal** appears
- [ ] The modal shows: reference number, amount, payment date, status
- [ ] Click the **close button (X)** on the modal — it closes
- [ ] The payment list is still visible

---

---

## Section 8 — Student Portal

**Log out from Parent, then log in as the Student account.**

---

### 8.1 — Student Dashboard ( /student )

- [ ] Page loads — "Student Dashboard" with student's name
- [ ] **Student info** is visible: Class (e.g. JSS 1) and Admission Number (e.g. ELY/2025/001)
- [ ] **Recent Results** section shows up to 6 most recent results
  - The Mathematics result from the teacher upload should appear here
  - Shows: Subject, Exam name, Score, Grade badge
- [ ] **Average Score card** shows the student's calculated average
- [ ] **Upcoming Events** section at the bottom shows school events
- [ ] **School Announcements** — any announcement for "Students" or "All" appears here
- [ ] **"View All Results"** button is visible

---

### 8.2 — All Results ( /student/results )

- [ ] Click **"View All Results"** from the Student Dashboard
- [ ] Page loads — "My Results" or similar heading
- [ ] Full results table visible with columns: Exam, Term, Year, Subject, Score (out of 100), Grade, Remarks
- [ ] The test result (Mathematics, 80, Grade A or B) appears
- [ ] Grade badges are colour-coded correctly
- [ ] If teacher added remarks, they show in the Remarks column
- [ ] **"Back"** button returns to the Student Dashboard

---

---

## Section 9 — Security & Access Control

These tests make sure users cannot access pages they are not supposed to.

**Test: Unauthenticated access (log out first)**
- [ ] While logged out, manually go to `https://your-website/admin` → redirected to `/login`
- [ ] While logged out, manually go to `https://your-website/teacher` → redirected to `/login`
- [ ] While logged out, manually go to `https://your-website/parent` → redirected to `/login`
- [ ] While logged out, manually go to `https://your-website/student` → redirected to `/login`

**Test: Cross-role access (log in as Teacher, then try other portals)**
- [ ] Log in as Teacher
- [ ] Manually go to `https://your-website/admin` → you should NOT see the Admin Dashboard (redirected away or shown a "not authorised" page)
- [ ] Manually go to `https://your-website/parent` → should NOT see Parent Dashboard
- [ ] Manually go to `https://your-website/student` → should NOT see Student Dashboard

**Test: Cross-role access (log in as Parent, then try other portals)**
- [ ] Log in as Parent
- [ ] Manually go to `https://your-website/admin` → redirected away
- [ ] Manually go to `https://your-website/teacher` → redirected away
- [ ] Manually go to `https://your-website/student` → redirected away

**Test: Cross-role access (log in as Student, then try other portals)**
- [ ] Log in as Student
- [ ] Manually go to `https://your-website/admin` → redirected away
- [ ] Manually go to `https://your-website/teacher` → redirected away
- [ ] Manually go to `https://your-website/parent` → redirected away

**Test: Fake receipt page**
- [ ] While logged out (or in), go to: `https://your-website/payments/receipt?ref=TOTALLYINVALIDREF`
- [ ] The page shows a **"Receipt Not Found"** or error message
- [ ] The page does NOT show a blank white screen or a system error

**Test: Parent cannot see another parent's child results**
- [ ] While logged in as Parent, manually go to: `https://your-website/parent/results/SOMEOTHER-ADMISSION-NUMBER`
  (use an admission number that belongs to a different parent's child)
- [ ] The page should show an error or no results — not the other child's data

---

---

## Section 10 — Navigation & Links

Check that every navigation element works correctly across the whole site.

**Public website header (check from each page)**
- [ ] Logo → goes to homepage
- [ ] Home → homepage
- [ ] About → `/about`
- [ ] Academics → `/academics`
- [ ] Admissions → `/admissions`
- [ ] News → `/news`
- [ ] Events → `/events`
- [ ] Gallery → `/gallery`
- [ ] Contact → `/contact`
- [ ] Login button → `/login`

**Footer links**
- [ ] All Quick Links in footer navigate correctly
- [ ] Privacy Policy → `/privacy`
- [ ] Terms of Service → `/terms`
- [ ] Parent Portal / Login → `/login`
- [ ] Student Portal → `/login`

**Admin portal navigation**
- [ ] Every Quick Action from the Admin Dashboard navigates to the correct page
- [ ] "Back to Dashboard" button on every sub-page returns to `/admin`
- [ ] "Dashboard" breadcrumb link returns to `/admin`

**Teacher portal navigation**
- [ ] Teacher Dashboard "Upload Results" button → `/teacher/results/upload`
- [ ] Class cards → `/teacher/classes/[class]`
- [ ] "Back" buttons on all pages → Teacher Dashboard

**Parent portal navigation**
- [ ] "View Results" button → child results page
- [ ] "Payment History" → `/parent/payments`
- [ ] "Back" buttons → Parent Dashboard

**Student portal navigation**
- [ ] "View All Results" → `/student/results`
- [ ] "Back" button → Student Dashboard

---

---

## Section 11 — Mobile Responsiveness

Resize your browser window to simulate a mobile phone screen (approximately 375 pixels wide).
You can also press `F12` in Chrome → click the mobile device icon at the top of developer tools.

**Homepage on mobile**
- [ ] The page is readable — text is not cut off
- [ ] A **hamburger menu** (three horizontal lines ☰) appears in the header instead of the full navigation
- [ ] Clicking the hamburger menu opens a mobile navigation drawer
- [ ] All navigation links are accessible in the mobile menu
- [ ] Clicking a link in the mobile menu closes the menu and navigates correctly

**Login page on mobile**
- [ ] The login form fits on screen without horizontal scrolling
- [ ] Email and password fields are usable
- [ ] Sign In button is tappable

**Contact form on mobile**
- [ ] All form fields are visible and usable
- [ ] No fields are cut off or overlapping
- [ ] Submit button is visible and tappable

**Admissions form on mobile**
- [ ] All 4 steps are navigable
- [ ] Form fields are usable on a small screen

**Admin Dashboard on tablet (768px width)**
- [ ] Stats cards are readable (may stack into two columns)
- [ ] Quick actions grid is accessible

---

---

## Section 12 — Edge Cases & Validation

Test what happens when users make mistakes or try to break the system.

**Contact Form**
- [ ] Submit the contact form with ALL fields empty → validation errors appear, form does not send
- [ ] Submit with only the name filled in → validation errors appear for the remaining required fields
- [ ] Submit with an invalid email format (e.g. `notanemail`) → email validation error appears

**Admissions Form**
- [ ] On Step 1, click "Next" without filling anything → red error messages appear for each required field
- [ ] On Step 2, try to proceed without a guardian email → validation error appears
- [ ] On Step 3, try to proceed without selecting a class → validation error appears

**Results Upload (Teacher)**
- [ ] Try typing `150` in a score field (above 100) → error appears, cannot save
- [ ] Try typing `-5` (negative number) → error appears, cannot save
- [ ] Try typing `abc` (letters) in a score field → field rejects non-numeric input or shows an error

**User Invitation (Admin)**
- [ ] Try to invite a user with an email address already in the system → an error message appears (not a crash)
- [ ] Try to invite with the Email field empty → validation error, form does not submit

**Gallery Upload (Admin)**
- [ ] Try uploading a non-image file (e.g. a `.pdf` or `.docx` file) → an error appears: "Invalid file type" or similar
- [ ] Try uploading an image larger than 5MB → an error appears: "File too large" or similar
- [ ] Try to upload without selecting any file → the Upload button shows an error or is disabled

**Exam Deletion**
- [ ] Try deleting an exam that has NO results uploaded yet → exam is deleted cleanly, no error
- [ ] (Optional — do not do this if you want to keep your test data) Try deleting an exam that HAS results → check that it is handled gracefully

**Subject Code Uniqueness**
- [ ] Try creating a subject with the same code as an existing one (e.g. `MATH` again) → an error appears saying the code already exists

---

---

## What To Do When a Test Fails

If any test above does not produce the expected result, follow these steps:

### Step 1 — Identify the Problem

- Read the error message carefully — it usually tells you what went wrong
- Check if a red toast/notification appeared with more details
- Open your browser's developer console: press `F12` → click **"Console"** — look for red error messages

### Step 2 — Check the Most Common Causes

| Symptom | Most likely cause | Fix |
|---|---|---|
| Page is blank or shows 500 error | Missing/wrong environment variable in Vercel | Check Vercel → Settings → Environment Variables |
| Login works but wrong dashboard appears | User's profile role is wrong | Supabase → SQL Editor: `UPDATE profiles SET role = 'admin' WHERE id = '...';` |
| Payment button does nothing | Paystack key missing or wrong | Check `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` in Vercel |
| Receipt page shows "not found" for a real payment | Payment was not saved to database | Check Supabase → Table Editor → payments table |
| Gallery upload fails | Storage bucket missing or not public | Check Supabase → Storage → gallery bucket exists and is public |
| Announcement not showing for parent | Announcement audience is wrong | Admin → Announcements → check target audience is "Parents" or "All" |
| Teacher cannot see assigned students | Teacher assignment not created | Run the INSERT INTO teacher_assignments SQL from Section 0.2 |
| Parent cannot see child | Student not linked to parent | Run the INSERT INTO students SQL with the correct parent_profile_id |

### Step 3 — Fix and Re-Test

1. Apply the fix
2. If you changed environment variables in Vercel: **redeploy** (Vercel → Deployments → Redeploy)
3. Go back to the failing test and run it again
4. Tick the checkbox only when it fully passes

---

## Testing Summary

| Section | Number of Tests |
|---|---|
| Section 1 — Public Pages | ~60 checks |
| Section 2 — Auth Pages | ~15 checks |
| Section 3 — Admissions Flow | ~20 checks |
| Section 4 — Public Payments | ~8 checks |
| Section 5 — Admin Portal | ~55 checks |
| Section 6 — Teacher Portal | ~15 checks |
| Section 7 — Parent Portal | ~12 checks |
| Section 8 — Student Portal | ~10 checks |
| Section 9 — Security Tests | ~12 checks |
| Section 10 — Navigation | ~25 checks |
| Section 11 — Mobile | ~8 checks |
| Section 12 — Edge Cases | ~15 checks |
| **TOTAL** | **~255 checks** |

When all 255 checkboxes are ticked, your application is fully tested and ready for real users.
