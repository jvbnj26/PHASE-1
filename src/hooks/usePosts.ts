import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PostStatus = 'draft' | 'published';

export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author: string | null;
  published_at: string | null;
  status: PostStatus;
  category: string | null;
  created_at: string;
  updated_at: string;
};

/** Admin-facing: returns every post regardless of status (RLS scopes this to admins). */
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false });
    if (!error && data) setPosts(data as Post[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, loading, refresh };
}

export type RecentPost = {
  id: string;
  slug: string;
  title: string;
  featured_image_url: string | null;
  published_at: string | null;
};

/** Public-facing: latest published posts only, for sidebar/teaser panels. */
export function useRecentPosts(limit = 6) {
  const [posts, setPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, slug, title, featured_image_url, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit);
      if (active) {
        if (!error && data) setPosts(data as RecentPost[]);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [limit]);

  return { posts, loading };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
