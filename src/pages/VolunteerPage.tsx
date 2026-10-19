import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Heart, GraduationCap, Megaphone, ArrowRight } from 'lucide-react';
import RichText from '@/components/RichText';
import OrderedSections from '@/components/OrderedSections';
import SmartLink from '@/components/SmartLink';
import SocialLinks, { useSocialLinks } from '@/components/SocialLinks';
import { usePageText } from '@/hooks/usePageText';

const iconMap: { [key: string]: React.ReactNode } = {
  Heart: <Heart className="w-7 h-7" />,
  GraduationCap: <GraduationCap className="w-7 h-7" />,
  Megaphone: <Megaphone className="w-7 h-7" />,
};

export default function VolunteerPage() {
  const { volunteerSections } = useSiteContent();
  const { t, has } = usePageText('volunteer');
  const hasSocial = useSocialLinks().length > 0;

  const sections = {
    opportunities: (
      <section className="py-16 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {volunteerSections.map((section, idx) => (
              <article
                key={section.id}
                className="group relative bg-white rounded-2xl border border-border p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="font-serif text-6xl font-bold text-primary/10 absolute top-4 right-6">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                  {iconMap[section.icon] || <Heart className="w-7 h-7" />}
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">{section.title}</h3>
                <RichText value={section.description} className="text-muted-foreground leading-relaxed text-sm mb-5" />
                {has('cardLink') && (
                  <SmartLink
                    to={t('cardLinkUrl')}
                    className="inline-flex items-center gap-1.5 text-secondary font-semibold text-sm hover:gap-2.5 transition-all"
                  >
                    {t('cardLink')} <ArrowRight className="w-4 h-4" />
                  </SmartLink>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    cta: (
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-10 text-white text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="relative">
              {has('ctaHeading') && <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3">{t('ctaHeading')}</h3>}
              <RichText value={t('ctaText')} onDark className="text-white/90 mb-6 max-w-xl mx-auto" />
              {has('ctaButton') && (
                <SmartLink
                  to={t('ctaButtonLink')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white text-secondary font-semibold hover:bg-white/90 transition-colors"
                >
                  {t('ctaButton')} <ArrowRight className="w-4 h-4" />
                </SmartLink>
              )}
            </div>
          </div>

          {hasSocial && (
            <div className="mt-12 text-center">
              {has('socialLabel') && <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-4">{t('socialLabel')}</p>}
              <SocialLinks className="flex justify-center gap-3" />
            </div>
          )}
        </div>
      </section>
    ),
  };

  return (
    <PublicLayout>
      <PageHero eyebrow={t('heroEyebrow')} title={t('heroTitle')} subtitle={t('heroSubtitle')} image={t('heroImage')} />
      <OrderedSections pageId="volunteer" sections={sections} />
    </PublicLayout>
  );
}
