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

1. **Academic Settings** — Admin Dashboard → Settings → Set current term (e.g. "First") and year (e.g. 2025)
2. **Create at least 2 Subjects** — Admin Dashboard → Subjects → Add (e.g. "Mathematics" / `MATH`, "English Language" / `ENG`). Set applicable classes to include your test class.
3. **Create at least 1 Exam** — Admin Dashboard → Exams → New Exam (e.g. "First Term Examination", First Term, 2025)
4. **Create a Student Record** — Admin Dashboard → Students → Add Student → select the student user account, set admission number (e.g. `ELY/2025/001`), class (e.g. `JSS 1`), gender, and link to the parent user account.
5. **Assign Class Teacher** — Admin Dashboard → Class Teachers → Assign the teacher account to the student's class (e.g. JSS 1).
6. **Create Fee Structures** — Admin Dashboard → Fee Structures → Add fees for the student's class and current term/year (e.g. tuition: ₦50,000).

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
- [ ] Enter the test card details from Section 0.3
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
- [ ] **4 statistics cards** are visible:
  - [ ] Pending Admissions — shows a number
  - [ ] Active Students — shows a number
  - [ ] Total Revenue — shows a Naira amount
  - [ ] Upcoming Events — shows a number
- [ ] **Quick Actions grid** shows buttons including: Process Admissions, Manage Exams, Manage Subjects, Announcements, Gallery, Post News, Create Event, Manage Users, All Students, Fee Structures, Staff Profiles, Class Teachers, Settings
- [ ] Each Quick Action button navigates to the correct page when clicked (test each one)
- [ ] **Recent Activity** section shows recent admission applications
- [ ] **Pending Admissions** section shows recent applications with Review buttons
- [ ] **Recent Payments** table shows the last few payments (or "no payments" if none yet)
- [ ] Clicking the school logo or a "Visit Site" link opens the public homepage

**Results Submission Status Widget**
- [ ] A "Results Submission Status" section appears at the bottom
- [ ] It shows the name and term/year of the most recent exam
- [ ] All 14 classes are displayed in a grid (Nursery 1 through SSS 3)
- [ ] Classes with at least one result uploaded show a green check icon
- [ ] Classes without results show a grey X icon
- [ ] Clicking a class cell navigates to the students page

---

### 5.2 — Admin Users Page ( /admin/users )

- [ ] Page loads with a list of all user accounts
- [ ] Each row shows: Name, Email, Role (with coloured badge), Joined date
- [ ] A search bar is present — searching filters the list in real-time
- [ ] Each user has a "Change Role" dropdown

**Test: Change a user's role**
- [ ] Select a different role from the dropdown for one user
- [ ] The role badge updates immediately
- [ ] A success toast appears

**Test: Invite a new user**
- [ ] Click **"Invite User"** — a dialog opens
- [ ] Fields present: Full Name, Email Address, Role (dropdown)
- [ ] Fill in all fields and click **"Send Invitation"**
- [ ] A success toast appears with the invite confirmation
- [ ] The new user appears in the list (might need to refresh)

---

### 5.3 — Admin Students Page ( /admin/students )

- [ ] Page loads with a list of all students
- [ ] Header shows total count of filtered students
- [ ] **Status filter tabs** are visible: All, Active, Graduated, Withdrawn, Transferred — each shows a count
- [ ] Clicking a tab filters the student list
- [ ] **Search bar** works — search by name, admission number, or class
- [ ] **"End-of-Year Promotion"** button is visible
- [ ] **"Add Student"** button is visible

**Test: Add a new student**
- [ ] Click **"Add Student"** — a dialog opens
- [ ] Fields: Student Account (dropdown), Admission Number, Class, Gender, Parent Account (dropdown), Department (for SSS only)
- [ ] Only student accounts without an existing record are available in the dropdown
- [ ] Fill in all required fields → click **"Save"**
- [ ] A success toast appears
- [ ] The new student appears in the list

**Test: Student actions (for each active student)**
- [ ] **Repeat button** — clicking toggles repeating status, badge appears/disappears
- [ ] **Set Dept button** (SSS classes only) — opens department dialog with Science/Commercial/Art options
- [ ] **Promote button** — opens confirmation dialog showing current and next class; confirming promotes the student
- [ ] **Graduate button** (SSS 3 only) — opens confirmation; confirming marks the student as graduated
- [ ] **Payment button** — opens offline payment dialog (tested below)
- [ ] **Report button** (when an exam is selected) — navigates to printable report card
- [ ] **Results button** — opens cumulative results history dialog (see 5.3.1)
- [ ] **Status badge** — clicking opens status change dialog (active/graduated/withdrawn/transferred)

