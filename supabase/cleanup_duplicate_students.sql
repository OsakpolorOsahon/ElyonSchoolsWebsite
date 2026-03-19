-- ============================================================
-- CLEANUP: Remove duplicate student records and enforce
--          one-account-per-student at the database level.
--
-- HOW TO USE:
--   1. Go to your Supabase project → SQL Editor
--   2. Paste and run this entire script
--   3. The script is safe to run — it shows duplicates first,
--      then removes them, then adds the constraint.
-- ============================================================

-- STEP 1: Preview which duplicate records will be removed
-- (These are the extra rows that share a profile_id)
SELECT
  id,
  admission_number,
  class,
  profile_id,
  created_at,
  'WILL BE DELETED' AS action
FROM students
WHERE profile_id IN (
  SELECT profile_id
  FROM students
  WHERE profile_id IS NOT NULL
  GROUP BY profile_id
  HAVING COUNT(*) > 1
)
AND id NOT IN (
  -- Keep only the earliest record for each profile_id
  SELECT DISTINCT ON (profile_id) id
  FROM students
  WHERE profile_id IS NOT NULL
  ORDER BY profile_id, created_at ASC
)
ORDER BY profile_id, created_at;


-- STEP 2: Delete the duplicate records
-- (Keeps the earliest record for each profile_id)
DELETE FROM students
WHERE profile_id IN (
  SELECT profile_id
  FROM students
  WHERE profile_id IS NOT NULL
  GROUP BY profile_id
  HAVING COUNT(*) > 1
)
AND id NOT IN (
  SELECT DISTINCT ON (profile_id) id
  FROM students
  WHERE profile_id IS NOT NULL
  ORDER BY profile_id, created_at ASC
);


-- STEP 3: Add the UNIQUE constraint so this can never happen again
ALTER TABLE students
  ADD CONSTRAINT students_profile_id_unique UNIQUE (profile_id);


-- STEP 4: Confirm result
SELECT
  COUNT(*) AS total_students,
  COUNT(DISTINCT profile_id) AS unique_profiles
FROM students;
