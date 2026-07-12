CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  parent_slug text,
  title text NOT NULL,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_slug, slug)
);

GRANT SELECT ON public.custom_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_pages TO authenticated;
GRANT ALL ON public.custom_pages TO service_role;

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cp public read" ON public.custom_pages FOR SELECT USING (true);
CREATE POLICY "cp auth insert" ON public.custom_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cp auth update" ON public.custom_pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cp auth delete" ON public.custom_pages FOR DELETE TO authenticated USING (true);

CREATE TRIGGER custom_pages_touch BEFORE UPDATE ON public.custom_pages
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();