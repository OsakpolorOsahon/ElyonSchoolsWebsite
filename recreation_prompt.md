# AI Recreation Prompt — School Management Web App Rebranding

## How to Use This Prompt

1. Upload the zip file of the web app project to the AI.
2. Upload the completed `recreation_requirements.md` form filled in by the new school.
3. Upload the new school's logo (`logo.png`).
4. Upload any campus/school photos provided.
5. Paste the prompt below to the AI and send.

---

## THE PROMPT

You are a senior full-stack developer. I have uploaded a zip file of a fully working Next.js school management web application called "Elyon Schools Management System". I have also uploaded a completed requirements form from a new school that wants this system recreated for them, plus their logo and photos.

Your task is to **rebrand and recreate this entire project for the new school** by editing the existing files. Do not rewrite the entire codebase from scratch. The management portal logic (authentication, database queries, API routes, the admin/teacher/parent/student dashboards) must remain functionally intact. What must change completely is everything visible — the entire public-facing website must look original, fresh, and unmistakably built for the new school.

Read the completed requirements form carefully before making any changes. Every answer in that form must be reflected somewhere in the project.

---

## WHAT MUST CHANGE COMPLETELY

### 1. School Logo and Favicon

- Replace `public/logo.png` with the new school's logo file.
- If a `favicon.ico` was provided, replace `public/favicon.ico`.
- If no favicon was provided, generate a square 32×32 version from the new logo.
- Every place in the code that references `"Elyon Schools"` as the logo alt text must be updated to the new school name.

### 2. Colour Scheme — Apply Throughout the Entire Project

