import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import { useEvents } from '@/hooks/useEvents';
import { Calendar, CheckCircle2, ExternalLink, LogIn, Loader2 } from 'lucide-react';
import { classifyEvent } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRsvps } from '@/hooks/useRsvps';
import { useRsvpFormIndex } from '@/hooks/useRsvpFormIndex';
import { useRecentPosts } from '@/hooks/usePosts';
import { getImageSrc } from '@/lib/imageMap';
import EventMediaCarousel, { eventMediaFor } from '@/components/EventMediaCarousel';
import RecentPostsTicker from '@/components/RecentPostsTicker';
import PageHeader from '@/components/layout/PageHeader';
import { usePageText } from '@/hooks/usePageText';
import { FLYER_CARD_WIDTH, toImageSize } from '@/lib/imageSize';
import OrderedSections from '@/components/OrderedSections';

type EventType = 'upcoming' | 'ongoing' | 'past';

export default function EventsPage() {
  const { type } = useParams<{ type?: string }>();
  const { events, loading: eventsLoading } = useEvents();
  const navigate = useNavigate();
  const { rsvpIds, loading: rsvpLoading, toggleRsvp, isAuthenticated } = useRsvps();
  const { formIndex } = useRsvpFormIndex();
  const { posts: recentPosts, loading: recentPostsLoading } = useRecentPosts(12);

  const eventType: EventType = (type as EventType) || 'upcoming';

  const filteredEvents = useMemo(() => {
    const today = new Date();
    return events.filter(event => classifyEvent(event, today) === eventType);
  }, [events, eventType]);

  const { t, has } = usePageText('events');
  const pageTitle = t(({ upcoming: 'titleUpcoming', ongoing: 'titleOngoing', past: 'titlePast' } as const)[eventType]);
  const flyerWidth = FLYER_CARD_WIDTH[toImageSize(t('flyerSize'), 'md')];
  const emptyText = t(({ upcoming: 'emptyUpcoming', ongoing: 'emptyOngoing', past: 'emptyPast' } as const)[eventType]);

  const handleRsvp = async (eventId: string, eventTitle: string, rsvpLink?: string) => {
    if (!isAuthenticated) {
      navigate(`/auth?tab=signin&redirect=/events/upcoming`);
      return;
    }
    if (formIndex.has(eventId)) {
      navigate(`/events/${eventId}/rsvp`);
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
      <PageHeader title={pageTitle} image={t('heroImage')} />

      <OrderedSections
        pageId="events"
        sections={{
          list: (
            <>
            {/* Recent Posts ticker */}
            <RecentPostsTicker posts={recentPosts} loading={recentPostsLoading} />

            {/* Events Navigation */}
            <section className="bg-white border-b">
              <div className="container-custom py-4">
                <div className="inline-flex flex-wrap gap-1 bg-muted rounded-full p-1">
                  {([
                    { key: 'upcoming', label: t('tabUpcoming') },
                    { key: 'ongoing', label: t('tabOngoing') },
                    { key: 'past', label: t('tabPast') },
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
            {eventType === 'upcoming' && !isAuthenticated && (has('signInPrompt') || has('signInButton')) && (
              <div className="bg-secondary/10 border-b border-secondary/20">
                <div className="container-custom py-3 flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm text-secondary font-medium">
                    {t('signInPrompt')}
                  </p>
                  {has('signInButton') && (
                    <Link to="/auth?tab=signin&redirect=/events/upcoming">
                      <Button size="sm" variant="secondary" className="gap-2">
                        <LogIn className="w-4 h-4" /> {t('signInButton')}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Events Grid */}
            <section className="py-12 bg-section">
              <div className="container-custom">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">{emptyText}</p>
                  </div>
                ) : (
                  <div className="flyer-grid">
                    {filteredEvents.map((event) => {
                      const imageUrl = getImageSrc(event.imageUrl);
                      const media = eventMediaFor({ ...event, imageUrl });
                      const hasRsvp = rsvpIds.has(event.id);
                      const hasForm = formIndex.has(event.id);

                      return (
                        <div
                          key={event.id}
                          className={`event-card ${flyerWidth}`}
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
                              {/* In-app RSVP — available regardless of upcoming/ongoing/past status */}
                              <Button
                                size="sm"
                                variant={hasRsvp ? 'secondary' : 'default'}
                                disabled={rsvpLoading}
                                onClick={() => handleRsvp(event.id, event.title, event.rsvpLink)}
                                className="gap-2"
                              >
                                {hasRsvp ? (
                                  hasForm ? (
                                    <><CheckCircle2 className="w-4 h-4" /> View/Edit RSVP</>
                                  ) : (
                                    <><CheckCircle2 className="w-4 h-4" /> RSVPed — Cancel</>
                                  )
                                ) : isAuthenticated ? (
                                  'RSVP'
                                ) : (
                                  <><LogIn className="w-4 h-4" /> Sign In to RSVP</>
                                )}
                              </Button>

                              {/* External photos link (Google Photos album, etc.) */}
                              {event.photosLink && has('viewPhotos') && (
                                <a href={event.photosLink} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="gap-2">
                                    {t('viewPhotos')} <ExternalLink className="w-4 h-4" />
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
            </>
          ),
        }}
      />
    </PublicLayout>
  );
}
