-- Run only after scripts/migrate-events-to-table.mjs has been run and its report
-- confirmed there are zero (or explicitly-resolved) orphaned rsvps.event_id values.

ALTER TABLE public.rsvps ALTER COLUMN event_id TYPE uuid USING event_id::uuid;
ALTER TABLE public.rsvps ALTER COLUMN event_id DROP NOT NULL;
ALTER TABLE public.rsvps ADD CONSTRAINT rsvps_event_id_fkey
  FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;

-- Pre-existing bug fix: admins could not read other members' rsvps rows at all
-- (no admin override on the SELECT policy), even though AdminMemberDetailPage.tsx
-- already queries them. Fixed alongside this touch to the same table/policy set.
DROP POLICY "Users can view own rsvps" ON public.rsvps;
CREATE POLICY "rsvps select" ON public.rsvps FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY "Users can delete own rsvps" ON public.rsvps;
CREATE POLICY "rsvps delete" ON public.rsvps FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
