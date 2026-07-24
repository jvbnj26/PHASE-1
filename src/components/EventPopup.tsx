import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import eventAwakening from '@/assets/event-bhikshu-bhakti.jpeg';

const imageMap: Record<string, string> = {
  'event-bhikshu-bhakti': eventAwakening,
};

const POPUP_STORAGE_KEY = 'jvbna_popup_dismissed_id';

export default function EventPopup() {
  const navigate = useNavigate();
  const { events, popupConfig } = useSiteContent();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Pick featured event based on admin config
  const upcoming = events.filter(e => e.type === 'upcoming');
  let featuredEvent = undefined as typeof events[number] | undefined;
  if (popupConfig.enabled && upcoming.length > 0) {
    if (popupConfig.mode === 'specific' && popupConfig.eventId) {
      featuredEvent = upcoming.find(e => e.id === popupConfig.eventId);
    }
    if (!featuredEvent) {
      // Auto: most recent upcoming by parseable date; fall back to first
      const withDates = upcoming
        .map(e => ({ e, t: Date.parse(e.date) }))
        .filter(x => !isNaN(x.t))
        .sort((a, b) => a.t - b.t);
      featuredEvent = withDates[0]?.e ?? upcoming[0];
    }
  }

  useEffect(() => {
    if (!featuredEvent) return;
    const dismissedId = sessionStorage.getItem(POPUP_STORAGE_KEY);
    // Show if never dismissed, or dismissed for a *different* event (admin switched it)
    if (dismissedId !== featuredEvent.id) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [featuredEvent]);

  const handleClose = () => {
    setIsOpen(false);
    if (featuredEvent) sessionStorage.setItem(POPUP_STORAGE_KEY, featuredEvent.id);
  };


  const handleRSVP = async () => {
    if (!isAuthenticated || !user) {
      sessionStorage.setItem('jvbna_pending_rsvp', featuredEvent!.id);
      navigate('/auth?tab=signin&redirect=%2F');
      return;
    }

    // User is logged in - record RSVP
    const { error } = await supabase.from('rsvps').insert({
      user_id: user.id,
      event_id: featuredEvent!.id,
      event_title: featuredEvent!.title,
    });

    if (error) {
      if (error.code === '23505') {
        toast.info('You have already RSVP\'d to this event');
      } else {
        toast.error('Could not record RSVP: ' + error.message);
      }
    } else {
      toast.success(`RSVP confirmed for ${featuredEvent!.title}!`);
      if (featuredEvent!.rsvpLink) {
        window.open(featuredEvent!.rsvpLink, '_blank', 'noopener,noreferrer');
      }
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
        supabase.from('rsvps').insert({
          user_id: user.id,
          event_id: event.id,
          event_title: event.title,
        }).then(({ error }) => {
          if (!error) {
            toast.success(`RSVP confirmed for ${event.title}!`);
            if (event.rsvpLink) window.open(event.rsvpLink, '_blank', 'noopener,noreferrer');
          } else if (error.code === '23505') {
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
          {/* Event Image — object-contain so flyer text near the image edges (e.g. the
              Bhikshu Bhakti flyer, 570x340) isn't cropped off by a square box the way
              object-cover would. */}
          <div className="aspect-square md:aspect-auto bg-muted overflow-hidden">
            {featuredEvent.videoUrl ? (
              <video
                src={featuredEvent.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={imageUrl}
                alt={featuredEvent.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Event Details */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Upcoming Event
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
