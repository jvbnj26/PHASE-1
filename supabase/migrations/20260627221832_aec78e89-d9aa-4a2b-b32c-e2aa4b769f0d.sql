-- Ensure backend functions can be called by signed-in users and system roles.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Make the new-user setup robust for the test admin account and normal members.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT DO NOTHING;

  IF lower(NEW.email) = 'admin@jvbnj.org' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Backfill roles for any users created before the trigger/function was corrected.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'member'::public.app_role
FROM auth.users
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'admin@jvbnj.org'
ON CONFLICT DO NOTHING;

-- Recreate member profile policies with explicit authenticated-role targeting.
DROP POLICY IF EXISTS "mp sel" ON public.member_profiles;
DROP POLICY IF EXISTS "mp ins" ON public.member_profiles;
DROP POLICY IF EXISTS "mp upd" ON public.member_profiles;
DROP POLICY IF EXISTS "mp del" ON public.member_profiles;

CREATE POLICY "mp sel" ON public.member_profiles
FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "mp ins" ON public.member_profiles
FOR INSERT TO authenticated
WITH CHECK ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "mp upd" ON public.member_profiles
FOR UPDATE TO authenticated
USING ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK ((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "mp del" ON public.member_profiles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_profiles TO authenticated;
GRANT ALL ON public.member_profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;