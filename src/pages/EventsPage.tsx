import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Calendar, CheckCircle2, ExternalLink, LogIn } from 'lucide-react';
import { classifyEvent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRsvps } from '@/hooks/useRsvps';
import { useRecentPosts } from '@/hooks/usePosts';
import eventBhikshuBhakti from '@/assets/event-bhikshu-bhakti.jpeg';
import EventMediaCarousel, { eventMediaFor } from '@/components/EventMediaCarousel';
import RecentPostsTicker from '@/components/RecentPostsTicker';

type EventType = 'upcoming' | 'ongoing' | 'past';

export default function EventsPage() {
  const { type } = useParams<{ type?: string }>();
  const { events } = useSiteContent();
  const navigate = useNavigate();
  const { rsvpIds, loading: rsvpLoading, toggleRsvp, isAuthenticated } = useRsvps();
  const { posts: recentPosts, loading: recentPostsLoading } = useRecentPosts(12);

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

  const handleRsvp = async (eventId: string, eventTitle: string, rsvpLink?: string) => {
    if (!isAuthenticated) {
      navigate(`/auth?tab=signin&redirect=/events/upcoming`);
      return;
    }
    const wasRsvped = rsvpIds.has(eventId);
    const ok = await toggleRsvp(eventId, eventTitle);
    if (ok) {
      if (wasRsvped) {
        toast.success('RSVP cancelled.');
      } else {
        toast.success(`You're registered for ${eventTitle}!`);
        if (rsvpLink) window.open(rsvpLink, '_blank', 'noopener,noreferrer');
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

      {/* Recent Posts ticker */}
      <RecentPostsTicker posts={recentPosts} loading={recentPostsLoading} />

      {/* Events Navigation */}
      <section className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="inline-flex flex-wrap gap-1 bg-muted rounded-full p-1">
            {([
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'ongoing', label: 'Ongoing' },
              { key: 'past', label: 'Past Events' },
            ] as const).map(({ key, label }) => (
              <Link key={key} to={`/events/${key}`}>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    eventType === key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/70'
                  }`}
                >
                  {label}
                </span>
              </Link>
            ))}
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
                const media = eventMediaFor({ ...event, imageUrl });
                const hasRsvp = rsvpIds.has(event.id);

                return (
                  <div
                    key={event.id}
                    className="event-card w-full sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]"
                  >
                    <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                      <EventMediaCarousel media={media} alt={event.title} />
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
                            onClick={() => handleRsvp(event.id, event.title, event.rsvpLink)}
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

                        {/* External photos link (Google Photos album, etc.) */}
                        {event.photosLink && (
                          <a href={event.photosLink} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              View Photos <ExternalLink className="w-4 h-4" />
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
