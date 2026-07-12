import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import EventPopup from '@/components/EventPopup';

import bannerMahapragya from '@/assets/banner-mahapragya.png';
import samaniSamatvaPragya from '@/assets/samani-samatva-pragya.png';
import samaniAbhayPragya from '@/assets/samani-abhay-pragya.png';

// Map image keys to imported assets
const imageMap: Record<string, string> = {
  'banner-mahapragya': bannerMahapragya,
  'samani-samatva-pragya': samaniSamatvaPragya,
  'samani-abhay-pragya': samaniAbhayPragya,
};

const getImageSrc = (imageUrl: string) => {
  return imageMap[imageUrl] || imageUrl;
};

export default function HomePage() {
  const { bannerSlides, welcomeText, spiritualMasters, events2025, activities2025 } = useSiteContent();
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
      {/* Hero Banner Carousel */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
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
            />

          </div>
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
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
            <div className="flex justify-center gap-8">
              {spiritualMasters.map((master) => (
                <div key={master.id} className="text-center">
                  <div className="w-40 h-48 md:w-48 md:h-56 rounded-lg overflow-hidden bg-muted mb-3 shadow-md">
                    <img
                      src={getImageSrc(master.imageUrl)}
                      alt={master.name}
                      className="w-full h-full object-cover"
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
      <EventsAndActivities events={events2025} activities={activities2025} />


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

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

type RawItem = string | { name: string; subItem?: boolean };

function parseEvent(raw: RawItem, year: number) {
  const name = typeof raw === 'string' ? raw : raw.name;
  // Match "Mon D" or "Mon D-D" or "Mon D – D" at start
  const m = name.match(/^([A-Za-z]{3})\s+(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*[–-]?\s*(.*)$/);
  if (m && MONTHS[m[1].toLowerCase()] !== undefined) {
    const month = MONTHS[m[1].toLowerCase()];
    const day = parseInt(m[2], 10);
    const endDay = m[3] ? parseInt(m[3], 10) : undefined;
    const title = (m[4] || '').replace(/^[–-]\s*/, '').trim() || name;
    return {
      name,
      title,
      date: new Date(year, month, day),
      monthLabel: m[1].slice(0, 3).toUpperCase(),
      dayLabel: endDay ? `${day}-${endDay}` : `${day}`,
      hasDate: true,
    };
  }
  return { name, title: name, date: null as Date | null, monthLabel: '', dayLabel: '', hasDate: false };
}

function EventsAndActivities({ events, activities }: { events: RawItem[]; activities: RawItem[] }) {
  const currentYear = new Date().getFullYear();

  const upcomingEvents = useMemo(() => {
    const parsed = events.map((e) => parseEvent(e, currentYear));
    const dated = parsed.filter((p) => p.hasDate && p.date);
    const undated = parsed.filter((p) => !p.hasDate);
    const sorted = dated.sort((a, b) => (a.date as Date).getTime() - (b.date as Date).getTime());
    return [...sorted, ...undated].slice(0, 8);
  }, [events, currentYear]);

  const activityList = useMemo(() => {
    // Strip dated one-off items (like "Mar 2 – ...") — these belong under events
    return activities.filter((a) => {
      const name = typeof a === 'string' ? a : a.name;
      return !/^[A-Za-z]{3}\s+\d{1,2}/.test(name);
    });
  }, [activities]);

  return (
    <section className="py-20 bg-gradient-to-b from-section to-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Events */}
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col">
            <div className="px-8 py-6 bg-gradient-to-r from-primary to-primary/80 flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm uppercase tracking-wider font-semibold">Upcoming</p>
                <h3 className="font-serif text-3xl font-bold text-primary-foreground">Events {currentYear}</h3>
              </div>
            </div>

            <ul className="divide-y divide-border flex-1">
              {upcomingEvents.map((ev, idx) => (
                <li key={idx}>
                  <Link
                    to="/events/upcoming"
                    className="flex items-center gap-5 px-6 py-5 hover:bg-section transition-colors group"
                  >
                    {ev.hasDate ? (
                      <div className="shrink-0 w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center leading-none">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{ev.monthLabel}</span>
                        <span className="text-xl font-bold text-foreground mt-0.5">{ev.dayLabel}</span>
                      </div>
                    ) : (
                      <div className="shrink-0 w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">TBA</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {ev.title}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="px-6 py-5 border-t border-border">
              <Link to="/events/upcoming">
                <Button variant="outline" className="w-full font-semibold text-base">
                  View All Events
                </Button>
              </Link>
            </div>
          </div>

          {/* Activities */}
          <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col">
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
      </div>
    </section>
  );
}

