import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PageBlock = {
  id: string;
  layout: 'text' | 'image' | 'text-image-right' | 'text-image-left' | 'image-full';
  /** Rich text HTML, produced by the block editor's WYSIWYG toolbar. */
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type PageStatus = 'published' | 'draft' | 'archived';

export type CustomPage = {
  id: string;
  slug: string;
  parent_slug: string | null;
  title: string;
  blocks: PageBlock[];
  status: PageStatus;
  /** Position among siblings sharing the same parent_slug — lower shows first. Controls both
   *  the order pages list in Admin > Pages and the order they appear in the public nav. */
  sort_order: number;
  created_at: string;
  updated_at: string;
};


export function useCustomPages() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (!error && data) {
      setPages(
        data.map((d: any) => ({
          ...d,
          status: (d.status as PageStatus) || 'published',
          blocks: Array.isArray(d.blocks) ? (d.blocks as PageBlock[]) : [],
          sort_order: typeof d.sort_order === 'number' ? d.sort_order : 0,
        })),
      );

    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pages, loading, refresh };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
