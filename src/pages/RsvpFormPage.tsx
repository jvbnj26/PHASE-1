import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useRsvpForm, RsvpFormQuestion } from '@/hooks/useRsvpForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;

function isBlank(v: AnswerValue | undefined): boolean {
  if (v === undefined) return true;
  if (Array.isArray(v)) return v.length === 0;
  return v.trim() === '';
}

export default function RsvpFormPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { events, loading: eventsLoading } = useEvents();
  const { form, loading: formLoading } = useRsvpForm(eventId);

  const [answers, setAnswers] = useState<Answers>({});
  const [existingRsvpId, setExistingRsvpId] = useState<string | null>(null);
  const [answersLoaded, setAnswersLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const event = events.find((e) => e.id === eventId);

  useEffect(() => {
    if (!eventId || !user) return;
    supabase
      .from('rsvps')
      .select('id, answers')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingRsvpId(data.id);
          setAnswers((data.answers as unknown as Answers) || {});
        }
        setAnswersLoaded(true);
      });
  }, [eventId, user]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to={`/auth?tab=signin&redirect=${encodeURIComponent(`/events/${eventId}/rsvp`)}`} replace />;
  }

  const loading = authLoading || eventsLoading || formLoading || (!!user && !answersLoaded);

  const setAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleCheckbox = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[] | undefined) || [];
      const next = checked ? [...current, option] : current.filter((o) => o !== option);
      return { ...prev, [questionId]: next };
    });
  };

  const handleSubmit = async () => {
    if (!user || !event || !form) return;
    const missing = form.questions.filter((q) => q.required && isBlank(answers[q.id]));
    if (missing.length > 0) {
      toast.error(`Please answer: ${missing.map((q) => q.label || 'Untitled question').join(', ')}`);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('rsvps').upsert(
      {
        user_id: user.id,
        event_id: event.id,
        event_title: event.title,
        rsvp_form_id: form.id,
        answers: answers as unknown as never,
      },
      { onConflict: 'user_id,event_id' },
    );
    setSubmitting(false);
    if (error) {
      toast.error('Could not submit your RSVP. Please try again.');
      return;
    }
    toast.success(`RSVP confirmed for ${event.title}!`);
    navigate(`/events/upcoming`);
  };

  const handleCancel = async () => {
    if (!user || !event) return;
    setCancelling(true);
    const { error } = await supabase.from('rsvps').delete().eq('user_id', user.id).eq('event_id', event.id);
    setCancelling(false);
    if (error) {
      toast.error('Could not cancel your RSVP. Please try again.');
      return;
    }
    toast.success('RSVP cancelled.');
    navigate(`/events/upcoming`);
  };

  const renderQuestion = (q: RsvpFormQuestion) => {
    const value = answers[q.id];
    switch (q.type) {
      case 'short_text':
        return <Input value={(value as string) || ''} onChange={(e) => setAnswer(q.id, e.target.value)} />;
      case 'paragraph':
        return <Textarea value={(value as string) || ''} onChange={(e) => setAnswer(q.id, e.target.value)} rows={3} />;
      case 'number':
        return <Input type="number" value={(value as string) || ''} onChange={(e) => setAnswer(q.id, e.target.value)} />;
      case 'date':
        return <Input type="date" value={(value as string) || ''} onChange={(e) => setAnswer(q.id, e.target.value)} />;
      case 'dropdown':
        return (
          <Select value={(value as string) || ''} onValueChange={(v) => setAnswer(q.id, v)}>
            <SelectTrigger className="max-w-sm"><SelectValue placeholder="Select an option…" /></SelectTrigger>
            <SelectContent>
              {(q.options || []).map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      case 'multiple_choice':
        return (
          <RadioGroup value={(value as string) || ''} onValueChange={(v) => setAnswer(q.id, v)}>
            {(q.options || []).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                <Label htmlFor={`${q.id}-${opt}`} className="font-normal">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkboxes':
        return (
          <div className="space-y-2">
            {(q.options || []).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`${q.id}-${opt}`}
                  checked={((value as string[]) || []).includes(opt)}
                  onCheckedChange={(checked) => toggleCheckbox(q.id, opt, checked === true)}
                />
                <Label htmlFor={`${q.id}-${opt}`} className="font-normal">{opt}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PublicLayout>
      <section className="bg-primary py-8">
        <div className="container-custom">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">RSVP</h1>
        </div>
      </section>

      <section className="py-12 bg-section">
        <div className="container-custom max-w-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !event ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Event not found.</p>
              <Link to="/events/upcoming" className="text-primary hover:underline mt-2 inline-block">Back to Events</Link>
            </div>
          ) : !form ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">This event doesn't have an RSVP form.</p>
              <Link to="/events/upcoming" className="text-primary hover:underline mt-2 inline-block">Back to Events</Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
              <Link to="/events/upcoming" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
              </Link>

              <h2 className="font-serif text-2xl font-bold text-foreground mb-1">{event.title}</h2>
              <p className="text-muted-foreground text-sm mb-6">{event.date}</p>

              {existingRsvpId && (
                <div className="flex items-center gap-2 bg-secondary/10 text-secondary text-sm font-medium rounded-lg px-4 py-3 mb-6">
                  <CheckCircle2 className="w-4 h-4" /> You've already RSVP'd — edit your answers below or cancel.
                </div>
              )}

              <div className="space-y-6">
                {form.questions.map((q) => (
                  <div key={q.id}>
                    <Label className="mb-2 block">
                      {q.label || 'Untitled question'}{q.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderQuestion(q)}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button onClick={handleSubmit} disabled={submitting} size="lg" className="flex-1 gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {existingRsvpId ? 'Save Changes' : 'Submit RSVP'}
                </Button>
                {existingRsvpId && (
                  <Button onClick={handleCancel} disabled={cancelling} variant="outline" size="lg" className="gap-2">
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Cancel RSVP
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
