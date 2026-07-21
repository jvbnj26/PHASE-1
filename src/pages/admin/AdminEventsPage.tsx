import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
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
import { Plus, Trash2, Save, Image, Calendar, Bell, Zap, X } from 'lucide-react';
import { classifyEvent } from '@/lib/utils';
import { ImageUploadButton } from '@/components/admin/ImageUploadButton';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Event, EventMediaItem } from '@/data/siteContent';

const MAX_MEDIA_ITEMS = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function EventMediaGallery({
  media, onChange,
}: { media: EventMediaItem[]; onChange: (media: EventMediaItem[]) => void }) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
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
      const url = await readAsDataUrl(file);
      toAdd.push({ url, type: isVideo ? 'video' : 'image' });
    }
    if (toAdd.length) onChange([...media, ...toAdd]);
  };

  return (
    <div className="space-y-2">
      <Label>Event Photos & Videos <span className="text-muted-foreground font-normal">(up to {MAX_MEDIA_ITEMS} — shown as an auto-scrolling gallery)</span></Label>
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
            className="w-20 h-20 rounded border border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-muted text-xs gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
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
  const { events, setEvents, popupConfig, setPopupConfig } = useSiteContent();
  const { toast } = useToast();

  const [localEvents, setLocalEvents] = useState<Event[]>(events);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');
  const today = new Date();
  const upcomingEvents = localEvents.filter(e => classifyEvent(e, today) === 'upcoming');


  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const filteredEvents = filter === 'all'
    ? localEvents
    : localEvents.filter(e => classifyEvent(e, today) === filter);

  const handleSave = () => {
    setEvents(localEvents);
    toast({
      title: "Events Updated",
      description: "All events have been saved successfully.",
    });
  };

  const addEvent = () => {
    const newEvent: Event = {
      id: String(Date.now()),
      title: 'New Event',
      date: 'TBD',
      description: 'Event description...',
      imageUrl: '/placeholder.svg',
      type: 'upcoming',
    };
    setLocalEvents([...localEvents, newEvent]);
  };

  const removeEvent = (id: string) => {
    setLocalEvents(localEvents.filter(e => e.id !== id));
  };

  const updateEvent = (id: string, field: keyof Event, value: string) => {
    setLocalEvents(localEvents.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const updateEventMedia = (id: string, media: EventMediaItem[]) => {
    setLocalEvents(localEvents.map(e => (e.id === id ? { ...e, media } : e)));
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
          <Button onClick={addEvent}>
            <Plus className="w-4 h-4 mr-2" />
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
                      <SelectItem value="auto">Auto — soonest upcoming by date</SelectItem>
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
              Tip: For accurate auto-sorting, use parseable dates like "Jan 25, 2026" or "2026-01-25".
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
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="admin-card">
              <div className="flex items-start gap-6">
                {/* Thumbnail */}
                <div className="w-32 h-40 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

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
                      />
                    </div>
                  </div>

                  {/* Type: auto-computed when dates set, manual otherwise */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
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
                      <Label>Flyer Image</Label>
                      <div className="flex gap-2">
                        <Input
                          value={event.imageUrl}
                          onChange={(e) => updateEvent(event.id, 'imageUrl', e.target.value)}
                          placeholder="Image URL or upload"
                        />
                        <ImageUploadButton
                          iconOnly
                          label="Upload flyer image"
                          onUploaded={(url) => updateEvent(event.id, 'imageUrl', url)}
                        />
                      </div>

                      {event.imageUrl && (
                        <img src={event.imageUrl} alt="" className="mt-2 h-20 rounded border object-cover" />
                      )}
                    </div>
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
                      <Label>RSVP Link (optional)</Label>
                      <Input
                        value={event.rsvpLink || ''}
                        onChange={(e) => updateEvent(event.id, 'rsvpLink', e.target.value)}
                        placeholder="https://..."
                      />
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
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEvent(event.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="admin-card text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No events found. Click "Add Event" to create one.</p>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save All Events
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
