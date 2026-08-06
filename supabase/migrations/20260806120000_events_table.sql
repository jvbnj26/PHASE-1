-- Events: move off the site_settings JSONB blob into a real table with UUID PKs,
-- so RSVP-form-builder work (later migration) can FK against a stable events.id.

CREATE TABLE public.events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id    TEXT UNIQUE,        -- old string id from site_settings['events'], migration traceability only
  title        TEXT NOT NULL,
  date_text    TEXT NOT NULL DEFAULT '',   -- free-text display string (today's `date` field)
  start_date   DATE,
  end_date     DATE,
  description  TEXT NOT NULL DEFAULT '',
  image_url    TEXT NOT NULL DEFAULT '/placeholder.svg',
  video_url    TEXT,
  media        JSONB NOT NULL DEFAULT '[]'::jsonb,  -- EventMediaItem[] — {url,type}[], same shape as today
  type         TEXT NOT NULL DEFAULT 'upcoming' CHECK (type IN ('upcoming','ongoing','past')),
  rsvp_link    TEXT,
  photos_link  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX events_start_date_idx ON public.events(start_date);

CREATE TRIGGER events_touch BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT ON public.events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events public read" ON public.events FOR SELECT USING (true);
CREATE POLICY "events admin insert" ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "events admin update" ON public.events FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "events admin delete" ON public.events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for event images, replacing base64-in-JSONB going forward.
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "event-images public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');
CREATE POLICY "event-images admin write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "event-images admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "event-images admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));
