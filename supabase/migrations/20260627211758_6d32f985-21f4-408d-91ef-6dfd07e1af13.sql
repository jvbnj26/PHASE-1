ALTER TABLE public.member_profiles DROP CONSTRAINT IF EXISTS member_profiles_user_id_fkey;
ALTER TABLE public.member_profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.member_profiles ALTER COLUMN user_id SET DEFAULT gen_random_uuid();