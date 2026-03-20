# Elyon Schools — Complete Deployment Guide

> **Who is this guide for?**
> Anyone who wants to make the Elyon Schools website live on the internet.
> Every single step is explained in plain language. Just follow each step in order — nothing is left out!

---

## Table of Contents

1. [What You Need Before You Start](#1-what-you-need-before-you-start)
2. [Step 1 — Push Your Code to GitHub](#2-step-1--push-your-code-to-github)
3. [Step 2 — Set Up Your Database on Supabase](#3-step-2--set-up-your-database-on-supabase)
4. [Step 3 — Save Your Supabase Keys](#4-step-3--save-your-supabase-keys)
5. [Step 4 — Get Your Paystack Payment Keys](#5-step-4--get-your-paystack-payment-keys)
6. [Step 5 — Deploy the Website on Vercel](#6-step-5--deploy-the-website-on-vercel)
7. [Step 6 — Connect Your Live Website Back to Supabase](#7-step-6--connect-your-live-website-back-to-supabase)
8. [Step 7 — Create the First Admin Account](#8-step-7--create-the-first-admin-account)
9. [Step 8 — Test That Everything Works](#9-step-8--test-that-everything-works)
10. [Troubleshooting](#10-troubleshooting--when-something-goes-wrong)

---

## 1. What You Need Before You Start

You need **4 free accounts**. Create all of them first before doing anything else.
Each one is completely free to sign up for.

| Account | What it does for you | Sign-up link |
|---|---|---|
| **GitHub** | Stores your code safely online | https://github.com/signup |
| **Supabase** | Your database — stores all student, teacher, payment data | https://supabase.com |
| **Vercel** | Puts your website live on the internet | https://vercel.com/signup |
| **Paystack** | Handles school fee payments online | https://paystack.com/signup |

> **TIP:** When signing up for Vercel, click **"Continue with GitHub"** instead of creating a new password. This saves time later.

> **TIP:** For Paystack, you will need to provide school/business details during registration. Have your school's address and contact information ready.

---

## 2. Step 1 — Push Your Code to GitHub

Your code needs to be on GitHub before Vercel can publish it as a website.

### Step 1.1 — Create a New GitHub Repository

1. Go to **https://github.com** and log in with your account.
2. Click the **green "New" button** on the left side of the page.
   *(If you do not see it, click the "+" icon at the very top right of the page and choose "New repository".)*
3. Fill in the form like this:
   - **Repository name:** Type `elyon-schools`
   - **Visibility:** Select **"Private"** so strangers cannot see your code
   - **Important:** Do **NOT** tick the box that says "Add a README file"
4. Click the green **"Create repository"** button.
5. You will land on a page that shows setup instructions. **Leave this tab open** — you will use it in the next step.

### Step 1.2 — Upload Your Code

Open a **Terminal** on your computer:
- **Mac:** Press `Command + Space`, type `Terminal`, press Enter
- **Windows:** Press the Windows key, type `Git Bash`, press Enter *(if Git Bash is not installed, download it free from https://git-scm.com/downloads first)*

Then type these commands one at a time. Press **Enter** after each line and wait for it to finish before typing the next one.

```bash
git init
```
```bash
git add .
```
```bash
git commit -m "First commit"
```
```bash
git branch -M main
```
```bash
git remote add origin https://github.com/YOUR-USERNAME/elyon-schools.git
```
```bash
git push -u origin main
```

> **IMPORTANT:** In the second-to-last line, replace `YOUR-USERNAME` with your actual GitHub username. For example, if your GitHub username is `johnson123`, the line should be:
> `git remote add origin https://github.com/johnson123/elyon-schools.git`

**If Git asks for your username and password:**
- Username: your GitHub username
- Password: you need to use a "Personal Access Token" — NOT your regular GitHub password. See **Step 1.3** below.

### Step 1.3 — Create a GitHub Personal Access Token (Only if Needed)

GitHub no longer accepts your regular password in the terminal. You need a special token instead.

1. Go to **https://github.com** and click your profile picture (top right corner).
2. Click **"Settings"**.
3. Scroll all the way down the left menu and click **"Developer settings"**.
4. Click **"Personal access tokens"**, then **"Tokens (classic)"**.
5. Click **"Generate new token"** then **"Generate new token (classic)"**.
6. Fill in the form:
   - **Note:** Type `Deployment access`
   - **Expiration:** Choose "No expiration"
   - **Scopes:** Tick the box next to **"repo"** (it is the first group in the list)
7. Click the green **"Generate token"** button at the bottom of the page.
8. **A long code will appear on the screen — copy it immediately!** It will only be shown once. Paste it into a Notepad document for safekeeping.
9. Use this token as your "password" the next time the terminal asks for it.

### Step 1.4 — Confirm It Worked

Go to your GitHub repository page: `https://github.com/YOUR-USERNAME/elyon-schools`

You should see a list of all your project files. If you can see files like `package.json`, `next.config.ts`, and folders like `app/` and `lib/` — it worked!

> **Step 1 is done** when you can see your files on GitHub.

---

## 3. Step 2 — Set Up Your Database on Supabase

Supabase is where all your school's data lives — students, teachers, results, payments, news, everything. You need to set this up before deploying the website.

### Step 2.1 — Create a New Supabase Project

1. Go to **https://supabase.com** and log in.
2. Click **"New project"**.
3. Fill in the form:
   - **Organization:** Your personal organisation will already be selected — leave it.
   - **Project name:** Type `elyon-schools`
   - **Database Password:** Make up a strong password (example: `School@2024!Elyon`) and **save it in a Notepad document**. You may need it later.
   - **Region:** Choose the region closest to Nigeria. Good choices are **"West EU (Ireland)"** or **"South Africa (Cape Town)"** if it is available.
4. Click **"Create new project"**.
5. Wait about 2 minutes. You will see a spinning loader. When the loader disappears and you see your project dashboard, you are ready to move on.

### Step 2.2 — Run the Database Setup Script

This single step creates ALL your database tables, security rules, and image storage at once. It uses the file `supabase/setup.sql` from your project.

1. In your Supabase project, look at the **dark left sidebar**.
2. Find and click the icon called **"SQL Editor"**. It may look like `</>` or just say "SQL Editor".
3. You will see a large empty white/grey text box. Click inside it.
4. Now you need to open the file `supabase/setup.sql` from your project:
   - Open the `supabase` folder, then open `setup.sql` with any text editor (Notepad on Windows, TextEdit on Mac), press `Ctrl+A` to select all, and press `Ctrl+C` to copy.
5. Go back to the Supabase SQL Editor. Click inside the empty box and press `Ctrl+V` (or `Cmd+V` on Mac) to paste. The box should now be filled with a lot of text starting with comments like `-- ELYON SCHOOLS MANAGEMENT SYSTEM`.
6. Click the green **"Run"** button (or press `Ctrl+Enter`).
7. Wait about 15–30 seconds.
8. At the bottom of the screen, look for the result. You should see a **green tick** and the message: **"Success. No rows returned"**.

> **If you see a red error message:** This is usually not a problem. If the error says "already exists", it just means the table was already created. If it is a different error, copy the message and see the [Troubleshooting section](#10-troubleshooting--when-something-goes-wrong).

> **Step 2 is done** when the SQL Editor shows "Success" at the bottom.

---

## 4. Step 3 — Save Your Supabase Keys

You will need three pieces of information from Supabase when setting up Vercel. Get them now and save them in a Notepad document.

### Step 3.1 — Open the API Settings Page

1. In Supabase, click the **gear icon** (⚙️) at the very bottom of the left sidebar. It is labelled **"Project Settings"**.
2. Click **"API"** in the left menu.
3. You will land on a page showing your project's keys.

### Step 3.2 — Copy and Save These Three Values

**Value 1 — Project URL**
- Look for the section called **"Project URL"**
- It looks like: `https://abcdefghijklmnop.supabase.co`
- Copy the full address including `https://`
- Save it in Notepad with the label: `SUPABASE URL`

**Value 2 — Anon / Public Key**
- Look for the section called **"Project API keys"**
- Find the row labelled **"anon"** or **"public"**
- It is a very long string of characters starting with `eyJ`
- Copy the whole thing
- Save it in Notepad with the label: `SUPABASE ANON KEY`

**Value 3 — Service Role Key**
- On the same page, find the row labelled **"service_role"**
- Click the **"Reveal"** button or the eye icon (👁) to make it visible
- Copy the full key
- Save it in Notepad with the label: `SUPABASE SERVICE KEY`

> **WARNING:** The service_role key is like a master key to your entire database. It can read, edit, and delete everything. Never share it with anyone, never post it online, and never put it in any code that users can see. It belongs only in Vercel's private settings.

> **Step 3 is done** when you have all three values saved in your Notepad.

---

## 5. Step 4 — Get Your Paystack Payment Keys

Paystack processes all the school fee payments on your website. You need two keys from their dashboard.

### Step 4.1 — Log In to Paystack

1. Go to **https://dashboard.paystack.com** and log in with your Paystack account.
2. In the left sidebar, click **"Settings"**.
3. Click **"API Keys & Webhooks"**.

### Step 4.2 — Copy and Save These Two Values

You will see keys for **"Test"** mode and **"Live"** mode.
- Use **Test keys** for now — they let you try payments without using real money.
- When the school is ready to collect real fees, you will switch to Live keys (instructions are in the Troubleshooting section).

**Value 4 — Paystack Public Key**
- Find the key labelled **"Public Key"** under the Test section
- It starts with `pk_test_`
- Copy it and save it in Notepad with the label: `PAYSTACK PUBLIC KEY`

**Value 5 — Paystack Secret Key**
- Find the key labelled **"Secret Key"** under the Test section
- You may need to click an eye icon to reveal it
- It starts with `sk_test_`
- Copy it and save it in Notepad with the label: `PAYSTACK SECRET KEY`

> **WARNING:** The Secret Key must stay private. Only paste it into Vercel's private settings — never into any code file or public website.

> **Step 4 is done** when you have both Paystack keys saved in your Notepad.

---

## 6. Step 5 — Deploy the Website on Vercel

Vercel takes your code from GitHub and turns it into a real, live website that anyone can visit.

### Step 5.1 — Import Your GitHub Repository

1. Go to **https://vercel.com** and log in.
2. On your Vercel dashboard, click **"Add New…"** (top right) and choose **"Project"**.
3. You will see a page called **"Import Git Repository"** with a list of your GitHub repositories.
4. Find **"elyon-schools"** in the list and click the **"Import"** button next to it.

### Step 5.2 — Check the Build Settings

On the next screen, Vercel should automatically detect that this is a Next.js project. Check that:

- **Framework Preset** shows `Next.js` — if not, click the dropdown and select it
- **Root Directory** shows `./` — leave it as-is
- **Build Command** shows `next build` — leave it as-is

**Do NOT click "Deploy" yet.** You must add your secret keys first.

### Step 5.3 — Add Your Environment Variables

Scroll down on the same page until you see a section called **"Environment Variables"**.

You need to add **6 variables**. For each one:
1. Click inside the **"Name"** box on the left and type the variable name exactly as shown below
2. Click inside the **"Value"** box on the right and paste the value
3. Click the **"Add"** button to save it

Add all 6 of these:

---

**Variable 1**
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your `SUPABASE URL` from Step 3.2
- **Example of what it looks like:** `https://abcdefghijklmnop.supabase.co`

---

**Variable 2**
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your `SUPABASE ANON KEY` from Step 3.2
- **Example of what it looks like:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xl...` *(it is very long)*

---

**Variable 3**
- **Name:** `SUPABASE_SERVICE_KEY`
- **Value:** Your `SUPABASE SERVICE KEY` from Step 3.2
- **Example of what it looks like:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xl...` *(also very long)*
- **Reminder:** This is the sensitive master key — it is safe here in Vercel's private settings

---

**Variable 4**
- **Name:** `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- **Value:** Your `PAYSTACK PUBLIC KEY` from Step 4.2
- **Example of what it looks like:** `pk_test_abc123xyz456...`

---

**Variable 5**
- **Name:** `PAYSTACK_SECRET_KEY`
- **Value:** Your `PAYSTACK SECRET KEY` from Step 4.2
- **Example of what it looks like:** `sk_test_abc123xyz456...`

---

**Variable 6**
- **Name:** `NEXT_PUBLIC_SITE_URL`
- **Value:** Type `https://elyon-schools.vercel.app` as a placeholder for now
- **Note:** You will update this to your real address after you see the URL Vercel gives you

---

### Step 5.4 — Click Deploy!

After adding all 6 variables, scroll down and click the big **"Deploy"** button.

Vercel will start building your website. You will see a dark screen with text scrolling past — this is normal and means it is working. It takes about 3–5 minutes.

When it finishes, you will see a large **"Congratulations!"** message and a preview of your website.

**Click the link to visit your live website and copy its URL.** It will look like:
- `https://elyon-schools.vercel.app`
- or `https://elyon-schools-abc123.vercel.app`

Save this URL in your Notepad with the label: `MY WEBSITE URL`.

> **If the build fails (you see a red screen):** See the [Troubleshooting section](#10-troubleshooting--when-something-goes-wrong). The most common reason is a typo in one of the environment variable names.

> **Step 5 is done** when you can open your live website in a browser and see the Elyon Schools homepage.

---

## 7. Step 6 — Connect Your Live Website Back to Supabase

Now that you have your real website address, you need to tell Supabase about it. This makes logins, password resets, and user invitation emails work correctly.

### Step 6.1 — Update the Site URL in Supabase

1. Go back to **Supabase** and open your `elyon-schools` project.
2. In the left sidebar, click **"Authentication"**.
3. Click **"URL Configuration"**. *(In some versions of Supabase this may be under Authentication → Settings.)*
4. Find the field called **"Site URL"**. It likely shows `http://localhost:3000` right now. Delete that and replace it with your real website URL:
   ```
   https://YOUR-REAL-VERCEL-URL.vercel.app
   ```
   Use the exact URL from your Notepad (`MY WEBSITE URL`).
5. Find the section called **"Redirect URLs"**. Click **"Add URL"** and add **both** of these (add them one at a time):
   ```
   https://YOUR-REAL-VERCEL-URL.vercel.app/**
   ```
   ```
   https://YOUR-REAL-VERCEL-URL.vercel.app/reset-password
   ```
   *(The first entry with `/**` covers all pages. The second entry specifically covers the password-creation page that invitation emails link to. Both are required.)*

   > **Important — invitation emails:** If you skip adding `/reset-password` to this list, clicking the invite link in the email will land on the homepage instead of the password-creation page. The website has a fallback that will redirect automatically, but adding it here is the proper fix.

6. Click **"Save"**.

### Step 6.2 — Update the Variable in Vercel

1. Go back to **Vercel** and open your `elyon-schools` project.
2. Click the **"Settings"** tab near the top of the page.
3. Click **"Environment Variables"** in the left menu.
4. Find the variable called `NEXT_PUBLIC_SITE_URL`.
5. Click the three-dot menu (**⋯**) to the right of it and click **"Edit"**.
6. Replace the placeholder with your real website URL:
   ```
   https://YOUR-REAL-VERCEL-URL.vercel.app
   ```
7. Click **"Save"**.

### Step 6.3 — Redeploy the Website

Because you changed a variable, you need to redeploy for the change to take effect.

1. In Vercel, click the **"Deployments"** tab.
2. You will see your most recent deployment at the top of the list.
3. Click the three-dot menu (**⋯**) to the right of it.
4. Click **"Redeploy"**.
5. In the popup window that appears, click the **"Redeploy"** button to confirm.
6. Wait 3–5 minutes for it to finish.

> **Step 6 is done** when the redeployment finishes and shows a green tick.

---

## 8. Step 7 — Create the First Admin Account

Your website is live, but there are no user accounts yet. You need to create the first admin account so you can manage the school.

### Step 7.1 — Send Yourself an Invitation

1. Go to **Supabase** and open your project.
2. In the left sidebar, click **"Authentication"**.
3. Click **"Users"** in the sub-menu. The list will be empty — that is normal.
4. Click the **"Invite user"** button.
5. Type the email address you want to use as admin and click **"Send invitation"**.

### Step 7.2 — Accept the Invitation Email

1. Check the inbox of the email address you just invited.
   *(If you do not see an email within 2–3 minutes, check your Spam or Junk folder.)*
2. Open the email — it will be from Supabase and have a subject like **"You have been invited"**.
3. Click the big button or link inside the email. It will open your live website.
4. A page will appear asking you to create a password. Choose a strong password that you will remember. Type it twice and click **"Set Password"** or **"Confirm"**.
5. You will be logged in. You can now close this tab.

### Step 7.3 — Find Your User ID

After accepting the invitation, go back to Supabase to find your User ID.

1. In Supabase → **Authentication** → **Users**, you will now see your email address in the list.
2. Click on your email address to open your user details.
3. Look for the field called **"User UID"**. It is a long code with dashes in it, looking like:
   `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
4. Copy this User UID. Save it in your Notepad with the label: `MY USER ID`.

### Step 7.4 — Grant Yourself Admin Access

This step tells the database that your account has admin powers.

1. In Supabase, click **"SQL Editor"** in the left sidebar.
2. Clear the text box (select all and delete), then type the SQL code below.
3. **Replace the two placeholders** in capital letters with your real information:

```sql
INSERT INTO profiles (id, full_name, role)
VALUES (
  'PASTE-YOUR-USER-ID-HERE',
  'Your Full Name Here',
  'admin'
);
```

**Real example** — if your User ID is `a1b2c3d4-e5f6-7890-abcd-ef1234567890` and your name is Adebayo Johnson:

```sql
INSERT INTO profiles (id, full_name, role)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Adebayo Johnson',
  'admin'
);
```

4. Click the green **"Run"** button.
5. You should see: **"Success. 1 row affected"** — this means your admin account is now set up.

### Step 7.5 — Log In to the Admin Dashboard

1. Go to your live website.
2. Click **"Login"** in the navigation menu, or go directly to: `https://your-website.vercel.app/login`
3. Enter your email address and the password you created in Step 7.2.
4. Click **"Sign In"**.
5. You should be taken to the **Admin Dashboard** — a page with links to manage every part of the school system.

> **From this point on**, you can invite all other users (teachers, parents, students) directly from the Admin Dashboard. You do not need to go back to Supabase for that.

> **Step 7 is done** when you can log in and see the Admin Dashboard.

---

## 9. Step 8 — Test That Everything Works

Before sharing the website with parents, teachers, and students, run through this checklist to make sure everything is working properly.

### Public Website

- [ ] The homepage loads with the school name, banner image, and navigation menu at the top
- [ ] Clicking **"About"** in the menu opens the About page
- [ ] Clicking **"Admissions"** opens the Admissions page with an application form
- [ ] Clicking **"News"** opens the News page *(may say "No news yet" — that is fine)*
- [ ] Clicking **"Events"** opens the Events page *(may say "No events" — that is fine)*
- [ ] Clicking **"Gallery"** opens the Gallery page
- [ ] Clicking **"Contact"** opens the Contact page
- [ ] Fill in the Contact form and click Send — you see a success message

### Logging In

- [ ] Go to `/login` on your website and log in with your email and password
- [ ] You are taken to the Admin Dashboard — NOT redirected back to the homepage

### Admin Dashboard Features

- [ ] Click **"News"** — a page loads where you can create new school news posts
- [ ] Click **"Events"** — a page loads where you can add new school events
- [ ] Click **"Announcements"** — a page loads where you can post announcements
- [ ] Click **"Subjects"** — a page loads where you can add school subjects
- [ ] Click **"Exams"** — a page loads where you can create exam records
- [ ] Click **"Gallery"** — a page loads. Click "Upload Image", choose a photo from your computer, add a title, and click Upload. The image should appear.
- [ ] Go to the public **Gallery** page — the image you just uploaded should be visible there

### Inviting a Teacher (Test This Too)

- [ ] In Admin Dashboard, click **"Users"** then **"Invite User"**
- [ ] Enter a test email address and set the role to **"teacher"**, then click Invite
- [ ] Check that email inbox — an invitation email should arrive
- [ ] The teacher clicks the link, sets a password, logs in, and sees the Teacher Dashboard

### Payment Test (No Real Money Required)

- [ ] Go to the **Admissions** page on your website and start a new application
- [ ] Fill in the application form and proceed to the payment step
- [ ] When the Paystack payment window opens, use these **official Paystack test card details:**
  - **Card number:** `4084 0840 8408 4081`
  - **Expiry date:** any future date, e.g. `12/26`
  - **CVV:** `408`
  - **PIN:** `0000`
  - **OTP (one-time password):** `123456`
- [ ] The payment completes and you are shown a receipt page

> **NOTE:** These test card details are from Paystack's official documentation. They work because you are using Test keys — no real money is charged.

> **Step 8 is done** when all items above have a tick. Your website is fully ready!

---

## 10. Troubleshooting — When Something Goes Wrong

### The SQL Editor shows a red error

**What to check:**
- If the error says **"already exists"** — this is safe to ignore. It just means the table was already created from a previous run. The rest of the script still ran fine.
- If the error says **"permission denied"** — check that you are in the correct Supabase project. Look at the project name in the top-left corner of Supabase to confirm.
- For any other error, copy the full error message, paste it into Google along with the word "Supabase", and look for a solution.

---

### Vercel build failed (red screen after clicking Deploy)

**What to check:**
1. Click on the failed deployment to open it and see the build logs.
2. Scroll to the very bottom of the logs — the real error is almost always at the bottom in red text.
3. The most common cause is a **missing or misspelled environment variable**.
   - Go to Vercel → Settings → Environment Variables
   - Check that all 6 variables are present and their names are spelled **exactly** as shown in Step 5.3
   - Remember: variable names are case-sensitive. `SUPABASE_SERVICE_KEY` and `Supabase_Service_Key` are treated as different things
   - Check that there are no extra spaces at the beginning or end of any value (this happens when you accidentally select a space while copying)
4. After fixing any variable, go to Deployments, click the three-dot menu on the latest deployment, and click **"Redeploy"**.

---

### The live website shows a white/blank page or says "Application Error"

**Most common cause:** A missing, wrong, or misspelled environment variable.

1. Open your browser, right-click anywhere on the blank page, and choose **"Inspect"** or **"Inspect Element"**.
2. Click the **"Console"** tab at the top. Look for red error messages.
3. If you see something about **"Missing Supabase"** or **"Invalid API key"** — go to Vercel → Settings → Environment Variables and carefully check your Supabase keys.
4. After fixing any variable, redeploy the website (Deployments → three-dot menu → Redeploy).

---

### I can log in but I am not taken to the Admin Dashboard

**Most likely cause:** Your profile row was not inserted, or was inserted with the wrong role.

1. Go to Supabase → SQL Editor and run this to check:
   ```sql
   SELECT * FROM profiles;
   ```
2. If you see **no rows** — your profile was not inserted. Go back to Step 7.4 and run the INSERT statement again.
3. If you see your row but the `role` column does not say `admin` — fix it by running this (replace the ID with yours):
   ```sql
   UPDATE profiles SET role = 'admin'
   WHERE id = 'YOUR-USER-ID-HERE';
   ```
4. After running the fix, **log out** of the website completely and log back in again.

---

### Invitation emails are not arriving, or the link in the email does not work

**What to check:**
1. Always check the **Spam or Junk folder** first.
2. Go to Supabase → Authentication → URL Configuration.
3. Make sure **"Site URL"** is set to your real Vercel website address — not `localhost:3000` or a placeholder.
4. Make sure **"Redirect URLs"** contains your Vercel address ending in `/**`, for example: `https://elyon-schools.vercel.app/**`
5. Click **Save**, then try inviting the user again.

---

### Gallery image upload fails or images do not appear

**What to check:**
1. Go to Supabase → **Storage** in the left sidebar.
2. Look for a bucket called **"gallery"** in the list.
3. If the bucket is **not there**, go to SQL Editor and run:
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('gallery', 'gallery', true)
   ON CONFLICT (id) DO NOTHING;
   ```
4. If the bucket **exists but uploads still fail**, click on the "gallery" bucket and look for a **"Public bucket"** toggle — make sure it is switched **ON**.

---

### Paystack payment window does not open

**What to check:**
1. Go to Vercel → Settings → Environment Variables.
2. Find `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and confirm it:
   - Starts with `pk_test_` (for test mode) or `pk_live_` (for live mode)
   - Is NOT the secret key by mistake (the secret key starts with `sk_`)
3. Redeploy after making any changes.

---

### How to Switch to Real Payments When the School Is Ready

When the school wants to start accepting real fees (not test payments):

1. Log in to your Paystack dashboard at https://dashboard.paystack.com
2. Complete the **business verification** process Paystack requires. They will ask for school documents and bank account details.
3. Once Paystack approves your account, go to Settings → API Keys and copy your **Live keys** — they start with `pk_live_` and `sk_live_`.
4. Go to Vercel → Settings → Environment Variables.
5. Edit `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — replace the test value with your live public key (`pk_live_...`).
6. Edit `PAYSTACK_SECRET_KEY` — replace the test value with your live secret key (`sk_live_...`).
7. Click Redeploy to apply the changes.
8. From this point, all payments processed on the website will charge real money and go to your school's Paystack account.

---

## Quick Reference Card

Bookmark these links and save this table:

| What | Where |
|---|---|
| Your live website | The URL Vercel gave you (e.g. `https://elyon-schools.vercel.app`) |
| Admin login page | `https://your-website/login` |
| Vercel dashboard | https://vercel.com/dashboard |
| Supabase dashboard | https://supabase.com/dashboard |
| GitHub repository | `https://github.com/YOUR-USERNAME/elyon-schools` |
| Paystack dashboard | https://dashboard.paystack.com |
| Update website (redeploy) | Vercel → Deployments → three-dot menu → Redeploy |
| Add teachers / parents | Admin Dashboard → Users → Invite User |
| Manage school content | Admin Dashboard (log in to your website) |

---

## Congratulations — You Are Done!

If you followed every step above, the Elyon Schools Management System is now fully live on the internet and ready to use.

**What is now running on your website:**

- A public school website with pages for About, Admissions, News, Events, Gallery, and Contact
- An Admin portal to manage all school content, users, payments, and results
- A Teacher portal to upload and manage student academic results
- A Parent portal to view their children's results and pay school fees online
- A Student portal to view their own academic results
- A secure database with data protection rules for every type of user
- Online payment processing for school fees and admission forms via Paystack
- A photo gallery with image upload functionality

The website runs 24 hours a day, 7 days a week, automatically — no maintenance needed.
