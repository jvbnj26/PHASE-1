import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import RichText from '@/components/RichText';
import OrderedSections from '@/components/OrderedSections';
import PageHeader from '@/components/layout/PageHeader';
import { usePageText } from '@/hooks/usePageText';
import { mapEmbedSrc } from '@/lib/pageContent';

export default function ContactPage() {
  const { contactInfo, satelliteCenters } = useSiteContent();
  const { t, has } = usePageText('contact');

  // Phone label with a trailing space, or nothing when the admin removed it.
  const phone = has('phoneLabel') ? `${t('phoneLabel')} ` : '';
  const mailingMapSrc = mapEmbedSrc(t('mailingMap'));
  const eventsMapSrc = mapEmbedSrc(t('eventsMap'));

  // These sections share one white background, so each only adds space above itself; the
  // wrapper adds the bottom padding after whichever section ends up last.
  const sections = {
    mailing: (
      <section className="pt-12 bg-white">
        <div className="container-custom max-w-5xl">
          {/* Samaniji & Mailing Address */}
          <div>
            {has('mailingHeading') && (
              <h2 className="font-serif text-xl font-bold text-foreground mb-6">
                {t('mailingHeading')}
              </h2>
            )}
            <div className="bg-section rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">{contactInfo.mailingAddress.name}</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>
                        {contactInfo.mailingAddress.street},<br />
                        {contactInfo.mailingAddress.city}, {contactInfo.mailingAddress.state} {contactInfo.mailingAddress.zip}
                      </span>
                    </p>
                    <p className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>{contactInfo.mailingAddress.phone.join(', ')}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>
                        {contactInfo.mailingAddress.email.map((email, idx) => (
                          <span key={idx}>
                            <a href={`mailto:${email}`} className="text-secondary hover:text-primary transition-colors">
                              {email}
                            </a>
                            {idx < contactInfo.mailingAddress.email.length - 1 && ', '}
                          </span>
                        ))}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  {has('locationLabel') && (
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      {t('locationLabel')}
                    </h4>
                  )}
                  <RichText value={contactInfo.hours} className="text-muted-foreground text-sm leading-relaxed" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    mailingMap: mailingMapSrc && (
      <section className="pt-12 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="aspect-video max-w-2xl rounded-lg overflow-hidden shadow-md">
            <iframe
              src={mailingMapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="JVBNA Iselin Location"
            />
          </div>
        </div>
      </section>
    ),
    events: (
      <section className="pt-12 bg-white">
        <div className="container-custom max-w-5xl">
          {/* JVBNA Events Address */}
          <div>
            {has('eventsHeading') && (
              <h2 className="font-serif text-xl font-bold text-foreground mb-6">
                {t('eventsHeading')}
              </h2>
            )}
            <div className="bg-section rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-3">{contactInfo.eventsAddress.name}</h3>
              <p className="text-muted-foreground">
                {contactInfo.eventsAddress.street},<br />
                {contactInfo.eventsAddress.city}, {contactInfo.eventsAddress.state} {contactInfo.eventsAddress.zip}
              </p>
            </div>
          </div>
        </div>
      </section>
    ),
    eventsMap: eventsMapSrc && (
      <section className="pt-12 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="aspect-video max-w-2xl rounded-lg overflow-hidden shadow-md">
            <iframe
              src={eventsMapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="JVBNA South Plainfield Location"
            />
          </div>
        </div>
      </section>
    ),
    centers: (
      <section className="pt-12 bg-white">
        <div className="container-custom max-w-5xl">
          {/* Parent Organization & Satellite Centers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Parent Organization */}
            <div className="bg-section rounded-xl p-6">
              {has('parentHeading') && (
                <h3 className="font-serif text-lg font-bold text-foreground mb-4">
                  {t('parentHeading')}
                </h3>
              )}
              {has('parentLocation') && <p className="font-medium text-foreground">{t('parentLocation')}</p>}
              <p className="text-muted-foreground text-sm mt-2">
                {satelliteCenters[0]?.name}<br />
                {satelliteCenters[0]?.street}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {phone}{satelliteCenters[0]?.phone}
              </p>
              <p className="mt-2">
                {satelliteCenters[0]?.email.map((email, idx) => (
                  <a key={idx} href={`mailto:${email}`} className="text-secondary hover:text-primary text-sm block transition-colors">
                    {email}
                  </a>
                ))}
              </p>
              <a 
                href={`https://${satelliteCenters[0]?.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mt-2 transition-colors"
              >
                {satelliteCenters[0]?.website} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Satellite Centers */}
            <div className="md:col-span-2 lg:col-span-2">
              {has('satellitesHeading') && (
                <h3 className="font-serif text-lg font-bold text-foreground mb-4">
                  {t('satellitesHeading')}
                </h3>
              )}
              <div className="grid sm:grid-cols-2 gap-6">
                {satelliteCenters.slice(1).map((center) => (
                  <div key={center.id} className="bg-section rounded-xl p-6">
                    <p className="font-medium text-foreground">{center.city}, {center.state}</p>
                    <p className="text-muted-foreground text-sm mt-2">
                      {center.name}<br />
                      {center.street}
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      {phone}{center.phone}
                    </p>
                    <p className="mt-2">
                      {center.email.map((email, idx) => (
                        <a key={idx} href={`mailto:${email}`} className="text-secondary hover:text-primary text-sm block transition-colors">
                          {email}
                        </a>
                      ))}
                    </p>
                    <a 
                      href={`https://${center.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-secondary hover:text-primary text-sm mt-2 transition-colors"
                    >
                      {center.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
  };

  return (
    <PublicLayout>
      <PageHeader title={t('pageTitle')} image={t('heroImage')} />
      <OrderedSections pageId="contact" sections={sections} className="[&>section:last-child]:pb-12" />
    </PublicLayout>
  );
}
