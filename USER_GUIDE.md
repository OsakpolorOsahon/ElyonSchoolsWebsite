# Elyon Schools — User Guide

> This guide covers every part of the Elyon Schools app for all four types of users:
> **Administrators, Teachers, Parents, and Students.**
> Find your section and follow the steps — no technical knowledge needed.

---

## Table of Contents

- [Part 0 — Getting Started (All Users)](#part-0--getting-started-all-users)
- [Part 1 — Admin Guide](#part-1--admin-guide)
- [Part 2 — Teacher Guide](#part-2--teacher-guide)
- [Part 3 — Parent Guide](#part-3--parent-guide)
- [Part 4 — Student Guide](#part-4--student-guide)
- [Part 5 — Tips for Everyone](#part-5--tips-for-everyone)

---

---

# Part 0 — Getting Started (All Users)

This section applies to every user — Admin, Teacher, Parent, and Student.

---

## How Accounts Are Created

You cannot create your own account on Elyon Schools. All accounts are created by the school administrator.

Here is how it works:

| Your Role | How You Get an Account |
|---|---|
| **Admin** | The first admin account is set up manually when the school deploys the system. After that, admins can create other admins. |
| **Teacher** | The Admin invites you by email from the Users page. |
| **Parent** | The Admin invites you by email from the Users page. |
| **Student** | The Admin invites you by email from the Users page. |

If you do not have an account yet, contact your school administrator and ask them to invite you.

---

## How to Accept Your Invitation and Set Your Password

When the Admin invites you, you will receive an email from the school system. Here is what to do:

1. Check your email inbox. Look for an email with a subject like **"You have been invited"** or **"Accept your invitation"**.
   *(If you cannot find it, check your Spam or Junk mail folder.)*
2. Open the email and click the button or link inside it.
3. Your web browser will open and take you to the Elyon Schools website.
4. A page will appear asking you to create a password. Type a password you will remember. Type it again in the second box to confirm.
5. Click **"Set Password"** or **"Confirm"**.
6. You are now logged in. You will be taken to your dashboard automatically.

> **TIP:** Choose a password that is at least 8 characters long and includes a mix of letters and numbers. Write it down somewhere safe.

> **NOTE:** The invitation link in the email expires after a period of time. If you click the link and it says it has expired, ask the Admin to send a new invitation.

---

## How to Log In

Once your account is set up, you can log in at any time:

1. Go to the school website.
2. Click **"Login"** in the navigation menu at the top of the page. You can also go directly to the login page by adding `/login` to the end of the website address (e.g. `https://elyon-schools.vercel.app/login`).
3. On the login page:
   - Type your **email address** in the first box
   - Type your **password** in the second box
4. Click the **"Sign In"** button.
5. You will automatically be taken to your dashboard based on your role:
   - Admin → Admin Dashboard
   - Teacher → Teacher Dashboard
   - Parent → Parent Dashboard
   - Student → Student Dashboard

> **NOTE:** If you are taken back to the homepage or see an error, it may mean your account has not been fully set up. Contact your school administrator.

---

## How to Reset a Forgotten Password

If you forget your password:

1. Go to the login page.
2. Click the link that says **"Forgot your password?"** or **"Forgot password?"** (it is below the Sign In button).
3. You will be taken to a page that asks for your email address.
4. Type your email address and click **"Send Reset Link"** or **"Reset Password"**.
5. Check your email inbox. You will receive an email with a link to reset your password.
   *(Check Spam/Junk if you do not see it.)*
6. Click the link in the email. It will take you back to the school website.
7. Type your new password, confirm it, and click **"Update Password"** or **"Confirm"**.
8. You will be logged in automatically.

---

---

# Part 1 — Admin Guide

As an administrator, you have full access to manage every part of the school system. Your dashboard is the control centre for everything.

---

## 1.1 — The Admin Dashboard

When you log in, you land on the **Admin Dashboard**. Here is what everything on the page means:

### The Statistics Cards (at the top)

| Card | What it shows |
|---|---|
| **Pending Admissions** | Number of applications that have paid and are waiting for your approval |
| **Total Students** | Total number of currently active (enrolled) students |
| **Total Revenue** | Total amount of all successful payments ever received |
| **Upcoming Events** | Number of events scheduled for future dates |
| **New Payments Today** | Number of payments received in the last 24 hours |

### Recent Payments (below the stats)

This shows the last 5 payments that came in, including who paid, the amount, and the payment type. This gives you a quick view of recent financial activity.

### Quick Actions

These are shortcut buttons to the most commonly used pages. Clicking any of them takes you directly to that section. The Quick Actions available are:

- **Process Admissions** — review new applications
- **Manage Exams** — create and manage exam records
- **Manage Subjects** — create and manage school subjects
- **Announcements** — post messages to staff, parents, or students
- **Gallery** — manage school photos
- **Post News** — write and publish a news article
- **Create Event** — add a new school event to the calendar
- **Manage Users** — invite users and change user roles
- **All Students** — view the full list of enrolled students

---

## 1.2 — Managing Users

The **Users** page lets you see everyone who has an account in the system and invite new people.

### Viewing All Users

1. From the Admin Dashboard, click **"Manage Users"** or go to the Users page via the navigation.
2. You will see a list of all users showing their name, email, role (Admin, Teacher, Parent, or Student), and when they joined.
3. At the top of the list, there is a **search box**. Type a name or email address to filter the list and find a specific person.

### Changing a User's Role

If you need to change someone from a Parent to an Admin (or any other role change):

1. Find the user in the list.
2. Click the dropdown next to their name that shows their current role.
3. Select the new role from the list: Admin, Teacher, Parent, or Student.
4. The role updates immediately. The user will have different access the next time they log in.

### Inviting a New User

1. On the Users page, click the **"Invite User"** button.
2. A small window will appear. Fill in:
   - **Email address** — the person's email. This is where the invitation will be sent.
   - **Full Name** — their name as it should appear in the system.
   - **Role** — select what type of user they are: Teacher, Parent, or Student. (You can also invite another Admin.)
3. Click **"Send Invitation"**.
4. The person will receive an email inviting them to set up their account. Once they accept the invitation and set their password, their name will appear in the Users list with a green status.

> **TIP:** You can invite multiple people one at a time. Just click "Invite User" again for each person.

---

## 1.3 — Viewing Students

The **Students** page shows all currently enrolled students in the school.

1. Click **"All Students"** from the Quick Actions or navigate to the Students section.
2. You will see a list of students showing:
   - Full name
   - Admission number
   - Class (e.g. JSS 1, SS 2)
   - Status (Active, etc.)
3. Use this page as a reference to look up any student's admission number or class.

---

## 1.4 — Managing Admissions

The **Admissions** page is where you review, approve, or reject school applications.

### Understanding Application Statuses

| Status | What it means |
|---|---|
| **Pending Payment** | The applicant filled the form but has not paid the application fee yet |
| **Processing** | Payment was received — the application is waiting for your review |
| **Accepted** | You have approved the application |
| **Rejected** | You have rejected the application |

### Filtering by Status

At the top of the Admissions page, you will see filter buttons: **All**, **Pending Payment**, **Processing**, **Accepted**, **Rejected**. Click any one to see only applications in that category.

> **TIP:** Focus on "Processing" first — those are the applications that have paid and are waiting for a decision.

### Reviewing an Application

Each application card shows:
- The student's name, date of birth, and class they applied for
- The guardian's name and contact details
- The date the application was submitted
- The application fee amount and payment reference

### Accepting or Rejecting

For applications in **Processing** status:
1. Click the **green "Accept"** button to approve the application. The status changes to "Accepted".
2. Click the **red "Reject"** button to decline the application. The status changes to "Rejected".

> **NOTE:** Once you accept an application, the next step is to manually enrol the student by creating their student record and inviting them (and their parent) as users.

---

## 1.5 — Payments

The **Payments** page shows a full record of all money received through the school's payment system.

### What You Will See

Each payment row shows:
- **Payer name** — who made the payment
- **Amount** — how much was paid in Nigerian Naira
- **Type** — what the payment was for (colour-coded badges):
  - Blue badge: **Application Fee** (admission application)
  - Green badge: **School Fee** (term fees)
  - Purple badge: **Donation**
- **Status** — whether it was successful (green), pending (yellow), or failed (red)
- **Date** — when the payment was made

### Filtering Payments

Use the tabs at the top of the page to filter: **All**, **Application Fees**, **School Fees**, etc. This makes it easy to see only the type of payment you are looking for.

---

## 1.6 — News Posts

The **News** section lets you publish articles and updates that appear on the public school website.

### Creating a News Post

1. Click **"Post News"** from the Quick Actions, or go to **Admin → News → New Post**.
2. Fill in the form:
   - **Title** — the headline of the article
   - **Slug** — this is the web address for the article (e.g. `end-of-term-results-2025`). Use lowercase letters and hyphens, no spaces. The system may fill this in automatically based on the title.
   - **Summary** — a short one or two sentence description (shown on the news listing page)
   - **Body** — the full content of the article. Write everything you want the article to say here.
   - **Featured Image URL** — if you have an image for the article, paste its web address here (optional)
   - **Status** — choose **"Published"** to make it visible immediately, or **"Draft"** to save it without showing it publicly yet
3. Click **"Publish"** or **"Save"**.

### Managing Existing Posts

Go to **Admin → News** to see all your news posts. From here you can see the status of each post (Published or Draft).

---

## 1.7 — Events

The **Events** section manages the school's event calendar. Events appear on the public website's Events page.

### Viewing Events

Go to **Admin → Events** to see a list of all scheduled events showing the title, category, date, and location.

### Creating a New Event

1. Click **"New Event"** (or use the Quick Action from the dashboard).
2. Fill in the form:
   - **Title** — name of the event (e.g. "End of Term Examination")
   - **Description** — details about the event (optional)
   - **Start Date & Time** — when the event begins. Click the date field to pick a date, then enter the time.
   - **End Date & Time** — when the event ends. Must be after the start time.
   - **Location** — where the event takes place (e.g. "School Hall", "Sports Ground")
   - **Category** — choose one: Academic, Sports, Cultural, or Other
3. Click **"Create Event"**.

The event will immediately appear on the public Events page of the school website.

---

## 1.8 — Announcements

Announcements are messages sent to specific groups of people (parents, students, teachers, or everyone). They appear as a banner on each user's dashboard when they log in.

### Viewing Announcements

Go to **Admin → Announcements** to see all announcements. Each one shows the title, who it is targeted at, and whether it is published (visible) or not.

### Creating an Announcement

1. Click **"New Announcement"**.
2. Fill in:
   - **Title** — a short heading for the announcement (e.g. "School Fees Reminder")
   - **Body** — the full message you want to send
   - **Target Audience** — choose who should see this:
     - **All** — every logged-in user sees it
     - **Parents** — only parents see it on their dashboard
     - **Students** — only students see it
     - **Teachers** — only teachers see it
   - **Publish immediately** — if ticked, the announcement is live right away. If unticked, it is saved as a draft.
3. Click **"Create Announcement"**.

### Toggling Visibility

On the Announcements list page, each announcement has a **Published / Draft** toggle. Click it to instantly publish or unpublish an announcement without deleting it.

### Deleting an Announcement

Click the **delete button** (rubbish bin icon) next to an announcement to permanently remove it.

---

## 1.9 — Gallery

The **Gallery** section manages all school photos that appear on the public Gallery page.

### Viewing Photos

Go to **Admin → Gallery** to see all uploaded photos in a grid view. Each photo shows its title, category badge, and a delete button.

### Uploading a Photo

1. Click **"Upload Image"**.
2. Click **"Choose File"** or the upload area to select a photo from your computer.
   - Only image files are accepted (JPG, PNG, WebP, GIF)
   - Maximum file size is 5MB
3. Fill in:
   - **Title** — a name for the photo (e.g. "Science Lab 2024")
   - **Description** — optional additional detail
   - **Category** — choose what type of photo it is: Campus, Events, Sports, Graduation, or Student Life
4. Click **"Upload"**.
5. The photo will appear in the gallery grid and will be visible on the public Gallery page.

### Deleting a Photo

Hover over any photo in the gallery grid — a **Delete** button will appear on top of the image. Click it and confirm to permanently remove the photo.

> **WARNING:** Deleting a photo removes it permanently. It cannot be recovered.

---

## 1.10 — Exams

The **Exams** section creates exam records. Teachers use these records when uploading student results.

### Viewing Exams

Go to **Admin → Exams** to see a list of all exams, showing the name, term, and year.

### Creating an Exam

1. Click **"New Exam"**.
2. Fill in:
   - **Name** — what the exam is called (e.g. "First Term Examination", "Mock WAEC 2025")
   - **Term** — choose First, Second, or Third
   - **Year** — type the academic year (e.g. 2025)
3. Click **"Create Exam"**.

The exam will now appear in the list that teachers see when uploading results.

### Deleting an Exam

Click the **delete button** next to an exam to remove it.

> **WARNING:** Do not delete an exam if results have already been uploaded for it — the results will be lost.

---

## 1.11 — Subjects

The **Subjects** section manages the list of subjects taught in the school. Teachers select from this list when uploading results.

### Viewing Subjects

Go to **Admin → Subjects** to see all subjects, showing the name and short code.

### Adding a Subject

1. Click **"New Subject"**.
2. Fill in:
   - **Name** — the full subject name (e.g. "Mathematics", "English Language")
   - **Code** — a short abbreviation (e.g. `MATH`, `ENG`, `BIO`). Must be unique.
3. Click **"Add Subject"**.

### Deleting a Subject

Click the **delete button** next to a subject to remove it.

> **WARNING:** Do not delete a subject if results have already been recorded for it.

---

---

# Part 2 — Teacher Guide

As a teacher, your main job in the system is uploading student results and viewing your assigned students.

---

## 2.1 — The Teacher Dashboard

When you log in, you will see your **Teacher Dashboard**. Here is what each section shows:

### Summary Cards (at the top)

| Card | What it shows |
|---|---|
| **Assigned Students** | Total number of students assigned to you |
| **Classes** | How many different classes your students belong to |
| **Upcoming Events** | School events coming up in the next few weeks |

### Upload Results Button

There is a large green button at the top of the dashboard that says **"Upload Student Results"**. This is your most important action — click it when you are ready to enter grades.

### Your Classes

Below the summary cards, you will see a list of your classes (e.g. "JSS 2", "SS 1"). Each card shows the class name and how many students you have in that class. Click any class card to see the list of students in it.

### Upcoming Events

At the bottom of the dashboard, you will see the next upcoming school events — dates, names, and locations. This is for your information only.

---

## 2.2 — Uploading Student Results

Uploading results is a simple process. You select an exam, select a subject, then enter a score for each of your students.

### Step-by-Step Instructions

1. Click **"Upload Student Results"** from your dashboard (the large green button).

2. You will see a page with three sections at the top:
   - **Select Exam** — click this dropdown and choose the exam you are recording results for (e.g. "First Term Examination 2025")
   - **Select Subject** — click this dropdown and choose the subject (e.g. "Mathematics")

3. After selecting both an exam and a subject, a table will appear below showing all your assigned students.

4. For each student in the table, type their score in the **Score** box. Scores must be between **0 and 100**.
   - You do not need to enter a grade — the system calculates grades automatically.
   - You can leave a student's score empty if you do not have it yet (you can come back and fill it in later).

5. When you are finished entering scores, click the **"Save Results"** button at the bottom of the page.

6. You will see a success message. The results are now saved and visible to students and parents.

> **NOTE:** If you save results for the same student, exam, and subject more than once, the system automatically updates (overwrites) the previous score instead of creating a duplicate. So it is safe to save, then come back and change a score if needed.

> **TIP:** Work one exam and one subject at a time. For example: complete all results for "Mathematics - First Term Exam", then do "English - First Term Exam", and so on.

---

## 2.3 — Viewing Your Assigned Students

### Viewing a Class

From the Teacher Dashboard, click on any class card (e.g. "JSS 2 — 15 Students").

You will see a table listing all students in that class who are assigned to you, including:
- Student name
- Admission number
- Class
- Gender

This page is useful if you need to look up a student's admission number.

---

---

# Part 3 — Parent Guide

As a parent, you can see your children's results, view school announcements, and check your payment history — all in one place.

---

## 3.1 — The Parent Dashboard

When you log in, you will see your **Parent Dashboard**.

### Announcements Banner

If the school has posted any announcements for parents (or for everyone), you will see them in a highlighted box at the very top of the page. Each announcement shows a title and the message. Read these to stay informed about school updates.

### Your Children

Below the announcements, you will see a card for each of your children enrolled in the school. Each card shows:
- Your child's name
- Their class (e.g. JSS 3)
- Their admission number

From each child's card, you can click **"View Results"** to see their academic results.

> **NOTE:** If you do not see your child listed, contact the school admin. The admin needs to link your child's student record to your parent account.

### Upcoming Events

At the bottom of the dashboard, you will see upcoming school events — name, date, and location. This helps you plan ahead for sports days, parent-teacher meetings, prize-giving days, and more.

---

## 3.2 — Viewing Your Child's Results

1. On the Parent Dashboard, find the card for the child whose results you want to see.
2. Click the **"View Results"** button on their card.
3. You will be taken to a page showing a full table of all their recorded results, including:
   - **Exam name** — which exam the result is for (e.g. "First Term Examination")
   - **Term and Year** — e.g. First Term 2025
   - **Subject** — e.g. Mathematics, English Language
   - **Score** — their mark out of 100
   - **Grade** — A, B, C, D, E, or F (calculated automatically from the score)

### What the Grades Mean

| Grade | Score Range | What it means |
|---|---|---|
| A | 70 – 100 | Excellent |
| B | 60 – 69 | Very Good |
| C | 50 – 59 | Good |
| D | 45 – 49 | Pass |
| E | 40 – 44 | Near Pass |
| F | 0 – 39 | Fail |

4. Click the **"Back"** button (or the arrow at the top left) to return to your dashboard.

---

## 3.3 — Viewing Payment History

The **Payments** page shows all payments you (or anyone) have made for your children.

### How to Get There

From the Parent Dashboard, click **"Payment History"** or look for the **"Payments"** link in the navigation menu.

### What You Will See

A list of all your payments, each showing:
- **Amount** — in Nigerian Naira (₦)
- **Payment type** — what the payment was for (e.g. Application Fee, School Fee)
- **Status** — Paid (green), Pending (yellow), or Failed (red)
- **Date** — when the payment was made
- **Reference number** — the unique Paystack transaction ID

### Viewing a Receipt

Click on any payment row to open a **receipt popup**. The receipt shows the full details of that transaction including the payment reference, amount, date, and status. You can use this as proof of payment if needed.

---

---

# Part 4 — Student Guide

As a student, you can check your academic results, see upcoming school events, and read school announcements.

---

## 4.1 — The Student Dashboard

When you log in, you will see your **Student Dashboard**. Here is what each section shows:

### Your Profile Summary

At the top of the dashboard, you will see:
- Your class (e.g. SS 2)
- Your admission number

If these are blank or incorrect, contact your school administrator.

### Recent Results

The dashboard shows your **6 most recent results** in a table. Each row shows:
- Subject name
- Exam name
- Your score (out of 100)
- Your grade

This is a quick preview. To see ALL your results, click the **"View All Results"** button.

### Your Average Score

A card on the dashboard shows your **current average score** across all your recent results. This gives you a quick idea of your overall performance.

### Upcoming Events

At the bottom of the dashboard, you will see upcoming school events — name, date, and location. Keep an eye on this for exam dates, sports days, and special occasions.

### School Announcements

If the school has posted any announcements for students, they will appear on your dashboard. Read these carefully — they may contain important information like exam schedules, fee reminders, or holiday notices.

---

## 4.2 — Viewing All Your Results

1. On your Student Dashboard, click the **"View All Results"** button.
2. You will be taken to a full results page showing every result recorded for you.
3. Each row in the table shows:
   - **Exam name** — which exam the result is from
   - **Term** — First, Second, or Third term
   - **Year** — the academic year
   - **Subject** — the subject name and code
   - **Score** — your mark out of 100
   - **Grade** — A, B, C, D, E, or F
   - **Remarks** — any notes your teacher added (optional)

### What the Grades Mean

| Grade | Score Range | What it means |
|---|---|---|
| A | 70 – 100 | Excellent |
| B | 60 – 69 | Very Good |
| C | 50 – 59 | Good |
| D | 45 – 49 | Pass |
| E | 40 – 44 | Near Pass |
| F | 0 – 39 | Fail |

4. Click the **"Back"** button or the arrow at the top left to return to your dashboard.

> **NOTE:** If you do not see any results yet, it means your teacher has not uploaded your results yet. Check back after your exams.

---

---

# Part 5 — Tips for Everyone

These tips apply to all users regardless of your role.

---

## How to Log Out

When you are done using the app, always log out — especially on a shared or public computer.

1. Look at the top right corner of any page inside the portal (your dashboard or any page inside it).
2. You will see either your name, a user icon, or a menu button.
3. Click it to open a small menu.
4. Click **"Sign Out"** or **"Log Out"**.
5. You will be taken back to the school's public homepage and your session will be ended.

> **TIP:** Always log out when using the website on a school computer, library computer, or any device that others can access.

---

## What to Do If a Page Shows an Error

If a page shows an error message or does not load properly:

1. **Refresh the page** — press `F5` on your keyboard (or `Ctrl+R` on Windows, `Cmd+R` on Mac). This solves most temporary problems.
2. **Check your internet connection** — make sure you are connected to the internet.
3. **Log out and log back in** — sometimes your login session expires. Log out, then log in again.
4. **Try a different browser** — if the page works in one browser (e.g. Chrome) but not another (e.g. Edge), the issue is with your browser. Try Google Chrome or Mozilla Firefox.
5. **Clear your browser cache** — sometimes old saved data causes problems. In Chrome: press `Ctrl+Shift+Delete`, tick "Cached images and files", and click "Clear data".

If none of the above works, contact your school administrator.

---

## Who to Contact for Help

| Problem | Who to contact |
|---|---|
| You did not receive your invitation email | School Administrator |
| Your account does not work or shows wrong information | School Administrator |
| You cannot see your child's results (Parent) | School Administrator — ask them to link your account to your child's record |
| You cannot see your results (Student) | Your teacher — they may not have uploaded results yet |
| A payment went through but is not showing | School Administrator — provide your Paystack reference number |
| Any technical problem with the website | School Administrator |

---

## Quick Reference — Where to Find Everything

### Admin
| Feature | Where to find it |
|---|---|
| Invite a user | Admin Dashboard → Users → Invite User |
| Review applications | Admin Dashboard → Admissions |
| See all payments | Admin Dashboard → Payments |
| Write a news article | Admin Dashboard → News → New Post |
| Add an event | Admin Dashboard → Events → New Event |
| Post an announcement | Admin Dashboard → Announcements → New Announcement |
| Upload a photo | Admin Dashboard → Gallery → Upload Image |
| Add a subject | Admin Dashboard → Subjects |
| Create an exam | Admin Dashboard → Exams |

### Teacher
| Feature | Where to find it |
|---|---|
| Upload student results | Teacher Dashboard → Upload Student Results (green button) |
| View students in a class | Teacher Dashboard → click a class card |

### Parent
| Feature | Where to find it |
|---|---|
| View child's results | Parent Dashboard → child card → View Results |
| View payment history | Parent Dashboard → Payment History |

### Student
| Feature | Where to find it |
|---|---|
| View all results | Student Dashboard → View All Results |
| See upcoming events | Student Dashboard (bottom of page) |

---

*This guide covers the full Elyon Schools Management System. If you need help with anything not covered here, please speak to your school administrator.*
