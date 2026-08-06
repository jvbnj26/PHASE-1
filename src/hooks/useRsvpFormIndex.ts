import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Map of eventId -> rsvp_forms.id, for PUBLISHED forms only. RSVP buttons across the
 * site check this to decide: navigate to the custom form, or fall back to the existing
 * plain one-click toggle. Only queried once signed in — RLS requires authentication to
 * read rsvp_forms at all, and RSVPing already requires sign-in today either way.
 */
export function useRsvpFormIndex() {
  const { isAuthenticated } = useAuth();
  const [formIndex, setFormIndex] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setFormIndex(new Map());
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('rsvp_forms')
      .select('id, event_id')
      .eq('status', 'published');
    if (!error && data) {
      setFormIndex(new Map(data.map((r) => [r.event_id, r.id])));
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { formIndex, loading, refresh };
}
