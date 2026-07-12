DROP POLICY IF EXISTS "mp ins" ON public.member_profiles;
DROP POLICY IF EXISTS "mp del" ON public.member_profiles;
DROP POLICY IF EXISTS "mp upd" ON public.member_profiles;
DROP POLICY IF EXISTS "mp sel" ON public.member_profiles;

CREATE POLICY "mp sel" ON public.member_profiles FOR SELECT
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "mp ins" ON public.member_profiles FOR INSERT
  WITH CHECK ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "mp upd" ON public.member_profiles FOR UPDATE
  USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "mp del" ON public.member_profiles FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));