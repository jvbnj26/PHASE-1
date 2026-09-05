-- Security fix: custom_pages, posts, and site_settings allowed ANY authenticated
-- user to insert/update/delete, relying on the client-side admin route guard as
-- the only real protection. That's not a security boundary — RLS is. These now
-- require the admin role, matching events/rsvp_forms.
--
-- Note: the admin@jvbnj.org auto-bootstrap in handle_new_user() (signing up with
-- that email grants the admin role) is left in place intentionally — this project
-- is still in demo, and a discoverable admin login is expected/acceptable for now.

-- custom_pages
DROP POLICY IF EXISTS "cp auth insert" ON public.custom_pages;
DROP POLICY IF EXISTS "cp auth update" ON public.custom_pages;
DROP POLICY IF EXISTS "cp auth delete" ON public.custom_pages;

CREATE POLICY "cp admin insert" ON public.custom_pages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cp admin update" ON public.custom_pages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "cp admin delete" ON public.custom_pages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- posts
DROP POLICY IF EXISTS "posts auth insert" ON public.posts;
DROP POLICY IF EXISTS "posts auth update" ON public.posts;
DROP POLICY IF EXISTS "posts auth delete" ON public.posts;

CREATE POLICY "posts admin insert" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "posts admin update" ON public.posts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "posts admin delete" ON public.posts FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- site_settings
DROP POLICY IF EXISTS "site_settings_auth_insert" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_auth_update" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings_auth_delete" ON public.site_settings;

CREATE POLICY "site_settings_admin_insert" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_settings_admin_update" ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "site_settings_admin_delete" ON public.site_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
