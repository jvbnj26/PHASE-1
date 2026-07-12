import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const { contactInfo, satelliteCenters } = useSiteContent();

  return (
    <PublicLayout>
      {/* Page Header */}
      <section className="bg-primary py-8">
        <div className="container-custom">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            CONTACT US
          </h1>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom max-w-5xl">
          {/* Samaniji & Mailing Address */}
          <div className="mb-12">
            <h2 className="font-serif text-xl font-bold text-foreground mb-6">
              Samaniji & Mailing Address:
            </h2>
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
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Location:
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {contactInfo.hours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps - Iselin */}
          <div className="mb-12">
            <div className="aspect-video max-w-2xl rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3031.1234567890123!2d-74.32!3d40.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDM0JzE2LjgiTiA3NMKwMTknMTIuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
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

          {/* JVBNA Events Address */}
          <div className="mb-12">
            <h2 className="font-serif text-xl font-bold text-foreground mb-6">
              JVBNA Events Address:
            </h2>
            <div className="bg-section rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-3">{contactInfo.eventsAddress.name}</h3>
              <p className="text-muted-foreground">
                {contactInfo.eventsAddress.street},<br />
                {contactInfo.eventsAddress.city}, {contactInfo.eventsAddress.state} {contactInfo.eventsAddress.zip}
              </p>
            </div>
          </div>

          {/* Google Maps - South Plainfield */}
          <div className="mb-12">
            <div className="aspect-video max-w-2xl rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3031.1234567890123!2d-74.42!3d40.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDM0JzE2LjgiTiA3NMKwMjUnMTIuMCJX!5e0!3m2!1sen!2sus!4v1234567890"
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

          {/* Parent Organization & Satellite Centers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Parent Organization */}
            <div className="bg-section rounded-xl p-6">
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">
                Parent Organization
              </h3>
              <p className="font-medium text-foreground">Ladnun, India</p>
              <p className="text-muted-foreground text-sm mt-2">
                {satelliteCenters[0]?.name}<br />
                {satelliteCenters[0]?.street}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Ph: {satelliteCenters[0]?.phone}
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
              <h3 className="font-serif text-lg font-bold text-foreground mb-4">
                Satellite Centers in the USA:
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {satelliteCenters.slice(1).map((center) => (
                  <div key={center.id} className="bg-section rounded-xl p-6">
                    <p className="font-medium text-foreground">{center.city}, {center.state}</p>
                    <p className="text-muted-foreground text-sm mt-2">
                      {center.name}<br />
                      {center.street}
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                      Ph: {center.phone}
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
    </PublicLayout>
  );
}
