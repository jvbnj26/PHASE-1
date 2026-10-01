-- Production hardening: handle_new_user() used to grant the 'admin' role to any
-- auth user signing up with the email admin@jvbnj.org, regardless of password —
-- a deliberate "discoverable admin login" for the demo phase (see 20260815230000).
-- Now that the site is going to production, that auto-grant is a backdoor: anyone
-- who learns that email could sign up and receive admin access. This removes it.
--
-- The existing admin account keeps its role — that was already persisted as a row
-- in user_roles by the original migration's backfill, not re-derived from this
-- function, so dropping the email check here does not affect current admin access.
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

  RETURN NEW;
END;
$$;
