import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';

export default function CalendarPage() {
  const { calendarUrl } = useSiteContent();

  return (
    <PublicLayout>
      {/* Page Header */}
      <section className="bg-primary py-8">
        <div className="container-custom">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            CALENDAR
          </h1>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom">
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            Stay up to date with all JVBNA events, sessions, and activities. 
            Our calendar is synced with Google Calendar for easy access and notifications.
          </p>

          {/* Google Calendar Embed */}
          <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg border">
            <iframe
              src={calendarUrl}
              style={{ border: 0 }}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              title="JVBNA Calendar"
              className="w-full h-full"
            />
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            To add events to your personal calendar, click on an event and select "Copy to my calendar"
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
