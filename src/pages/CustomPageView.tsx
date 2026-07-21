import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { supabase } from '@/integrations/supabase/client';
import { CustomPage, PageBlock } from '@/hooks/useCustomPages';
import { useAuth } from '@/contexts/AuthContext';
import NotFound from './NotFound';

function Block({ b }: { b: PageBlock }) {
  const text = b.body ? (
    <div
      className="prose max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(b.body) }}
    />
  ) : null;
  const img = b.imageUrl ? (
    <img src={b.imageUrl} alt={b.imageAlt || ''} className="w-full h-auto rounded-lg shadow-md object-cover" />
  ) : null;

  if (b.layout === 'image-full' && img) {
    return <div className="my-8">{img}</div>;
  }
  if (b.layout === 'image' && img) {
    return <div className="my-8 max-w-3xl mx-auto">{img}</div>;
  }
  if (b.layout === 'text') {
    return <div className="my-8 max-w-3xl mx-auto">{text}</div>;
  }
  if (b.layout === 'text-image-left' && img) {
    return (
      <div className="my-10 grid md:grid-cols-2 gap-8 items-center">
        <div>{img}</div>
        <div>{text}</div>
      </div>
    );
  }
  // text-image-right (default)
  return (
    <div className="my-10 grid md:grid-cols-2 gap-8 items-center">
      <div>{text}</div>
      {img && <div>{img}</div>}
    </div>
  );
}

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
          <Link to={`/p/${page.parent_slug}`} className="text-sm text-secondary hover:underline">
            ← Back
          </Link>
        )}
        {page.blocks.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">This page has no content yet.</p>
        ) : (
          page.blocks.map((b) => <Block key={b.id} b={b} />)
        )}
      </section>
    </PublicLayout>
  );
}
