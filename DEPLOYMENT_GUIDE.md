# How to Deploy Elyon Schools to Vercel

## A Step-by-Step Guide (Super Easy!)

This guide will walk you through putting your Elyon Schools website online so anyone in the world can visit it. Don't worry - we'll go nice and slow!

---

## What You'll Need Before Starting

Before we begin, make sure you have these things ready:

### 1. A GitHub Account
- **What is it?** GitHub is like a safe storage place for your code on the internet
- **Don't have one?** Go to [github.com](https://github.com) and click "Sign up"
- **Cost:** FREE!

### 2. A Vercel Account
- **What is it?** Vercel is the company that will put your website online
- **Don't have one?** Go to [vercel.com](https://vercel.com) and click "Sign Up"
- **Tip:** Sign up using your GitHub account (click "Continue with GitHub") - this makes things easier!
- **Cost:** FREE for personal projects!

### 3. A Supabase Account
- **What is it?** Supabase is where your website stores all its information (students, teachers, grades, etc.)
- **Don't have one?** Go to [supabase.com](https://supabase.com) and click "Start your project"
- **Cost:** FREE for small projects!

---

## Part 1: Push Your Code to GitHub

First, we need to put your code on GitHub so Vercel can find it.

### Step 1.1: Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and log in
2. Click the **green "New" button** (or the **+** icon in the top right corner)
3. Fill in the form:
   - **Repository name:** Type `elyon-schools` (or any name you like)
   - **Description:** Type `Elyon Schools Management System` (optional)
   - **Public or Private:** Choose "Private" if you don't want others to see your code
4. **DO NOT** check "Add a README file" (we already have one)
5. Click the **green "Create repository" button**

### Step 1.2: Connect Your Replit Project to GitHub

