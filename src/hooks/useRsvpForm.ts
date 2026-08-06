import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RsvpQuestionType =
  | 'short_text'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'number'
  | 'date';

export type RsvpFormQuestion = {
  id: string;
  type: RsvpQuestionType;
  label: string;
  required: boolean;
  options?: string[];
};

export type RsvpFormStatus = 'draft' | 'published';

export type RsvpForm = {
  id: string;
  event_id: string;
  questions: RsvpFormQuestion[];
  status: RsvpFormStatus;
  created_at: string;
  updated_at: string;
};

const CHOICE_TYPES: RsvpQuestionType[] = ['multiple_choice', 'checkboxes', 'dropdown'];

export function isChoiceQuestion(type: RsvpQuestionType) {
  return CHOICE_TYPES.includes(type);
}

export function newRsvpFormQuestion(type: RsvpQuestionType = 'short_text'): RsvpFormQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    label: '',
    required: false,
    options: isChoiceQuestion(type) ? ['Option 1'] : undefined,
  };
}

/** Fetches the (at most one) RSVP form attached to a given event. */
export function useRsvpForm(eventId: string | undefined) {
  const [form, setForm] = useState<RsvpForm | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!eventId) {
      setForm(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('rsvp_forms')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();
    if (!error) {
      setForm(
        data
          ? { ...data, status: data.status as RsvpFormStatus, questions: (data.questions as unknown as RsvpFormQuestion[]) || [] }
          : null,
      );
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { form, loading, refresh };
}
