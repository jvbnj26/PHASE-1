import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { supabase } from '@/integrations/supabase/client';
import { CustomPage } from '@/hooks/useCustomPages';
import { PageBlockView } from '@/components/PageBlocks';
import { useAuth } from '@/contexts/AuthContext';
import { resolveParentPagePath } from '@/data/navigation';
import NotFound from './NotFound';

export default function CustomPageView() {
  const { slug, parent } = useParams();
  const { isAdmin, loading: authLoading } = useAuth();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let q = supabase.from('custom_pages').select('*').eq('slug', slug);
      q = parent ? q.eq('parent_slug', parent) : q.is('parent_slug', null);
      const { data } = await q.maybeSingle();
      setPage(data as any);
      setLoading(false);
    })();
  }, [slug, parent]);

  if (loading || authLoading) {
    return (
      <PublicLayout>
        <div className="container-custom py-20 text-center text-muted-foreground">Loading...</div>
      </PublicLayout>
    );
  }
  if (!page) return <NotFound />;
  // Unpublished pages are previews only — visible to admins so they can check
  // a draft before publishing, but 404 for everyone else.
  if (page.status !== 'published' && !isAdmin) return <NotFound />;

  return (
    <PublicLayout>
      {page.status !== 'published' && (
        <div className="bg-accent text-accent-foreground text-center text-sm font-medium py-2">
          Preview only — this page is {page.status} and not visible to the public.
        </div>
      )}
      <PageHero title={page.title} />
      <section className="container-custom py-12">
        {page.parent_slug && (
          // parent_slug is either another custom page's own slug (lives at /p/:slug) or a
          // built-in page's reserved segment (e.g. 'about', which lives at /about, not /p/about)
          <Link to={resolveParentPagePath(page.parent_slug)} className="text-sm text-secondary hover:underline">
            ← Back
          </Link>
        )}
        {page.blocks.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">This page has no content yet.</p>
        ) : (
          page.blocks.map((b) => <PageBlockView key={b.id} b={b} />)
        )}
      </section>
    </PublicLayout>
  );
}