1. In your Replit project, open the **Shell** (it's at the bottom of your screen)
2. Type these commands one by one, pressing **Enter** after each:

```bash
git remote add origin https://github.com/YOUR_USERNAME/elyon-schools.git
```
(Replace `YOUR_USERNAME` with your actual GitHub username)

```bash
git branch -M main
```

```bash
git add .
```

```bash
git commit -m "Initial commit - Elyon Schools"
```

```bash
git push -u origin main
```

3. If asked for your GitHub username and password:
   - Enter your GitHub username
   - For password, you need to use a **Personal Access Token** (not your regular password)
   
### Step 1.3: How to Get a GitHub Personal Access Token

1. Go to GitHub and click your **profile picture** (top right corner)
2. Click **"Settings"**
3. Scroll down and click **"Developer settings"** (at the very bottom of the left menu)
4. Click **"Personal access tokens"**
5. Click **"Tokens (classic)"**
6. Click **"Generate new token"** → **"Generate new token (classic)"**
7. Fill in the form:
   - **Note:** Type `Replit Access`
   - **Expiration:** Choose "90 days" or "No expiration"
   - **Select scopes:** Check the box next to **"repo"** (this gives access to your repositories)
8. Click **"Generate token"**
9. **IMPORTANT:** Copy the token immediately! You won't see it again!
10. Use this token as your password when pushing to GitHub

---

## Part 2: Set Up Supabase (Your Database)

Now we need to create a place to store all your school's information.

### Step 2.1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and log in
2. Click **"New project"**
3. Fill in the form:
   - **Name:** Type `elyon-schools`
   - **Database Password:** Create a strong password and **WRITE IT DOWN** somewhere safe!
   - **Region:** Choose the one closest to Nigeria (like "West EU" or "South Africa")
4. Click **"Create new project"**
5. Wait 2-3 minutes for your project to be created (you'll see a loading screen)

### Step 2.2: Get Your Supabase Keys

Once your project is ready:

1. Click **"Project Settings"** (the gear icon on the left sidebar)
2. Click **"API"** in the left menu
3. You'll see two important things - **COPY BOTH OF THESE:**

   **Project URL:** It looks like this:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
   
   **anon public key:** It's a long string of letters and numbers like this:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

4. **Save both of these somewhere safe** - you'll need them soon!

### Step 2.3: Set Up Your Database Tables

1. In Supabase, click **"SQL Editor"** in the left sidebar (it looks like a document with a play button)
2. Click **"New query"**
3. Copy ALL the code from the file `supabase/migrations/20240101000001_initial_schema.sql` in your project
4. Paste it into the SQL Editor
5. Click the **green "Run" button**
6. You should see "Success. No rows returned" - this is good!

---

## Part 3: Deploy to Vercel

Now the exciting part - putting your website online!

### Step 3.1: Connect Vercel to Your GitHub

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New..."** button (top right)
3. Click **"Project"**
4. You'll see a list of your GitHub repositories
5. Find **"elyon-schools"** and click **"Import"**

### Step 3.2: Configure Your Project

After clicking Import, you'll see a configuration screen:

1. **Framework Preset:** Should automatically say "Next.js" - if not, select it
2. **Root Directory:** Leave it as `.` (just a dot)
3. **Build Command:** Leave it as `next build` (or blank - Vercel knows what to do)

### Step 3.3: Add Environment Variables (VERY IMPORTANT!)

This is where you tell Vercel your secret keys. Still on the configuration screen:

1. Click **"Environment Variables"** to expand that section
2. Add each of these one by one:

   **First Variable:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Paste your Supabase Project URL (the one that looks like `https://abc...supabase.co`)
   - Click "Add"

   **Second Variable:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Paste your Supabase anon public key (the long string of letters)
   - Click "Add"

   **Third Variable:**
   - Name: `SESSION_SECRET`
   - Value: Type any random long string of letters and numbers (like `my-super-secret-key-12345-elyon`)
   - Click "Add"

### Step 3.4: Deploy!

1. Double-check all your environment variables are added
2. Click the big **"Deploy"** button
3. **Wait...** (This takes about 2-5 minutes)
4. You'll see a progress screen with logs scrolling by
5. When it's done, you'll see **"Congratulations!"** with confetti!

### Step 3.5: Visit Your Live Website!

1. Vercel will give you a URL like: `elyon-schools-abc123.vercel.app`
2. Click on it to see your website live on the internet!
3. Share this link with anyone - they can now visit your school website!

---

## Part 4: Set Up a Custom Domain (Optional)

Want your website to be `www.elyonschools.com` instead of the long Vercel URL?

### Step 4.1: Buy a Domain Name

1. Go to a domain seller like:
   - [Namecheap](https://namecheap.com)
   - [Google Domains](https://domains.google)
   - [GoDaddy](https://godaddy.com)
2. Search for the domain you want (like `elyonschools.com`)
3. Buy it (usually costs $10-15 per year)

### Step 4.2: Add Domain to Vercel

1. In Vercel, go to your project
2. Click **"Settings"** (tab at the top)
3. Click **"Domains"** in the left sidebar
4. Type your domain name (like `elyonschools.com`) and click **"Add"**
5. Vercel will show you instructions for connecting your domain

### Step 4.3: Update Domain Settings

1. Log into your domain seller (Namecheap, GoDaddy, etc.)
2. Find the DNS settings for your domain
3. Add the records that Vercel shows you (usually it's changing the nameservers or adding CNAME records)
4. Wait 24-48 hours for the domain to connect

---

## Part 5: Making Updates to Your Website

Every time you make changes to your website:

### Step 5.1: Push Changes to GitHub

In Replit's Shell, type:

```bash
git add .
```

```bash
git commit -m "Describe what you changed"
```

```bash
git push
```

### Step 5.2: Automatic Deployment

Vercel automatically sees your changes and deploys them! Just wait 2-3 minutes after pushing.

---

## Troubleshooting Common Problems

### Problem: "Build Failed" on Vercel

**What to do:**
1. Click on the failed deployment in Vercel
2. Click "View Build Logs"
3. Scroll down to find the red error message
4. Common fixes:
   - Missing environment variables - go back to Project Settings → Environment Variables and add them
   - Make sure all 3 variables are added correctly

### Problem: "Page Not Found" or Blank Page

**What to do:**
1. Check if your environment variables are spelled correctly (watch out for typos!)
2. Make sure there are no extra spaces before or after the values
3. Try redeploying: Go to your project → Deployments → Click the three dots → Redeploy

### Problem: "Cannot Connect to Database"

**What to do:**
1. Go to Supabase → Project Settings → API
2. Copy the URL and key again (make sure you're copying the right ones)
3. In Vercel, update the environment variables with the fresh values
4. Redeploy

### Problem: GitHub Says "Authentication Failed"

**What to do:**
1. Your Personal Access Token might have expired
2. Create a new one following Step 1.3 above
3. Try pushing again with the new token

---

## Quick Reference: Your Important URLs

After setup, bookmark these:

| What | Where to Find It |
|------|-----------------|
| Your live website | `your-project-name.vercel.app` |
| Vercel Dashboard | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Supabase Dashboard | [supabase.com/dashboard](https://supabase.com/dashboard) |
| GitHub Repository | [github.com/YOUR_USERNAME/elyon-schools](https://github.com) |

---

## Quick Reference: Your Environment Variables

These are the secret keys your website needs:

| Variable Name | Where to Get It |
|--------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public key |
| `SESSION_SECRET` | Make up any random string of letters and numbers |

---

## Need More Help?

- **Vercel Help:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Help:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Help:** [nextjs.org/docs](https://nextjs.org/docs)

---

## Congratulations!

If you've followed all these steps, your Elyon Schools website should now be live on the internet! Anyone with the link can visit it, and you can share it with parents, students, and staff.

Remember:
- Changes you make in Replit → Push to GitHub → Vercel automatically updates your website
- Keep your passwords and keys safe - never share them publicly
- Check Vercel dashboard occasionally to make sure everything is running smoothly

**You did it!** 🎉
