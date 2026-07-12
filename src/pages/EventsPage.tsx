import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Calendar, CheckCircle2, ExternalLink, LogIn } from 'lucide-react';
import { classifyEvent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRsvps } from '@/hooks/useRsvps';
import eventBhikshuBhakti from '@/assets/event-bhikshu-bhakti.jpeg';

type EventType = 'upcoming' | 'ongoing' | 'past';

export default function EventsPage() {
  const { type } = useParams<{ type?: string }>();
  const { events } = useSiteContent();
  const navigate = useNavigate();
  const { rsvpIds, loading: rsvpLoading, toggleRsvp, isAuthenticated } = useRsvps();

  const eventType: EventType = (type as EventType) || 'upcoming';

  const filteredEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => classifyEvent(event, today) === eventType);
  }, [events, eventType]);

  const pageTitle = {
    upcoming: 'UPCOMING EVENTS',
    ongoing: 'ONGOING EVENTS',
    past: 'PAST EVENTS',
  }[eventType];

  const handleRsvp = async (eventId: string, eventTitle: string) => {
    if (!isAuthenticated) {
      navigate(`/auth?tab=signin&redirect=/events/upcoming`);
      return;
    }
    const ok = await toggleRsvp(eventId, eventTitle);
    if (ok) {
      if (rsvpIds.has(eventId)) {
        toast.success('RSVP cancelled.');
      } else {
        toast.success(`You're registered for ${eventTitle}!`);
      }
    } else {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <PublicLayout>
      {/* Page Header */}
      <section className="bg-primary py-8">
        <div className="container-custom">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            {pageTitle}
          </h1>
        </div>
      </section>

      {/* Events Navigation */}
      <section className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex gap-4 flex-wrap">
            <Link to="/events/upcoming">
              <Button variant={eventType === 'upcoming' ? 'default' : 'outline'} size="sm">
                Upcoming
              </Button>
            </Link>
            <Link to="/events/ongoing">
              <Button variant={eventType === 'ongoing' ? 'default' : 'outline'} size="sm">
                Ongoing
              </Button>
            </Link>
            <Link to="/events/past">
              <Button variant={eventType === 'past' ? 'default' : 'outline'} size="sm">
                Past Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sign-in prompt banner for upcoming events */}
      {eventType === 'upcoming' && !isAuthenticated && (
        <div className="bg-secondary/10 border-b border-secondary/20">
          <div className="container-custom py-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-secondary font-medium">
              Sign in to RSVP for events and track your registrations.
            </p>
            <Link to="/auth?tab=signin&redirect=/events/upcoming">
              <Button size="sm" variant="secondary" className="gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <section className="py-12 bg-section">
        <div className="container-custom">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No {eventType} events at this time.</p>
            </div>
          ) : (
            <div className="flyer-grid">
              {filteredEvents.map((event) => {
                const imageUrl = event.imageUrl === 'event-bhikshu-bhakti'
                  ? eventBhikshuBhakti
                  : event.imageUrl;
                const hasRsvp = rsvpIds.has(event.id);

                return (
                  <div key={event.id} className="event-card">
                    <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                      {event.videoUrl ? (
                        <video
                          src={event.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {/* RSVP'd badge overlay */}
                      {hasRsvp && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-secondary text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                          <CheckCircle2 className="w-3.5 h-3.5" /> RSVPed
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-serif text-xl font-bold text-secondary mb-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {/* In-app RSVP (upcoming events only) */}
                        {event.type === 'upcoming' && (
                          <Button
                            size="sm"
                            variant={hasRsvp ? 'secondary' : 'default'}
                            disabled={rsvpLoading}
                            onClick={() => handleRsvp(event.id, event.title)}
                            className="gap-2"
                          >
                            {hasRsvp ? (
                              <><CheckCircle2 className="w-4 h-4" /> RSVPed — Cancel</>
                            ) : isAuthenticated ? (
                              'RSVP'
                            ) : (
                              <><LogIn className="w-4 h-4" /> Sign In to RSVP</>
                            )}
                          </Button>
                        )}

                        {/* External registration link (separate from RSVP) */}
                        {event.registrationLink && (
                          <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              Register <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
