import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import BlogImagePlaceholder from '@/components/BlogImagePlaceholder';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/hooks/usePosts';
import { CalendarDays, User, ArrowLeft } from 'lucide-react';
import NotFound from './NotFound';

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Decodes HTML entities (e.g. "&#8211;") for use as plain text — textarea.innerHTML
// parses entities without executing any markup, so this stays safe even on untrusted input.
function decodeHtmlEntities(html: string) {
  const el = document.createElement('textarea');
  el.innerHTML = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  return el.value;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const { isAdmin, loading: authLoading } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
      setPost(data as Post | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading || authLoading) {
    return (
      <PublicLayout>
        <div className="container-custom py-20 text-center text-muted-foreground">Loading...</div>
      </PublicLayout>
    );
  }
  if (!post) return <NotFound />;
  if (post.status !== 'published' && !isAdmin) return <NotFound />;

  return (
    <PublicLayout>
      {post.status !== 'published' && (
        <div className="bg-accent text-accent-foreground text-center text-sm font-medium py-2">
          Preview only — this post is a draft and not visible to the public.
        </div>
      )}
      <PageHero
        eyebrow={post.category || undefined}
        title={decodeHtmlEntities(post.title)}
      />
      <article className="container-custom py-12 max-w-3xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <div className="flex items-center gap-5 text-sm text-muted-foreground mb-6 pb-6 border-b">
          {post.author && (
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />{formatDate(post.published_at)}</span>
          )}
        </div>

        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full aspect-video object-cover rounded-lg shadow-md mb-8"
          />
        ) : (
          <BlogImagePlaceholder className="w-full aspect-video rounded-lg shadow-md mb-8" />
        )}

        <div
          className="prose max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </article>
    </PublicLayout>
  );
}
