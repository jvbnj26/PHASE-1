import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRsvpForm, newRsvpFormQuestion, isChoiceQuestion, RsvpFormQuestion, RsvpQuestionType, RsvpFormStatus } from '@/hooks/useRsvpForm';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, Save, Loader2, X,
} from 'lucide-react';

const QUESTION_TYPE_LABELS: Record<RsvpQuestionType, string> = {
  short_text: 'Short answer',
  paragraph: 'Paragraph',
  multiple_choice: 'Multiple choice (single answer)',
  checkboxes: 'Checkboxes (multiple answers)',
  dropdown: 'Dropdown',
  number: 'Number',
  date: 'Date',
};

export default function AdminRsvpFormPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { form, loading: formLoading } = useRsvpForm(eventId);

  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventLoading, setEventLoading] = useState(true);
  const [questions, setQuestions] = useState<RsvpFormQuestion[]>([]);
  const [status, setStatus] = useState<RsvpFormStatus>('published');
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    supabase.from('events').select('title').eq('id', eventId).maybeSingle().then(({ data }) => {
      setEventTitle(data?.title || '');
      setEventLoading(false);
    });
  }, [eventId]);

  useEffect(() => {
    if (!formLoading && !initialized) {
      setQuestions(form?.questions || []);
      setStatus(form?.status || 'published');
      setInitialized(true);
    }
  }, [formLoading, initialized, form]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const addQuestion = () => setQuestions((q) => [...q, newRsvpFormQuestion()]);

  const removeQuestion = (id: string) => setQuestions((q) => q.filter((item) => item.id !== id));

  const updateQuestion = (id: string, patch: Partial<RsvpFormQuestion>) => {
    setQuestions((q) => q.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, ...patch };
      if (patch.type) {
        next.options = isChoiceQuestion(patch.type) ? (item.options?.length ? item.options : ['Option 1']) : undefined;
      }
      return next;
    }));
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[idx], next[j]] = [next[j], next[idx]];
    setQuestions(next);
  };

  const updateOption = (questionId: string, optIdx: number, value: string) => {
    setQuestions((q) => q.map((item) => (
      item.id === questionId
        ? { ...item, options: (item.options || []).map((o, i) => (i === optIdx ? value : o)) }
        : item
    )));
  };

  const addOption = (questionId: string) => {
    setQuestions((q) => q.map((item) => (
      item.id === questionId ? { ...item, options: [...(item.options || []), `Option ${(item.options?.length || 0) + 1}`] } : item
    )));
  };

  const removeOption = (questionId: string, optIdx: number) => {
    setQuestions((q) => q.map((item) => (
      item.id === questionId ? { ...item, options: (item.options || []).filter((_, i) => i !== optIdx) } : item
    )));
  };

  const save = async () => {
    if (!eventId) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('rsvp_forms').upsert(
      {
        event_id: eventId,
        questions: questions as unknown as never,
        status,
        created_by: userData.user?.id,
      },
      { onConflict: 'event_id' },
    );
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'RSVP form saved' });
  };

  const removeForm = async () => {
    if (!eventId || !form) return;
    if (!window.confirm('Remove this RSVP form? The event will go back to the plain one-click RSVP.')) return;
    setDeleting(true);
    const { error } = await supabase.from('rsvp_forms').delete().eq('event_id', eventId);
    setDeleting(false);
    if (error) {
      toast({ title: 'Could not remove form', description: error.message, variant: 'destructive' });
      return;
    }
    setQuestions([]);
    toast({ title: 'RSVP form removed' });
  };

  const loading = formLoading || eventLoading;

  return (
    <AdminLayout>
      <div className="fade-in max-w-3xl">
        <Link to="/admin/events" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />Back to Events
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">RSVP Form</h1>
            <p className="text-muted-foreground mt-1">
              {eventLoading ? 'Loading event…' : eventTitle || 'Event not found'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="admin-card mb-6 flex items-center justify-between">
              <div>
                <Label>Published</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  When off, this form is saved as a draft — members still get the plain one-click RSVP until you publish.
                </p>
              </div>
              <Switch checked={status === 'published'} onCheckedChange={(v) => setStatus(v ? 'published' : 'draft')} />
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="admin-card">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1 pt-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveQuestion(idx, -1)}>
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === questions.length - 1} onClick={() => moveQuestion(idx, 1)}>
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="flex-1 grid gap-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label>Question</Label>
                          <Input
                            value={q.label}
                            onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                            placeholder="e.g. How many guests are you bringing?"
                          />
                        </div>
                        <div>
                          <Label>Answer type</Label>
                          <Select value={q.type} onValueChange={(v) => updateQuestion(q.id, { type: v as RsvpQuestionType })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(Object.keys(QUESTION_TYPE_LABELS) as RsvpQuestionType[]).map((t) => (
                                <SelectItem key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {isChoiceQuestion(q.type) && (
                        <div className="space-y-2">
                          <Label>Options</Label>
                          {(q.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <Input
                                value={opt}
                                onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                className="max-w-sm"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                disabled={(q.options?.length || 0) <= 1}
                                onClick={() => removeOption(q.id, optIdx)}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addOption(q.id)} className="gap-1">
                            <Plus className="w-3.5 h-3.5" /> Add option
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Switch checked={q.required} onCheckedChange={(v) => updateQuestion(q.id, { required: v })} />
                        <Label className="font-normal">Required</Label>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {questions.length === 0 && (
              <div className="admin-card text-center py-12">
                <p className="text-muted-foreground">No questions yet. Add one to build the RSVP form.</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={addQuestion} className="gap-2">
                <Plus className="w-4 h-4" /> Add Question
              </Button>
              <div className="flex gap-2">
                {form && (
                  <Button variant="ghost" onClick={removeForm} disabled={deleting} className="text-destructive hover:text-destructive gap-2">
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Remove Form
                  </Button>
                )}
                <Button onClick={save} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Form
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