**Test: Change student status**
- [ ] Click the status badge of a student → dialog opens
- [ ] Change to "withdrawn" → Save → the student now shows in the Withdrawn tab
- [ ] Change to "transferred" → a "Transfer Note" text area appears → fill it in → Save
- [ ] The transfer note shows beneath the student's name

**Test: Offline payment recording**
- [ ] Click **"Payment"** on an active student — a dialog opens
- [ ] Fields: Amount, Payment Type (dropdown with tuition/books/uniform etc.), Method (cash/bank transfer), Date, Reference, Notes
- [ ] Enter amount ₦25,000, type school_fee, method cash → click "Record Payment"
- [ ] Success toast appears
- [ ] The payment appears in Admin Payments page

---

#### 5.3.1 — Cumulative Results View

- [ ] Click the **"Results"** button on any student card
- [ ] A dialog opens showing "Results History — [Student Name]"
- [ ] The dialog shows all exams the student has results for, grouped by term and year
- [ ] Each exam group shows: exam name, term, year, published/draft badge, and average score
- [ ] Each exam group has a table with: Subject, CA score, Exam score, Total, Grade
- [ ] Each exam group has a "View Report Card" link that navigates to `/report-card/[studentId]/[examId]`
- [ ] If a student has no results, a "No results recorded" message appears

---

### 5.4 — Admin Exams Page ( /admin/exams )

- [ ] Page loads with a list of exams
- [ ] Each exam shows: name, term, year, published status badge, teacher-remarks toggle
- [ ] **"Create Exam"** button is present

**Test: Create an exam**
- [ ] Click "Create Exam" → fields: Name, Term (dropdown), Year
- [ ] Fill in and submit → the new exam appears in the list

**Test: Publish/unpublish**
- [ ] Click the "Publish" toggle on an exam → status changes to Published (green badge)
- [ ] Click again → status changes back to Draft

**Test: Toggle teacher remarks**
- [ ] Click the teacher-remarks toggle → changes the "Remarks Open" status

---

### 5.5 — Admin Subjects Page ( /admin/subjects )

- [ ] Page loads with a list of subjects
- [ ] Each subject shows: name, code, applicable classes, applicable departments
- [ ] **"Add Subject"** button is present

**Test: Create a subject**
- [ ] Click "Add Subject" → fields: Name, Code, Applicable Classes (multi-select), Applicable Departments (multi-select)
- [ ] Fill in name "Physics", code "PHY", classes "SSS 1, SSS 2, SSS 3", department "Science"
- [ ] Submit → the subject appears in the list

**Test: Subject-department mapping**
- [ ] Confirm that subjects with department restrictions only show those departments
- [ ] Confirm that subjects with no department restrictions are available to all departments
- [ ] Subjects with class restrictions only apply to those classes

---

### 5.6 — Admin Admissions Page ( /admin/admissions )

- [ ] Page loads with all admission applications
- [ ] Each application shows: applicant name, class applied, status, date
- [ ] **Accept** and **Reject** buttons are present for applications in "processing" status
- [ ] Clicking **Accept** changes status to "accepted"
- [ ] Clicking **Reject** changes status to "rejected"

---

### 5.7 — Admin Payments Page ( /admin/payments )

- [ ] Page loads with a table of all payments
- [ ] Tab filters: All, Success, Pending, Failed
- [ ] Each row shows: payer name, amount, type, status badge, method, reference, date
- [ ] Clicking a payment reference or row navigates to the receipt page

---

### 5.8 — Fee Structures ( /admin/fee-structures )

- [ ] Page loads with fee structure records grouped by class
- [ ] **"Add Fee"** button is present

**Test: Create a fee structure**
- [ ] Click "Add Fee" → fields: Class (dropdown with all 14 classes), Term, Year, Fee Type (dropdown), Amount
- [ ] Fee Type dropdown includes: tuition, pta_levy, books, uniform, technology_fee, sports_fee, lab_fee, exam_fee, and custom
- [ ] Fill in: JSS 1, First, 2025, tuition, ₦50,000 → Save
- [ ] The fee appears in the list

**Test: Outstanding fees calculation**
- [ ] Go to the Outstanding Fees tab (if present)
- [ ] All active students should be listed with their expected fees for the current term
- [ ] Expected amount should match the sum of fee structures for their class
- [ ] Paid amount should reflect successful payments (fee-relevant types only)
- [ ] Outstanding = Expected - Paid

---

