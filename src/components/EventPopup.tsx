import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useRsvps } from '@/hooks/useRsvps';
import { useRsvpFormIndex } from '@/hooks/useRsvpFormIndex';
import { toast } from 'sonner';
import { pickFeaturedEvent, classifyEvent } from '@/lib/utils';
import eventAwakening from '@/assets/event-bhikshu-bhakti.jpeg';

const imageMap: Record<string, string> = {
  'event-bhikshu-bhakti': eventAwakening,
};

const POPUP_STORAGE_KEY = 'jvbna_popup_dismissed_id';

const badgeCopy: Record<'today' | 'upcoming' | 'past', string> = {
  today: 'Happening Today',
  upcoming: 'Upcoming Event',
  past: 'Recently Held',
};

export default function EventPopup() {
  const navigate = useNavigate();
  const { popupConfig, contentLoaded } = useSiteContent();
  const { events, loading: eventsLoading } = useEvents();
  const { user, isAuthenticated } = useAuth();
  const { rsvp } = useRsvps();
  const { formIndex } = useRsvpFormIndex();
  const [isOpen, setIsOpen] = useState(false);

  // Pick featured event based on admin config. Wait for popupConfig (from site_settings)
  // and events (from the events table) to both finish loading before picking — otherwise
  // this can briefly (or, if a fetch errors, permanently) feature the wrong event.
  const eventsReady = contentLoaded && !eventsLoading;
  let featuredEvent = undefined as typeof events[number] | undefined;
  let featuredStatus: 'today' | 'upcoming' | 'past' = 'upcoming';
  if (eventsReady && popupConfig.enabled) {
    if (popupConfig.mode === 'specific' && popupConfig.eventId) {
      featuredEvent = events.find(e => e.id === popupConfig.eventId);
      if (featuredEvent) {
        const classified = classifyEvent(featuredEvent);
        featuredStatus = classified === 'ongoing' ? 'today' : classified;
      }
    }
    if (!featuredEvent) {
      // Auto: whatever is happening today, else soonest upcoming, else most recently held
      const picked = pickFeaturedEvent(events);
      featuredEvent = picked?.event;
      if (picked) featuredStatus = picked.status;
    }
  }

  useEffect(() => {
    if (!eventsReady || !featuredEvent) return;
    const dismissedId = sessionStorage.getItem(POPUP_STORAGE_KEY);
    // Show if never dismissed, or dismissed for a *different* event (admin switched it)
    if (dismissedId !== featuredEvent.id) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [eventsReady, featuredEvent]);

  const handleClose = () => {
    setIsOpen(false);
    if (featuredEvent) sessionStorage.setItem(POPUP_STORAGE_KEY, featuredEvent.id);
  };


  const handleRSVP = async () => {
    const hasForm = formIndex.has(featuredEvent!.id);

    if (!isAuthenticated || !user) {
      if (hasForm) {
        navigate(`/auth?tab=signin&redirect=${encodeURIComponent(`/events/${featuredEvent!.id}/rsvp`)}`);
      } else {
        sessionStorage.setItem('jvbna_pending_rsvp', featuredEvent!.id);
        navigate('/auth?tab=signin&redirect=%2F');
      }
      return;
    }

    if (hasForm) {
      navigate(`/events/${featuredEvent!.id}/rsvp`);
      handleClose();
      return;
    }

    const { ok, alreadyRsvped } = await rsvp(featuredEvent!.id, featuredEvent!.title);
    if (ok) {
      toast.success(`RSVP confirmed for ${featuredEvent!.title}!`);
      if (featuredEvent!.rsvpLink) {
        window.open(featuredEvent!.rsvpLink, '_blank', 'noopener,noreferrer');
      }
    } else if (alreadyRsvped) {
      toast.info('You have already RSVP\'d to this event');
    } else {
      toast.error('Could not record RSVP. Please try again.');
    }
    handleClose();
  };

  // Handle ?rsvp= return from login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rsvpId = params.get('rsvp') || sessionStorage.getItem('jvbna_pending_rsvp');
    if (rsvpId && isAuthenticated && user) {
      const event = events.find(e => e.id === rsvpId);
      if (event) {
        rsvp(event.id, event.title).then(({ ok, alreadyRsvped }) => {
          if (ok) {
            toast.success(`RSVP confirmed for ${event.title}!`);
            if (event.rsvpLink) window.open(event.rsvpLink, '_blank', 'noopener,noreferrer');
          } else if (alreadyRsvped) {
            toast.info('You have already RSVP\'d to this event');
          }
        });
        sessionStorage.removeItem('jvbna_pending_rsvp');
        if (params.get('rsvp')) window.history.replaceState({}, '', '/');
      }
    }
  }, [isAuthenticated, user, events]);

  if (!isOpen || !featuredEvent) return null;

  const imageUrl = imageMap[featuredEvent.imageUrl] || featuredEvent.imageUrl;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-105"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Event Image — thumbnail only (no video/gallery). object-contain so flyer text
              near the image edges (e.g. the Bhikshu Bhakti flyer, 570x340) isn't cropped
              off by a square box the way object-cover would. */}
          <div className="aspect-square md:aspect-auto bg-muted overflow-hidden">
            <img
              src={imageUrl}
              alt={featuredEvent.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Event Details */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {badgeCopy[featuredStatus]}
            </div>

            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              {featuredEvent.title}
            </h2>

            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Calendar className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">{featuredEvent.date}</span>
            </div>

            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {featuredEvent.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRSVP}
                size="lg"
                className="flex-1 font-semibold"
              >
                RSVP Now
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                size="lg"
              >
                Maybe Later
              </Button>
            </div>

            {featuredEvent.photosLink && (
              <a
                href={featuredEvent.photosLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-3"
              >
                <Button variant="outline" size="lg" className="w-full gap-2">
                  View Photos <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}

            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground mt-4 text-center">
                You'll be asked to sign in to confirm your RSVP
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