This is one of the most important changes. The current project uses green (#14532d) as the primary colour and gold (#eab308) as the accent. You must replace the entire colour system with the new school's colours.

**File: `app/globals.css`**

Update the CSS variables in both `:root` and `.dark` to reflect the new school's primary and accent colours. The existing variable names (`--primary`, `--secondary`, `--accent`, etc.) must stay the same, but their HSL values must change to match the new school's colours.

To convert a hex colour to HSL for the CSS variables:
- Look up the hex-to-HSL conversion for each of the new school's colours.
- The format used in this file is `H S% L%` (space-separated, no `hsl()` wrapper).
- Update `--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring`, `--chart-1`, `--chart-3`, `--chart-5` to the new primary colour.
- Update `--secondary` to a slightly lighter or darker variant of the primary colour.
- Update `--accent`, `--chart-2`, `--chart-4` to the new accent colour.
- Update `--primary-border`, `--secondary-border`, `--accent-border` accordingly.
- Update `--foreground`, `--card-foreground`, `--sidebar-foreground`, etc. to use the same hue as the new primary (adjusted to a very dark shade for light mode and a very light shade for dark mode).

**File: `public/manifest.json`**

- Update `"theme_color"` to match the new school's primary colour (as a hex value).
- Update `"background_color"` to white (`#ffffff`) or a light version of the school's colour if appropriate.

### 3. Public-Facing Website — Full Visual Rebrand

The public website consists of the pages inside `app/(marketing)/`. Every single page must be rewritten to look and feel original for the new school. This means:

- **Do not just swap text.** Change the layout, structure, and visual arrangement of each page.
- **Design new hero sections** with different layouts than the originals. For example, if the original homepage has a left-aligned text block on a coloured background, try a centred hero with a school photo background, or a split two-column hero with stats on the right, or a full-width banner with an overlay. Make it visually distinct.
- **Rearrange the order of sections** on each page where it makes sense.
- **Use the new school's photos** in place of any placeholder images or logo-only displays.
- **Write all copy (text content) fresh** using the information from the requirements form. Do not carry over any text that refers to "Elyon Schools".

Below are all the public pages and exactly what must change in each:

---

**`app/(marketing)/page.tsx` — Homepage**

This is the most important page. It must look completely different from the Elyon Schools homepage.

Rebuild this page with:
- A new hero section (different layout from the original) featuring the new school's name, tagline, and main headline from the requirements form. If campus photos were provided, use one as a background or featured image.
- A statistics/achievements bar using the new school's numbers (students, teachers, years, pass rate).
- A "Why Choose Us" / key features section using the selling points from the requirements form.
- A brief programmes overview showing the school levels offered.
- A call-to-action section pointing to admissions.
- If testimonials were provided, include a testimonials section.
- Update the `metadata` export with the new school's page title, description, and keywords.
- Replace the `SchoolJsonLd` data with the new school's name, address, phone, email, and social media URLs.

---

**`app/(marketing)/about/page.tsx` — About Us**

Rebuild this page with:
- A hero section (different design from the original) with the new school's founding year and a headline about the school.
- The "Our Story" narrative paragraphs from the requirements form — written in full, not abbreviated.
- Mission, Vision, and Motto/Core Values cards — using the new school's exact mission, vision, and values from the requirements form.
- The history timeline using the new school's milestone events (years, titles, descriptions from the requirements form).
- The leadership section using the new school's principal's name, title, qualifications, bio, and any other leadership listed.
- Update `metadata` with the new school's information.

---

**`app/(marketing)/academics/page.tsx` — Academics Overview**

Rebuild this page with:
- A hero section for the academics overview.
- Programme cards only for the school levels actually offered (check the requirements form — not every school has all levels).
- Each programme card must use the new school's class names, age ranges, and listed features/subjects.
- The extracurricular activities section must list only the activities provided in the requirements form.
- Update `metadata`.

---

**`app/(marketing)/academics/nursery/page.tsx`** (if nursery is offered)
**`app/(marketing)/academics/primary/page.tsx`** (if primary is offered)
**`app/(marketing)/academics/secondary/page.tsx`** (if secondary is offered)

Update each sub-page with the appropriate content from the requirements form. If a school level is not offered, remove its navigation link from the Header but keep the file (redirect to /academics or show "Coming soon").

---

**`app/(marketing)/admissions/page.tsx` — Admissions**

Rebuild this page with:
- A hero section for admissions.
- The admissions process steps using the steps, titles, and descriptions from the requirements form.
- The required documents section using the documents list for each level from the requirements form.
- The FAQs section using the questions and answers from the requirements form.
- The application fee amounts from the requirements form.
- Update `metadata`.

---

**`app/(marketing)/contact/page.tsx` — Contact**

Update all contact details:
- Replace the school address with the new school's address.
- Replace all phone numbers with the new school's phone numbers.
- Replace the email address with the new school's email.
- Replace office hours with the new school's hours.
- Replace the map embed (if present) with the new school's location.
- Replace WhatsApp link with the new school's WhatsApp number.
- Update `metadata`.

---

**`app/(marketing)/downloads/prospectus/page.tsx` — Prospectus PDF**

Update all content in the printable prospectus document:
- School name, logo, address, phone, email at the top header.
- Vision and mission statements from the requirements form.
- Academic programmes section — levels, age ranges, class names from the requirements form.
- Facilities list from the requirements form.
- Fee structure table with all levels and amounts from the requirements form.
- Academic session year from the requirements form.
- Any references to "Elyon Schools" or "elyon" in the `downloadAsPdf` filename call — change to the new school's name (e.g. `greenfield-academy-prospectus.pdf`).

---

**`app/(marketing)/downloads/timetable/page.tsx` — Timetable PDF**

Update:
- School name and logo at the top.
- Academic session year.
- Primary timetable — replace every subject entry with the timetable provided in the requirements form.
- Secondary timetable — replace every subject entry with the secondary timetable from the requirements form.
- The `downloadAsPdf` filename — change to the new school's name (e.g. `greenfield-academy-timetable.pdf`).
- If the new school's timetable uses different time slots, update those too.

---

### 4. Site-Wide Identity Files

**`components/public/Header.tsx`**

- Update the school name text and logo `alt` attribute.
- Update the "Est. YEAR" label with the new school's founding year.
- Keep all navigation links as-is (they point to the same routes). Only update the school name and logo.

**`components/public/Footer.tsx`**

- Update the school name and "Est. YEAR" label.
- Update the address, phone numbers, and email address.
- Update office hours.
- Update all social media links with the new school's URLs. Remove any platform listed as "N/A" in the requirements form (delete the icon and link from the `socialLinks` array).
- Update the copyright line with the new school's name.
- Update the footer description paragraph.
- Update the motto/slogan in the italic quote.

**`app/layout.tsx`**

- Update `metadataBase` URL to the new school's domain.
- Update the `title.template` to use the new school's name.
- Update `title.default`, `description`, `keywords`, `authors`, `creator`, `publisher`, `openGraph.siteName`, `openGraph.locale` (if country differs), and `twitter` fields with the new school's information.

**`app/sitemap.ts`**

- Update the base URL (currently `https://elyonschools.edu.ng`) to the new school's domain.

**`public/robots.txt`**

- Update the `Sitemap:` URL to the new school's domain.

**`next.config.js`**

- In the `Content-Security-Policy` header, update any domain-specific entries to match the new school's domain.
- Update `Sitemap:` URL if present.

**`public/manifest.json`**

- Update `"name"` to the new school's full name.
- Update `"short_name"` to the new school's app short name (max 12 characters).
- Update `"description"` to a one-line description using the new school's name and tagline.
- Update `"theme_color"` to the new school's primary colour hex code.
- Update `"id"` to a slug version of the new school's name (e.g. `"greenfield-academy-app"`).

**`app/opengraph-image.tsx`**

- Update the school name text.
- Update the tagline/description text.
- Update the founding year.
- Update the background gradient colour values to match the new school's primary colour.
- Update any accent colour references to the new school's accent colour.

**`components/seo/JsonLd.tsx`**

- Update the `SchoolJsonLd` component's default values (name, description, address, phone, email, social media URLs, founding year).
- Ensure the `NewsArticleJsonLd` publisher name matches the new school's name.

---

### 5. Database Setup File

**`supabase/setup.sql`** (or the main SQL setup file in the project)

Do not change the SQL schema structure (tables, columns, relationships, RLS policies) at all — the database structure is identical for every school. However, update any hardcoded school name strings or seed data that references "Elyon Schools" directly.

After editing is complete, this file must be run in the new school's Supabase SQL editor during deployment.

---

## WHAT MUST NOT CHANGE

Do not modify any of the following — these contain the core application logic that works the same for every school:

- `app/(portal)/` — All admin, teacher, parent, and student portal pages and their logic.
- `app/api/` — All API route handlers.
- `lib/` — All utility functions, helpers, and library code.
- `hooks/` — All custom React hooks.
- `components/ui/` — All Shadcn UI components.
- `shared/schema.ts` — The database schema (table and column definitions).
- `server/` — Any server-side utilities.
- The authentication flow (`app/(auth)/`).
- `drizzle.config.ts`, `tsconfig.json`, `tailwind.config.ts` (the structure — only the colour tokens in `app/globals.css` should change, not the config file itself unless a tailwind colour name must be added).
- `package.json` — Do not add or remove packages.

---

## QUALITY CHECKS BEFORE FINISHING

Before delivering the edited project, verify:

1. **Search for "Elyon"** across all files — there should be zero results remaining anywhere in the codebase.
2. **Search for "elyonschools.edu.ng"** — replace every instance with the new school's domain.
3. **Search for "elyononcam@gmail.com"** — replace with the new school's email.
4. **Search for "+234 703 517 5566"** and all other Elyon phone numbers — replace with the new school's phone numbers.
5. **Search for "1994"** (the founding year) — replace with the new school's founding year everywhere it appears.
6. **Search for "Dr. Emmanuel Okafor"** — replace with the new school's principal name.
7. **Search for "Hardwork and Determination"** (the motto) — replace with the new school's motto.
8. **Search for "6, Orija Street"** (the old address) — replace with the new school's address.
9. **Search for "El-Shaddai"** (the original school name) — replace with the new school's original name if they had one, or remove the reference.
10. **Search for "facebook.com/elyonchildrensworld"** and all social media links — replace with the new school's social media URLs or remove if "N/A".
11. **Check `globals.css`** — confirm there are no remaining references to the old green hue (hue 133).
12. **Check `manifest.json`** — confirm the name, short_name, theme_color, and id are all updated.
13. **Check the prospectus and timetable pages** — confirm all fee amounts, subjects, class names, and contact details match the new school.
14. **Check `app/layout.tsx`** — confirm the metadataBase URL, site name, description, and keywords are all updated.
15. **Check `app/sitemap.ts`** — confirm the base URL is the new school's domain.

---

## FINAL DELIVERABLE

When all edits are complete, provide the full updated project as a downloadable zip file. The zip should be ready to:

1. Push to a GitHub repository.
2. Deploy to Vercel (connect the GitHub repo, add all environment variables from the requirements form).
3. Run the `supabase/setup.sql` file in the new school's Supabase SQL editor.
4. Set up the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`) using the keys from the requirements form.

After those steps are done, the school management system should be fully live, working, and branded for the new school with zero references to Elyon Schools remaining anywhere.
