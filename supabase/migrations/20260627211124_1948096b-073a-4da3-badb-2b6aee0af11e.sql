ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS organization_role text,
  ADD COLUMN IF NOT EXISTS profile_picture_url text;