### 5.9 — Admin Announcements Page ( /admin/announcements )

- [ ] Page loads with existing announcements (or empty state)
- [ ] **"New Announcement"** button navigates to creation form
- [ ] Create a new announcement with title, body, and target audience (all/parents/teachers/students)
- [ ] The announcement appears in the list after creation
- [ ] Toggle published/unpublished status

---

### 5.10 — Admin News, Events & Gallery

**Create News Post ( /admin/news/new )**
- [ ] Form with title, summary, body, featured image URL
- [ ] Submit → the post appears on the public news page

**Create Event ( /admin/events/new )**
- [ ] Form with title, description, start/end dates, location, category
- [ ] Submit → the event appears on the public events page

**Gallery Upload ( /admin/gallery/upload )**
- [ ] Upload form with title, description, category, image file
- [ ] Submit → the image appears in the public gallery

---

### 5.11 — Admin Class Teachers ( /admin/class-teachers )

- [ ] Page loads with a list of all 14 classes
- [ ] Each class shows the currently assigned teacher (or "Not assigned")
- [ ] **"Assign"** or **"Change"** button for each class
- [ ] Select a teacher from the dropdown → Save → the assignment updates

---

### 5.12 — Admin Settings ( /admin/settings )

- [ ] Page loads with current academic settings
- [ ] Fields: Current Term (dropdown: First/Second/Third), Current Year, School Name, Principal Name
- [ ] Change the term → Save → the value persists after refresh
- [ ] Change the year → Save → verify it updates

---

### 5.13 — Admin Bulk Promotion ( /admin/promotion )

- [ ] Page loads with promotion controls
- [ ] Shows a class-by-class breakdown of active students
- [ ] **"Promote All"** or **"Run End-of-Year Promotion"** button is present
- [ ] Clicking promote:
  - [ ] Students in Nursery 1 → Nursery 2, Primary 1 → Primary 2, etc.
  - [ ] Students in SSS 3 → marked as graduated
  - [ ] Students marked as "Repeating" stay in their current class
- [ ] A summary shows how many students were promoted, graduated, and held back

---

### 5.14 — Admin Staff Profiles ( /admin/staff )

- [ ] Page loads with a list of all users with the "teacher" role
- [ ] Each teacher is shown as a card
- [ ] Teachers with a staff profile show: subject specialty, qualification, phone, bio
- [ ] Teachers without a profile show a **"Profile Set"** / **"No Profile"** badge
- [ ] Search bar filters by name, email, or specialty

**Test: Add a staff profile**
- [ ] Click **"Add Profile"** on a teacher without a profile — a dialog opens
- [ ] Fields: Subject Specialty, Qualification, Phone Number, Bio
- [ ] Fill in all fields → click "Save Profile"
- [ ] Success toast appears; the card now shows the profile details

**Test: Edit a staff profile**
- [ ] Click **"Edit Profile"** on a teacher with an existing profile
- [ ] The dialog opens with pre-filled values
- [ ] Change the specialty → Save → the card updates with the new value

---

### 5.15 — Report Cards ( /report-card/[studentId]/[examId] )

- [ ] Navigate from Admin Students page (select an exam, click "Report" on a student)
- [ ] The report card shows the school name, student name, class, admission number
- [ ] A table of subjects with CA score (0-40), Exam score (0-60), Total (0-100), and Grade
- [ ] Grading scale: A≥70, B≥60, C≥50, D≥45, E≥40, F<40
- [ ] Total and average are calculated correctly
- [ ] Principal comment section shows if a comment has been added
- [ ] **"Print Report Card"** button opens the browser print dialog
- [ ] The printed version is properly formatted (no navigation bars, clean layout)

---

---

## Section 6 — Teacher Portal

**First:** Log in with your Teacher account. You should be on the Teacher Dashboard at `/teacher`.

---

### 6.1 — Teacher Dashboard ( /teacher )

- [ ] Page loads — "Teacher Dashboard" at the top with your name
- [ ] Your assigned class(es) are displayed
- [ ] Quick links: Upload Results, My Classes
- [ ] School announcements targeting "teachers" or "all" are shown
- [ ] Upcoming events are shown

---

### 6.2 — Teacher Classes ( /teacher/classes/[class] )

- [ ] Navigate from the dashboard to your assigned class
- [ ] A list of students in that class is displayed
- [ ] Each student shows: name, admission number, gender, department (for SSS)

---

### 6.3 — Teacher Results Upload ( /teacher/results/upload )

