import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useEvents, eventToRow, eventFromRow } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, Image, Calendar, Bell, Zap, X, Loader2, ClipboardList } from 'lucide-react';
import { classifyEvent } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Event, EventMediaItem } from '@/data/siteContent';
import eventBhikshuBhakti from '@/assets/event-bhikshu-bhakti.jpeg';

const MAX_MEDIA_ITEMS = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

const legacyImageMap: Record<string, string> = {
  'event-bhikshu-bhakti': eventBhikshuBhakti,
};

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Past events can't be dated after today; upcoming events can't be dated today or earlier
// (today would classify as "ongoing"). Ongoing events have no restriction.
function dateBoundsFor(type: 'upcoming' | 'ongoing' | 'past', today: Date): { min?: string; max?: string } {
  if (type === 'past') return { max: toIsoDate(today) };
  if (type === 'upcoming') return { min: toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)) };
  return {};
}

async function uploadEventImage(file: File): Promise<string> {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : (file.type.split('/')[1] || 'bin');
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('event-images').upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('event-images').getPublicUrl(path);
  return data.publicUrl;
}

function EventThumbnailUpload({
  imageUrl, title, onChange,
}: { imageUrl: string; title: string; onChange: (url: string) => void }) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const hasImage = Boolean(imageUrl) && imageUrl !== '/placeholder.svg';
  const displaySrc = legacyImageMap[imageUrl] || imageUrl;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Unsupported file', description: `${file.name} is not an image.`, variant: 'destructive' });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast({
        title: 'File too large',
        description: `Images must be under ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`,
        variant: 'destructive',
      });
      return;
    }
    setUploading(true);
    try {
      onChange(await uploadEventImage(file));
    } catch (err) {
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative w-32 sm:w-40 aspect-[3/4] rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border hover:border-primary transition-colors block"
      >
        {uploading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasImage ? (
          <>
            <img src={displaySrc} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
              <Image className="w-7 h-7 text-white" />
              <span className="text-xs font-medium text-white">Change photo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground group-hover:text-primary transition-colors">
            <Image className="w-10 h-10" />
            <span className="text-xs font-medium px-2 text-center">Upload thumbnail</span>
          </div>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
      <p className="text-xs text-muted-foreground mt-2 w-32 sm:w-40 text-center leading-snug">
        Shown first (5s), then the gallery rotates
      </p>
    </div>
  );
}

function EventMediaGallery({
  media, onChange,
}: { media: EventMediaItem[]; onChange: (media: EventMediaItem[]) => void }) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const remaining = MAX_MEDIA_ITEMS - media.length;

  const handleFiles = async (files: FileList) => {
    const picked = Array.from(files);
    if (picked.length > remaining) {
      toast({
        title: 'Too many files',
        description: `Only ${remaining} more item(s) can be added (max ${MAX_MEDIA_ITEMS} total).`,
        variant: 'destructive',
      });
    }
    setUploading(true);
    const toAdd: EventMediaItem[] = [];
    for (const file of picked.slice(0, remaining)) {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) {
        toast({ title: 'Unsupported file', description: `${file.name} is not an image or video.`, variant: 'destructive' });
        continue;
      }
      const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (file.size > maxBytes) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the ${maxBytes / (1024 * 1024)}MB limit for ${isVideo ? 'videos' : 'photos'}.`,
          variant: 'destructive',
        });
        continue;
      }
      try {
        const url = await uploadEventImage(file);
        toAdd.push({ url, type: isVideo ? 'video' : 'image' });
      } catch (err) {
        toast({ title: 'Upload failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
      }
    }
    setUploading(false);
    if (toAdd.length) onChange([...media, ...toAdd]);
  };

  return (
    <div className="space-y-2">
      <Label>Additional Gallery Photos & Videos <span className="text-muted-foreground font-normal">(up to {MAX_MEDIA_ITEMS} — auto-scroll after the thumbnail)</span></Label>
      <div className="flex flex-wrap gap-2">
        {media.map((item, i) => (
          <div key={i} className="relative w-20 h-20 rounded border overflow-hidden bg-muted">
            {item.type === 'video' ? (
              <video src={item.url} className="w-full h-full object-cover" muted />
            ) : (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange(media.filter((_, idx) => idx !== i))}
              className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {media.length < MAX_MEDIA_ITEMS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted text-xs gap-1"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {uploading ? 'Uploading' : 'Add'}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <p className="text-xs text-muted-foreground">
        {media.length}/{MAX_MEDIA_ITEMS} items · Photos up to 5MB, videos up to 15MB.
      </p>
    </div>
  );
}

export default function AdminEventsPage() {
  const { isAuthenticated } = useAuth();
  const { popupConfig, setPopupConfig } = useSiteContent();
  const { events, loading: eventsLoading } = useEvents();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
  const [formsByEvent, setFormsByEvent] = useState<Map<string, { count: number; status: string }>>(new Map());
  const initializedRef = useRef(false);
  const today = new Date();

  useEffect(() => {
    supabase.from('rsvp_forms').select('event_id, questions, status').then(({ data }) => {
      if (!data) return;
      setFormsByEvent(new Map(data.map((r) => [
        r.event_id,
        { count: Array.isArray(r.questions) ? r.questions.length : 0, status: r.status },
      ])));
    });
  }, []);

  // Seed local edit buffer from the loaded table exactly once — after that, this page
  // owns its own state via per-row insert/update/delete, so it should never be clobbered
  // by a background refetch while an admin has unsaved edits in a card.
  useEffect(() => {
    if (!eventsLoading && !initializedRef.current) {
      setLocalEvents(events);
      initializedRef.current = true;
    }
  }, [eventsLoading, events]);

  const upcomingEvents = localEvents.filter(e => classifyEvent(e, today) === 'upcoming');

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const filteredEvents = filter === 'all'
    ? localEvents
    : localEvents.filter(e => classifyEvent(e, today) === filter);

  const markDirty = (id: string) => setDirtyIds(prev => new Set(prev).add(id));
  const clearDirty = (id: string) => setDirtyIds(prev => { const n = new Set(prev); n.delete(id); return n; });

  const addEvent = async () => {
    setAdding(true);
    const { data, error } = await supabase
      .from('events')
      .insert(eventToRow({
        title: 'New Event',
        date: 'TBD',
        description: 'Event description...',
        imageUrl: '/placeholder.svg',
        type: filter === 'all' ? 'upcoming' : filter,
      }))
      .select()
      .single();
    setAdding(false);
    if (error || !data) {
      toast({ title: 'Could not add event', description: error?.message, variant: 'destructive' });
      return;
    }
    setLocalEvents(prev => [...prev, eventFromRow(data)]);
  };

  const removeEvent = async (id: string) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setDeletingIds(prev => new Set(prev).add(id));
    const { error } = await supabase.from('events').delete().eq('id', id);
    setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (error) {
      toast({ title: 'Could not delete event', description: error.message, variant: 'destructive' });
      return;
    }
    setLocalEvents(prev => prev.filter(e => e.id !== id));
    clearDirty(id);
  };

  const updateEvent = (id: string, field: keyof Event, value: string) => {
    setLocalEvents(prev => prev.map(e => (e.id === id ? { ...e, [field]: value } : e)));
    markDirty(id);
  };

  const updateEventMedia = (id: string, media: EventMediaItem[]) => {
    setLocalEvents(prev => prev.map(e => (e.id === id ? { ...e, media } : e)));
    markDirty(id);
  };

  // An event's RSVP method is either the plain link or a custom form, never both — the
  // database enforces this too (rsvp_forms insert clears rsvp_link), so this is just the
  // friendly, explicit version of that with a heads-up before anything gets cleared.
  const openRsvpForm = async (event: Event, hasForm: boolean) => {
    if (!hasForm && event.rsvpLink) {
      const ok = window.confirm(
        `"${event.title}" currently uses an external RSVP Link. Building a custom RSVP form will remove that link — an event can only use one RSVP method at a time. Continue?`,
      );
      if (!ok) return;
      const { error } = await supabase.from('events').update({ rsvp_link: null }).eq('id', event.id);
      if (error) {
        toast({ title: 'Could not clear RSVP Link', description: error.message, variant: 'destructive' });
        return;
      }
      setLocalEvents(prev => prev.map(e => (e.id === event.id ? { ...e, rsvpLink: undefined } : e)));
    }
    navigate(`/admin/events/${event.id}/rsvp-form`);
  };

  const saveEvent = async (id: string) => {
    const event = localEvents.find(e => e.id === id);
    if (!event) return;
    setSavingIds(prev => new Set(prev).add(id));
    const { error } = await supabase.from('events').update(eventToRow(event)).eq('id', id);
    setSavingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    clearDirty(id);
    toast({ title: 'Event saved' });
  };

  return (
    <AdminLayout>
      <div className="fade-in max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage upcoming, ongoing, and past events with flyers
            </p>
          </div>
          <Button onClick={addEvent} disabled={adding}>
            {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Event
          </Button>
        </div>

        {/* Homepage Popup Config */}
        <div className="admin-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Homepage Event Popup</h2>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show popup on homepage</Label>
                <p className="text-xs text-muted-foreground mt-1">Toggle the featured event popup that greets visitors.</p>
              </div>
              <Switch
                checked={popupConfig.enabled}
                onCheckedChange={(v) => setPopupConfig({ ...popupConfig, enabled: v })}
              />
            </div>

            {popupConfig.enabled && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Which event to feature</Label>
                  <Select
                    value={popupConfig.mode}
                    onValueChange={(v) => setPopupConfig({ ...popupConfig, mode: v as 'auto' | 'specific' })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto — happening today, else soonest upcoming, else most recent</SelectItem>
                      <SelectItem value="specific">Pick a specific upcoming event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {popupConfig.mode === 'specific' && (
                  <div>
                    <Label>Upcoming event</Label>
                    <Select
                      value={popupConfig.eventId || ''}
                      onValueChange={(v) => setPopupConfig({ ...popupConfig, eventId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event…" />
                      </SelectTrigger>
                      <SelectContent>
                        {upcomingEvents.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">No upcoming events</div>
                        )}
                        {upcomingEvents.map(ev => (
                          <SelectItem key={ev.id} value={ev.id}>
                            {ev.title} — {ev.date}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Tip: Auto mode only considers events with a Start Date set below — it ignores the
              free-text Display Date. Set Start Date (and End Date for multi-day events) on every
              event you want eligible for auto-selection.
            </p>
          </div>
        </div>

        {/* Filter */}

        <div className="admin-card mb-6">
          <div className="flex items-center gap-4">
            <Label>Filter by type:</Label>
            <div className="flex gap-2">
              {['all', 'upcoming', 'ongoing', 'past'].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(type as typeof filter)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Events List */}
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const isDirty = dirtyIds.has(event.id);
              const isSaving = savingIds.has(event.id);
              const isDeleting = deletingIds.has(event.id);
              const hasForm = formsByEvent.has(event.id);
              return (
                <div key={event.id} className="admin-card">
                  <div className="flex items-start gap-6">
                    <EventThumbnailUpload
                      imageUrl={event.imageUrl}
                      title={event.title}
                      onChange={(url) => updateEvent(event.id, 'imageUrl', url)}
                    />

                    {/* Form Fields */}
                    <div className="flex-1 grid gap-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Event Title</Label>
                          <Input
                            value={event.title}
                            onChange={(e) => updateEvent(event.id, 'title', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Display Date <span className="text-muted-foreground font-normal">(shown publicly)</span></Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={event.date}
                              onChange={(e) => updateEvent(event.id, 'date', e.target.value)}
                              className="pl-10"
                              placeholder="e.g. September 20th, 2026 or Daily"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Auto-classification date range */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>
                            Start Date <span className="text-muted-foreground font-normal">(for auto-classification)</span>
                          </Label>
                          <Input
                            type="date"
                            value={event.startDate || ''}
                            onChange={(e) => updateEvent(event.id, 'startDate', e.target.value)}
                            {...dateBoundsFor(classifyEvent(event, today), today)}
                          />
                        </div>
                        <div>
                          <Label>
                            End Date <span className="text-muted-foreground font-normal">(optional — for multi-day events)</span>
                          </Label>
                          <Input
                            type="date"
                            value={event.endDate || ''}
                            onChange={(e) => updateEvent(event.id, 'endDate', e.target.value)}
                            {...dateBoundsFor(classifyEvent(event, today), today)}
                          />
                        </div>
                      </div>

                      {/* Type: auto-computed when dates set, manual otherwise */}
                      <div className="max-w-xs">
                        <Label>
                          Type{' '}
                          {event.startDate ? (
                            <span className="inline-flex items-center gap-1 text-xs font-normal text-secondary ml-1">
                              <Zap className="w-3 h-3" />
                              Auto-computed from dates
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-normal text-xs ml-1">(manual — set dates above to auto-classify)</span>
                          )}
                        </Label>
                        {event.startDate ? (
                          <div className={`h-10 px-3 flex items-center rounded-md border text-sm font-medium ${
                            classifyEvent(event) === 'upcoming' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            classifyEvent(event) === 'ongoing'  ? 'bg-green-50 border-green-200 text-green-700' :
                                                                  'bg-muted border-border text-muted-foreground'
                          }`}>
                            {classifyEvent(event).charAt(0).toUpperCase() + classifyEvent(event).slice(1)}
                          </div>
                        ) : (
                          <Select
                            value={event.type}
                            onValueChange={(value) => updateEvent(event.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="ongoing">Ongoing</SelectItem>
                              <SelectItem value="past">Past</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={event.description}
                          onChange={(e) => updateEvent(event.id, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>

                      <EventMediaGallery
                        media={event.media || []}
                        onChange={(media) => updateEventMedia(event.id, media)}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>
                            RSVP Link (optional)
                            {hasForm && (
                              <span className="text-muted-foreground font-normal"> — disabled while a custom RSVP form is active</span>
                            )}
                          </Label>
                          <Input
                            value={event.rsvpLink || ''}
                            onChange={(e) => updateEvent(event.id, 'rsvpLink', e.target.value)}
                            placeholder="https://..."
                            disabled={hasForm}
                          />
                          {hasForm && (
                            <p className="text-xs text-muted-foreground mt-1">
                              An event can only use one RSVP method. Remove the RSVP form below to use a link instead.
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>View Photos Link (optional)</Label>
                          <Input
                            value={event.photosLink || ''}
                            onChange={(e) => updateEvent(event.id, 'photosLink', e.target.value)}
                            placeholder="Google Photos album URL"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openRsvpForm(event, hasForm)}
                        >
                          <ClipboardList className="w-4 h-4" />
                          {hasForm
                            ? `RSVP Form · ${formsByEvent.get(event.id)!.count} question${formsByEvent.get(event.id)!.count === 1 ? '' : 's'}${formsByEvent.get(event.id)!.status === 'draft' ? ' (draft)' : ''}`
                            : 'Add RSVP Form'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveEvent(event.id)}
                          disabled={!isDirty || isSaving}
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          {isDirty ? 'Save Changes' : 'Saved'}
                        </Button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEvent(event.id)}
                      disabled={isDeleting}
                      className="text-destructive hover:text-destructive"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!eventsLoading && filteredEvents.length === 0 && (
          <div className="admin-card text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events found. Click "Add Event" to create one.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
