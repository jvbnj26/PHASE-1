import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { toCalendarEmbedUrl } from '@/lib/calendarUrl';
import PageHeader from '@/components/layout/PageHeader';
import RichText from '@/components/RichText';
import { usePageText } from '@/hooks/usePageText';
import OrderedSections from '@/components/OrderedSections';

export default function CalendarPage() {
  const { calendarUrl } = useSiteContent();
  const embedUrl = toCalendarEmbedUrl(calendarUrl);
  const { t, has } = usePageText('calendar');

  return (
    <PublicLayout>
      <PageHeader title={t('pageTitle')} image={t('heroImage')} />

      <OrderedSections
        pageId="calendar"
        sections={{
          body: (
            <>
            <section className="py-12 bg-white">
              <div className="container-custom">
                <RichText value={t('intro')} className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto" />

                {/* Google Calendar Embed */}
                <div className="aspect-video w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg border">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      style={{ border: 0 }}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      title="JVBNA Calendar"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-section p-6 text-center text-muted-foreground">
                      {t('unavailable')}
                    </div>
                  )}
                </div>

                {has('footnote') && (
                  <p className="text-sm text-muted-foreground mt-6 text-center">
                    {t('footnote')}
                  </p>
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