- [ ] Page loads with exam selection dropdown
- [ ] Select an exam where teacher remarks are open
- [ ] Subject dropdown shows subjects applicable to your assigned class(es)
- [ ] Student list for the selected class is displayed

**Test: Upload results**
- [ ] For each student, enter CA score (0-40) and Exam score (0-60)
- [ ] Total is automatically calculated (CA + Exam)
- [ ] Grade is automatically assigned based on the total score
- [ ] Click **"Save Results"** or **"Submit"**
- [ ] Success toast appears
- [ ] Results persist after page refresh

**Test: Validation**
- [ ] Enter CA score > 40 — validation error appears
- [ ] Enter Exam score > 60 — validation error appears
- [ ] Enter negative scores — validation error appears

---

---

## Section 7 — Parent Portal

**First:** Log in with your Parent account. You should be on the Parent Dashboard at `/parent`.

---

### 7.1 — Parent Dashboard ( /parent )

- [ ] Page loads — "Parent Dashboard" at the top with your name
- [ ] School announcements targeting "parents" or "all" are shown
- [ ] **"My Children"** section shows all children linked to this parent

**Multi-child selector**
- [ ] If you have 2–3 children, tabs appear for each child
- [ ] If you have 4+ children, a dropdown selector appears instead
- [ ] Selecting a child updates the dashboard content for that child

**Per-child actions**
- [ ] Each child card shows: name, class, admission number
- [ ] **"View Results"** button navigates to `/parent/results/[admissionNumber]`
- [ ] **"View Fees"** button navigates to `/parent/fees?child=[studentId]`
- [ ] **"View Payments"** button navigates to `/parent/payments`
- [ ] Upcoming events section is visible

---

### 7.2 — Parent Results ( /parent/results/[admissionNumber] )

- [ ] Page loads with the child's results
- [ ] Only **published** exam results are shown (unpublished/draft exams are hidden)
- [ ] Results are grouped by exam (term/year)
- [ ] A term/year filter is available
- [ ] Each exam group shows subjects with scores and grades
- [ ] **"View Report Card"** button per exam navigates to the printable report card
- [ ] The report card can be printed from the report card page

---

### 7.3 — Parent Fees Page ( /parent/fees )

- [ ] Page loads with the selected child's fee information
- [ ] If arriving from dashboard with `?child=` parameter, the correct child is pre-selected
- [ ] **Child selector** at the top (tabs or dropdown depending on count)

