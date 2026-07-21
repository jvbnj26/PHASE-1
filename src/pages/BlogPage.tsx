import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import BlogImagePlaceholder from '@/components/BlogImagePlaceholder';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, User } from 'lucide-react';

type PostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author: string | null;
  published_at: string | null;
  category: string | null;
};

const PAGE_SIZE = 12;

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  const [posts, setPosts] = useState<PostCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = async (page: number) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('posts')
      .select('id, slug, title, excerpt, featured_image_url, author, published_at, category')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .range(from, to);
    if (!error && data) {
      setPosts((prev) => (page === 0 ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadPage(0);
      setLoading(false);
    })();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadPage(Math.floor(posts.length / PAGE_SIZE));
    setLoadingMore(false);
  };

  return (
    <PublicLayout>
      <PageHero eyebrow="News & Reflections" title="Blog" subtitle="Stories, updates, and spiritual reflections from the JVBNA NJ community." />

      <section className="container-custom py-12">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No posts yet — check back soon.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-lg border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <BlogImagePlaceholder className="w-full h-full group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    {post.category && (
                      <span className="text-xs font-semibold tracking-wide uppercase text-secondary mb-2">
                        {post.category}
                      </span>
                    )}
                    <h2
                      className="font-serif text-lg font-bold text-foreground leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.title) }}
                    />
                    {post.excerpt && (
                      <div
                        className="text-sm text-muted-foreground line-clamp-3 mb-4 [&_p]:m-0"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.excerpt) }}
                      />
                    )}
                    <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                      {post.author && (
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{post.author}</span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{formatDate(post.published_at)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load more posts'}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
