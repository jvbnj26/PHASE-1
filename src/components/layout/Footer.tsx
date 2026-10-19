import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import RichText from '@/components/RichText';
import { useSocialLinks } from '@/components/SocialLinks';
import { usePageText } from '@/hooks/usePageText';

export default function Footer() {
  // Footer text and social links are editable in Admin > Settings.
  const { t, has } = usePageText('site');
  const socialLinks = useSocialLinks();
  const phone = t('footerPhone').trim();
  const email = t('footerEmail').trim();

  return (
    <footer className="bg-foreground text-background">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            {has('footerHeading') && <h3 className="font-serif text-xl font-bold mb-4">{t('footerHeading')}</h3>}
            <RichText value={t('footerBlurb')} onDark className="text-background/70 text-sm leading-relaxed" />
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-4">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            {has('quickLinksHeading') && <h3 className="font-serif text-lg font-bold mb-4">{t('quickLinksHeading')}</h3>}
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-background/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/events/upcoming" className="text-background/70 hover:text-primary transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-background/70 hover:text-primary transition-colors">
                  Activities
                </Link>
              </li>
              <li>
                <Link to="/spiritual-guidance" className="text-background/70 hover:text-primary transition-colors">
                  Spiritual Guidance
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-background/70 hover:text-primary transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            {has('contactHeading') && <h3 className="font-serif text-lg font-bold mb-4">{t('contactHeading')}</h3>}
            <ul className="space-y-3 text-sm">
              {has('footerAddress') && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <RichText value={t('footerAddress')} onDark className="text-background/70" />
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-background/70 hover:text-primary transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href={`mailto:${email}`} className="text-background/70 hover:text-primary transition-colors">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div>
            {has('hoursHeading') && <h3 className="font-serif text-lg font-bold mb-4">{t('hoursHeading')}</h3>}
            <RichText value={t('hoursText')} onDark className="text-background/70 text-sm leading-relaxed" />
            <Link
              to="/admin"
              className="inline-block mt-4 text-sm text-background/50 hover:text-primary transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col items-center gap-2 text-center text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} {t('copyright')}</p>
          <a
            href="/about-app.txt"
            download
            className="text-xs text-background/40 hover:text-primary transition-colors"
          >
            About this app
          </a>
        </div>
      </div>
    </footer>
  );
}
