import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Loader2, CalendarX } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useEvents } from '@/hooks/useEvents';
import { eventsForTab } from '@/lib/utils';
import type { Event } from '@/data/siteContent';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import EventPopup from '@/components/EventPopup';
import { getImageSrc } from '@/lib/imageMap';

export default function HomePage() {
  const { bannerSlides, welcomeText, spiritualMasters, activities2025 } = useSiteContent();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  // Check if first banner is the Mahapragya image (no overlay needed)

  return (
    <PublicLayout>
      <EventPopup />
      {/* Hero Banner Carousel — box aspect ratio (3:1) is close to but slightly taller
          than the actual banner assets' ~3.58:1 shape, so object-cover fills the box
          completely (no letterbox borders) at only a mild ~8%-per-side crop, rather than
          the severe crop a much-taller box (e.g. 16:9) would cause on an ultra-wide
          panorama. Caps to a fixed height on laptop+. */}
      <section className="relative w-full aspect-[3/1] lg:aspect-auto lg:h-[500px] overflow-hidden">
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={getImageSrc(slide.imageUrl)}
              alt={slide.title || 'JVBNA Banner'}
              className="w-full h-full object-cover"
              onError={(e) => {
                if (e.currentTarget.src.endsWith('/placeholder.svg')) return;
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Welcome Section with Spiritual Masters */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Welcome text */}
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                {welcomeText.title}
              </h2>
              <div className="prose prose-lg text-muted-foreground leading-relaxed">
                {welcomeText.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Spiritual Masters */}
            <div className="flex justify-center flex-wrap gap-4 sm:gap-8">
              {spiritualMasters.map((master) => (
                <div key={master.id} className="text-center">
                  <div className="w-32 h-40 sm:w-40 sm:h-48 md:w-48 md:h-56 rounded-lg overflow-hidden bg-muted mb-3 shadow-md">
                    <img
                      src={getImageSrc(master.imageUrl)}
                      alt={master.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (e.currentTarget.src.endsWith('/placeholder.svg')) return;
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  <p className="font-medium text-foreground">{master.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events & Activities */}
      <EventsAndActivities activities={activities2025} />


      {/* Quick Links / CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Join Our Community
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Experience inner peace through Preksha Meditation, Yoga, and the timeless wisdom of Jain philosophy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/events/upcoming">
              <Button variant="secondary" size="lg" className="font-semibold">
                Upcoming Events
              </Button>
            </Link>
            <Link to="/volunteer">
              <Button variant="secondary" size="lg" className="font-semibold">
                Get Involved
              </Button>
            </Link>
            <Link to="/donate">
              <Button variant="secondary" size="lg" className="font-semibold">
                Donate Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

type RawItem = string | { name: string; subItem?: boolean };

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Bigger, detail-forward card for an ongoing or upcoming event — these are rare (0-1
 *  ongoing, 1-3 upcoming) and time-sensitive, so each one earns real visual weight and a
 *  description snippet rather than being squeezed into a compact list row. */
function EventCard({ event, variant }: { event: Event; variant: 'ongoing' | 'upcoming' }) {
  const d = event.startDate ? new Date(`${event.startDate}T00:00:00`) : null;
  return (
    <Link
      to={`/events/${variant}`}
      className="group flex gap-4 rounded-xl border border-border overflow-hidden bg-white hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="relative shrink-0 w-28 sm:w-36 aspect-square overflow-hidden bg-muted">
        <img
          src={getImageSrc(event.imageUrl)}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {variant === 'ongoing' ? (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-secondary text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Happening Now
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-white/95 rounded-md px-1.5 py-1 text-center leading-none shadow">
            <p className="text-[8px] font-bold text-primary uppercase tracking-wide">
              {d ? MONTH_LABELS[d.getMonth()] : 'TBA'}
            </p>
            {d && <p className="text-xs font-bold text-foreground">{d.getDate()}</p>}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-3 pr-4 flex flex-col justify-center">
        <p className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {event.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{event.date}</p>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{event.description}</p>
        )}
      </div>
    </Link>
  );
}

/** Compact past-event row — past can run to dozens, so it trades the bigger card's detail
 *  for density: small thumbnail, title, date, nothing else. Same rounded-thumbnail language
 *  as EventCard, just scaled down so the full list can be scanned (and scrolled) at a glance. */
function PastRow({ event }: { event: Event }) {
  const d = event.startDate ? new Date(`${event.startDate}T00:00:00`) : null;
  return (
    <li>
      <Link
        to="/events/past"
        className="flex items-center gap-3 px-6 py-3 hover:bg-white transition-colors group"
      >
        <div className="shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-border bg-muted">
          <img src={getImageSrc(event.imageUrl)} alt={event.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {d ? `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}` : event.date}
          </p>
        </div>
      </Link>
    </li>
  );
}

/**
 * Homepage "Events" card — live from the same `events` table (via useEvents) and the same
 * upcoming/ongoing/past classification (classifyEvent, date-driven) as the public Events page.
 *
 * Split into two panes by how the data actually looks, not as three equal tabs: ongoing (0-1)
 * and upcoming (1-3) are rare and time-sensitive, so they sit together on the left as bigger
 * cards with real detail; past can run to dozens, so it's a compact, scrollable, full list on
 * the right — same rounded-thumbnail card language throughout, just sized for volume vs. urgency.
 */
function HomeEventsCard() {
  const { events, loading } = useEvents();

  const ongoing = useMemo(() => eventsForTab(events, 'ongoing'), [events]);
  const upcoming = useMemo(() => eventsForTab(events, 'upcoming').slice(0, 3), [events]);
  const past = useMemo(() => eventsForTab(events, 'past'), [events]);
  const hasCurrent = ongoing.length > 0 || upcoming.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
      <div className="px-8 py-6 bg-gradient-to-r from-primary to-primary/80">
        <p className="text-primary-foreground/80 text-sm uppercase tracking-wider font-semibold">Stay Connected</p>
        <h3 className="font-serif text-3xl font-bold text-primary-foreground">Events</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Ongoing & Upcoming */}
          <div className="sm:col-span-3 flex flex-col">
            <p className="px-6 pt-5 pb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ongoing &amp; Upcoming
            </p>
            {hasCurrent ? (
              <div className="flex flex-col gap-4 px-6 pb-6">
                {ongoing.map((ev) => (
                  <EventCard key={ev.id} event={ev} variant="ongoing" />
                ))}
                {upcoming.map((ev) => (
                  <EventCard key={ev.id} event={ev} variant="upcoming" />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <CalendarX className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No upcoming events right now — check back soon.</p>
              </div>
            )}
          </div>

          {/* Past */}
          <div className="sm:col-span-2 flex flex-col bg-section/30">
            <p className="px-6 pt-5 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Past Events
            </p>
            {past.length > 0 ? (
              <ul className="divide-y divide-border max-h-[26rem] overflow-y-auto">
                {past.map((ev) => (
                  <PastRow key={ev.id} event={ev} />
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center px-6 py-10 text-center">
                <p className="text-muted-foreground text-sm">No past events yet.</p>
              </div>
            )}
            <div className="px-6 py-4 border-t border-border mt-auto">
              <Link to="/events/past">
                <Button variant="outline" size="sm" className="w-full font-semibold">
                  View All Past Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsAndActivities({ activities }: { activities: RawItem[] }) {
  const activityList = useMemo(() => {
    // Strip dated one-off items (like "Mar 2 – ...") — these belong under events
    return activities.filter((a) => {
      const name = typeof a === 'string' ? a : a.name;
      return !/^[A-Za-z]{3}\s+\d{1,2}/.test(name);
    });
  }, [activities]);

  return (
    <section className="py-20 bg-gradient-to-b from-section to-white">
      <div className="container-custom space-y-8">
        {/* Events — dynamic, live from the same `events` table as Admin > Events / the public
            Events page. Full-width so its Ongoing/Upcoming and Past panes both have room. */}
        <HomeEventsCard />

        {/* Activities */}
        <div className="max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col">
          <div className="px-8 py-6 bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-between">
            <div>
              <p className="text-secondary-foreground/80 text-sm uppercase tracking-wider font-semibold">Ongoing</p>
              <h3 className="font-serif text-3xl font-bold text-secondary-foreground">Activities</h3>
            </div>
          </div>

          <ul className="divide-y divide-border flex-1">
            {activityList.slice(0, 8).map((a, idx) => {
              const isSub = typeof a === 'object' && a.subItem;
              const name = typeof a === 'string' ? a : a.name;
              return (
                <li key={idx} className={isSub ? 'bg-muted/30' : ''}>
                  <Link
                    to="/activities"
                    className={`flex items-center gap-3 px-6 py-5 hover:bg-section transition-colors group ${isSub ? 'pl-12' : ''}`}
                  >
                    <span className="text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="px-6 py-5 border-t border-border">
            <Link to="/activities">
              <Button variant="outline" className="w-full font-semibold text-base">
                View All Activities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

