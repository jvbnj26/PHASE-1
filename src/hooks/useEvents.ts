import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Event, EventMediaItem } from '@/data/siteContent';
import type { Database } from '@/integrations/supabase/types';

type EventRow = Database['public']['Tables']['events']['Row'];

export function eventFromRow(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    date: row.date_text,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    description: row.description,
    imageUrl: row.image_url,
    videoUrl: row.video_url || undefined,
    media: (row.media as unknown as EventMediaItem[]) || [],
    type: row.type as Event['type'],
    rsvpLink: row.rsvp_link || undefined,
    photosLink: row.photos_link || undefined,
  };
}

/** Inverse of eventFromRow — builds an insert/update payload for the events table. */
export function eventToRow(e: Partial<Event>): Database['public']['Tables']['events']['Insert'] {
  return {
    title: e.title ?? 'New Event',
    date_text: e.date ?? '',
    start_date: e.startDate || null,
    end_date: e.endDate || null,
    description: e.description ?? '',
    image_url: e.imageUrl || '/placeholder.svg',
    video_url: e.videoUrl || null,
    media: (e.media as unknown as Database['public']['Tables']['events']['Insert']['media']) || [],
    type: e.type ?? 'upcoming',
    rsvp_link: e.rsvpLink || null,
    photos_link: e.photosLink || null,
  };
}

/**
 * Mirrors useCustomPages()'s fetch+refresh shape. Maps the events table's snake_case
 * columns to the existing camelCase Event shape here, so every consumer's JSX is
 * unchanged from the site_settings-blob era — only the data source changes.
 */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true, nullsFirst: false });
    if (!error && data) {
      setEvents(data.map(eventFromRow));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, refresh };
}
