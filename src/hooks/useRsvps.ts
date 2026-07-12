import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useRsvps() {
  const { user, isAuthenticated } = useAuth();
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setRsvpIds(new Set()); return; }
    setLoading(true);
    const { data } = await supabase
      .from('rsvps')
      .select('event_id')
      .eq('user_id', user.id);
    setRsvpIds(new Set((data || []).map((r) => r.event_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const toggleRsvp = useCallback(async (eventId: string, eventTitle: string): Promise<boolean> => {
    if (!user) return false;
    if (rsvpIds.has(eventId)) {
      const { error } = await supabase
        .from('rsvps')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);
      if (!error) setRsvpIds((prev) => { const n = new Set(prev); n.delete(eventId); return n; });
      return !error;
    } else {
      const { error } = await supabase
        .from('rsvps')
        .insert({ user_id: user.id, event_id: eventId, event_title: eventTitle });
      if (!error) setRsvpIds((prev) => new Set([...prev, eventId]));
      return !error;
    }
  }, [user, rsvpIds]);

  return { rsvpIds, loading, toggleRsvp, isAuthenticated, refresh: load };
}
