-- Blog: posts table for the migrated WordPress content + ongoing admin-authored posts.

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  featured_image_url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX posts_status_idx ON public.posts(status);
CREATE INDEX posts_published_at_idx ON public.posts(published_at DESC);

GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Public can only read published posts; admins (route-guarded client-side, same as custom_pages) see everything via authenticated writes.
CREATE POLICY "posts public read" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "posts auth select" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts auth insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "posts auth update" ON public.posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "posts auth delete" ON public.posts FOR DELETE TO authenticated USING (true);

CREATE TRIGGER posts_touch BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
