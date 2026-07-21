-- Signup wizard refactor: drop program_enrollments, simplify member profile,
-- event, donation, and communication preference fields to match the
-- redesigned signup wizard.

-- member_profiles: remove date_of_birth/marital_status/occupation/employer_or_school/
-- language_preference, add school_name (Youth college/school) and interested_in_gyanshala.
ALTER TABLE public.member_profiles
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS marital_status,
  DROP COLUMN IF EXISTS occupation,
  DROP COLUMN IF EXISTS employer_or_school,
  DROP COLUMN IF EXISTS language_preference,
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS interested_in_gyanshala BOOLEAN DEFAULT false;

-- Program enrollment is no longer collected or tracked.
DROP TABLE IF EXISTS public.program_enrollments;

-- event_preferences: drop meal/food/skills/certifications fields.
ALTER TABLE public.event_preferences
  DROP COLUMN IF EXISTS meal_preference,
  DROP COLUMN IF EXISTS food_allergies,
  DROP COLUMN IF EXISTS skills_talents,
  DROP COLUMN IF EXISTS certifications;

-- donation_preferences: replace ad-hoc giving fields with a single donor category.
ALTER TABLE public.donation_preferences
  DROP COLUMN IF EXISTS interested_in_donating,
  DROP COLUMN IF EXISTS preferred_donation_type,
  DROP COLUMN IF EXISTS preferred_giving_category,
  DROP COLUMN IF EXISTS tax_receipt_needed,
  DROP COLUMN IF EXISTS employer_matching_interest,
  DROP COLUMN IF EXISTS anonymous_donation_preference,
  ADD COLUMN IF NOT EXISTS donor_category TEXT;

-- communication_preferences: drop emergency_alerts.
ALTER TABLE public.communication_preferences
  DROP COLUMN IF EXISTS emergency_alerts;
