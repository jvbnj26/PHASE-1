-- RSVP form builder: one optional custom question set per event. Events with no row
-- here (or a draft-status row) keep the existing plain one-click RSVP toggle.

CREATE TABLE public.rsvp_forms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  questions   JSONB NOT NULL DEFAULT '[]'::jsonb,
  status      TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published')),
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER rsvp_forms_touch BEFORE UPDATE ON public.rsvp_forms
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvp_forms TO authenticated;
GRANT ALL ON public.rsvp_forms TO service_role;

ALTER TABLE public.rsvp_forms ENABLE ROW LEVEL SECURITY;

-- Reading a form requires being signed in (RSVPing already requires that today — no
-- regression), and only published forms are visible to non-admins.
CREATE POLICY "rsvp_forms select" ON public.rsvp_forms FOR SELECT TO authenticated
  USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "rsvp_forms admin write" ON public.rsvp_forms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Extend rsvps to optionally carry structured answers to a form.
ALTER TABLE public.rsvps ADD COLUMN answers JSONB;
ALTER TABLE public.rsvps ADD COLUMN rsvp_form_id UUID REFERENCES public.rsvp_forms(id) ON DELETE SET NULL;
ALTER TABLE public.rsvps ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TRIGGER rsvps_touch BEFORE UPDATE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Members can now edit their own submitted answers (no UPDATE policy existed before).
GRANT UPDATE ON public.rsvps TO authenticated;
CREATE POLICY "rsvps update own" ON public.rsvps FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
