-- Fix overly permissive admissions RLS policy
-- The original "Anyone can view own admission by email" used USING (true)
-- which allowed ALL authenticated users to read ALL admission records.
-- The admissions status lookup uses createAdminClient() (service role) which
-- bypasses RLS, so removing this policy does not break public status lookups.

DROP POLICY IF EXISTS "Anyone can view own admission by email" ON admissions;
