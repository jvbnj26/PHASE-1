import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Users, Calendar, Mail, type LucideIcon } from 'lucide-react';
import RichText from '@/components/RichText';
import OrderedSections from '@/components/OrderedSections';
import SmartLink from '@/components/SmartLink';
import { usePageText } from '@/hooks/usePageText';

// Pillar copy is editable (Admin > Gyanshala), but the icon per position is fixed —
// mirrors how About's programSections are structured (content is data, icon is code).
const PILLAR_ICONS: LucideIcon[] = [BookOpen, Heart, Users];

export default function GyanshalaPage() {
  const { executiveCommittee, gyanshalaContent } = useSiteContent();
  const { t, has } = usePageText('gyanshala');
  const coordinators = executiveCommittee.filter((m) => m.role.toLowerCase().includes('gyanshala'));
  const pillars = gyanshalaContent.pillars.map((p, i) => ({
    ...p,
    icon: PILLAR_ICONS[i % PILLAR_ICONS.length],
  }));

  // These sections share one white background, so each only adds space above itself (matching
  // the original single-section spacing); the wrapper adds the outer top/bottom padding.
  const sections = {
    intro: (
      <section className="pt-14 bg-white">
        <div className="container-custom max-w-5xl">
          <RichText value={gyanshalaContent.intro} className="text-lg text-muted-foreground leading-relaxed [--rt-gap:1.5rem]" />
        </div>
      </section>
    ),
    pillars: (
      <section className="pt-12 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div key={p.title} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-7 border border-primary/10">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">{p.title}</h3>
                <RichText value={p.description} className="text-muted-foreground text-sm leading-relaxed" />
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    coordinators: coordinators.length > 0 && (
      <section className="pt-14 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="bg-section rounded-2xl p-7">
            {has('coordinatorsHeading') && <h3 className="font-serif font-bold text-lg text-foreground mb-4">{t('coordinatorsHeading')}</h3>}
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {coordinators.map((c) => (
                <p key={c.id} className="text-foreground">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground"> — {c.role}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    cta: (
      <section className="pt-10 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
            <div className="relative grid md:grid-cols-[1fr,auto] gap-6 items-center">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">{gyanshalaContent.ctaTitle}</h3>
                <RichText value={gyanshalaContent.ctaText} onDark className="text-white/90" />
              </div>
              <div className="flex flex-wrap gap-3">
                {has('signUpButton') && (
                  <SmartLink to={t('signUpButtonLink')}>
                    <Button size="lg" variant="secondary" className="font-semibold gap-2">
                      <Users className="w-4 h-4" /> {t('signUpButton')}
                    </Button>
                  </SmartLink>
                )}
                {has('contactButton') && (
                  <SmartLink to={t('contactButtonLink')}>
                    <Button size="lg" variant="outline" className="font-semibold gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                      <Mail className="w-4 h-4" /> {t('contactButton')}
                    </Button>
                  </SmartLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    dates: has('datesLinkText') && (
      <section className="pt-8 bg-white">
        <div className="container-custom max-w-5xl text-center">
          <SmartLink to={t('datesLinkUrl')} className="inline-flex items-center gap-2 text-primary hover:text-secondary font-semibold text-sm transition-colors">
            <Calendar className="w-4 h-4" /> {t('datesLinkText')}
          </SmartLink>
        </div>
      </section>
    ),
  };

  return (
    <PublicLayout>
      <PageHero eyebrow={t('heroEyebrow')} title={t('heroTitle')} subtitle={t('heroSubtitle')} image={t('heroImage')} />
      <OrderedSections
        pageId="gyanshala"
        sections={sections}
        className="[&>section:first-child]:pt-14 [&>section:last-child]:pb-14"
      />
    </PublicLayout>
  );
}
