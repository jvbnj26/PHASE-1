-- An event's RSVP method is either the plain external rsvp_link or a custom rsvp_forms
-- row — never both. The admin UI already steers toward this, but Postgres can't express
-- a cross-table CHECK, so triggers on both tables enforce it as the source of truth
-- regardless of which side (UI, script, direct SQL) writes last.

CREATE OR REPLACE FUNCTION public.clear_rsvp_link_on_form_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.events SET rsvp_link = NULL WHERE id = NEW.event_id AND rsvp_link IS NOT NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER rsvp_forms_clear_event_link
  AFTER INSERT OR UPDATE OF event_id ON public.rsvp_forms
  FOR EACH ROW EXECUTE FUNCTION public.clear_rsvp_link_on_form_created();

CREATE OR REPLACE FUNCTION public.prevent_rsvp_link_with_form()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.rsvp_link IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.rsvp_forms WHERE event_id = NEW.id
  ) THEN
    NEW.rsvp_link := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_prevent_conflicting_rsvp_link
  BEFORE INSERT OR UPDATE OF rsvp_link ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_rsvp_link_with_form();