**Fee Summary**
- [ ] Shows **Expected** total for the current term (sum of fee structures for the child's class)
- [ ] Shows **Paid** total (successful payments for fee-relevant types)
- [ ] Shows **Outstanding** amount (Expected - Paid)
- [ ] If fully paid, a green "Paid" badge appears
- [ ] If partially paid, a yellow "Partial" badge appears
- [ ] If nothing paid, a red "Unpaid" badge appears

**Fee Breakdown**
- [ ] Individual fee types are listed with their amounts (tuition, books, uniform, etc.)

**Pay Now button**
- [ ] If outstanding amount > 0, a **"Pay Now"** button is visible
- [ ] Clicking it opens the Paystack payment popup
- [ ] The amount pre-filled is the outstanding balance
- [ ] Complete payment with test card → success toast appears
- [ ] Outstanding amount updates after payment

**Payment History**
- [ ] A list of all payment transactions is shown (all statuses: success, pending, failed)
- [ ] Each payment shows: amount, type, method, status badge, date, reference
- [ ] Successful payments have a "View Receipt" link
- [ ] The list includes payments made by the parent AND payments recorded against the child by admin

---

### 7.4 — Parent Payments ( /parent/payments )

- [ ] Page loads with a list of all payment transactions
- [ ] Includes both direct payments (by parent user_id/email) and child-linked payments (by student_id)
- [ ] Each payment shows: amount, type, status, method, date
- [ ] Successful payments have a receipt link

---

---

## Section 8 — Student Portal

**First:** Log in with your Student account. You should be on the Student Dashboard at `/student`.

---

### 8.1 — Student Dashboard ( /student )

- [ ] Page loads — "Student Dashboard" at the top with your name
- [ ] Profile info visible: name, class, admission number, gender
- [ ] School announcements targeting "students" or "all" are shown
- [ ] Upcoming events are shown

**Fee Status Card**
- [ ] A "Fee Status" card is displayed
- [ ] Shows **Expected**, **Paid**, **Outstanding** amounts
- [ ] Status badge: Paid (green), Partial (yellow), Unpaid (red), or No fees (grey)
- [ ] Amounts match the fee structures for the student's class and current term

**Recent Results**
- [ ] If published results exist, recent subject scores are shown
- [ ] Grade badges with colour coding (A=green, B=blue, etc.)
- [ ] Progress bar showing score percentage
- [ ] Average score is calculated from all displayed results

---

### 8.2 — Student Results ( /student/results )

- [ ] Page loads with the student's exam results
- [ ] Only **published** exam results are shown
- [ ] Results are grouped by exam with a term/year filter
- [ ] Each exam group shows subjects, scores, and grades
- [ ] **"View / Print Report Card"** button per exam navigates to the printable report card

---

---

## Section 9 — Security & Access Control

### 9.1 — Role-Based Access

- [ ] **Admin** can access `/admin` and all `/admin/*` pages
- [ ] **Teacher** can access `/teacher` and all `/teacher/*` pages
- [ ] **Parent** can access `/parent` and all `/parent/*` pages
- [ ] **Student** can access `/student` and all `/student/*` pages
- [ ] **Admin** CANNOT access `/teacher`, `/parent`, or `/student`
- [ ] **Teacher** CANNOT access `/admin`, `/parent`, or `/student`
- [ ] **Parent** CANNOT access `/admin`, `/teacher`, or `/student`
- [ ] **Student** CANNOT access `/admin`, `/teacher`, or `/parent`
- [ ] **Unauthenticated user** is redirected to `/login` when trying to access any portal page

### 9.2 — Payment Security

- [ ] Paystack payments are verified server-side before being recorded
- [ ] Student-linked payments require authentication and parent-child ownership verification
- [ ] Receipt page for fee payments requires authentication
- [ ] Receipt page for application/donation payments shows limited (masked) info without auth
- [ ] UUID-based receipt lookups always require authentication

### 9.3 — Data Isolation

- [ ] Parents can only see their own children's results and fees
- [ ] Students can only see their own results
- [ ] Teachers can only upload results for classes they are assigned to
- [ ] Admin has full access to all data

---

---

## Section 10 — Navigation & Links

- [ ] All "Back to Dashboard" links work from every portal sub-page
- [ ] All navigation links in the public site header work
- [ ] All navigation links in the public site footer work
- [ ] The portal header shows the correct role name and user name
- [ ] The "Log Out" button works from every portal page
- [ ] After logging out, the user is redirected to the login page
- [ ] Clicking the browser back button works correctly throughout the app

---

---

## Section 11 — Mobile Responsiveness

Test the following on a mobile phone (or use Chrome DevTools → mobile mode):

- [ ] Public homepage is readable and scrollable on mobile
- [ ] Navigation menu collapses into a hamburger menu on mobile
- [ ] The admissions form is usable on mobile (fields stack vertically)
- [ ] Admin dashboard cards stack vertically on mobile
- [ ] Student list is scrollable on mobile
- [ ] Payment dialogs are usable on mobile
- [ ] Report card can be viewed (and printed) from mobile
- [ ] Parent child selector tabs/dropdown work on mobile

---

---

## Section 12 — Edge Cases & Validation

### 12.1 — Empty States

- [ ] Admin Students page with no students → shows "No students enrolled yet"
- [ ] Admin Payments page with no payments → shows empty state
- [ ] Parent with no children linked → shows appropriate message
- [ ] Student with no results → shows "No results" message
- [ ] Gallery with no images → shows placeholder or "no images" message
- [ ] News page with no posts → shows "no news" message

### 12.2 — Form Validation

- [ ] Admissions form — all required fields validated before proceeding
- [ ] Contact form — email field requires valid email format
- [ ] Result upload — CA score max 40, Exam score max 60 enforced
- [ ] Fee structure — amount must be positive number
- [ ] Offline payment — amount must be positive number
- [ ] Student record — admission number, class are required

### 12.3 — Data Integrity

- [ ] Duplicate admission numbers are rejected
- [ ] Duplicate subject codes are rejected
- [ ] Payment references are unique
- [ ] Fee structures have unique (class, term, year, fee_type) combinations
- [ ] Result entries have unique (student_id, exam_id, subject_id) combinations

---

---

## What To Do When a Test Fails

1. **Note which checkbox failed** — write down the section number and the test description
2. **Take a screenshot** showing what went wrong
3. **Check the browser console** — right-click → Inspect → Console tab → look for red error messages
4. **Check the page URL** — make sure you're on the correct page
5. **Try refreshing the page** — some errors are temporary
6. **Try logging out and back in** — session issues can cause unexpected behaviour
7. **Report the issue** with: (a) which test failed, (b) what you expected to happen, (c) what actually happened, (d) the screenshot, (e) any console errors
