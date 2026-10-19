import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Sparkles, Heart, Brain, Target } from 'lucide-react';
import RichText from '@/components/RichText';
import OrderedSections from '@/components/OrderedSections';
import SmartLink from '@/components/SmartLink';
import { usePageText } from '@/hooks/usePageText';

const programIcons = [Heart, Brain, Sparkles];

export default function AboutPage() {
  const { aboutContent } = useSiteContent();
  const { t, has } = usePageText('about');

  const sections = {
    intro: (
      <section className="py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4">
              <div className="sticky top-24">
                <div className="w-16 h-1 bg-primary mb-4 rounded-full" />
                {has('introHeading') && (
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    {t('introHeading')}
                  </h2>
                )}
              </div>
            </div>
            <RichText
              value={aboutContent.intro}
              className="md:col-span-8 text-muted-foreground leading-relaxed text-[17px] [--rt-gap:1.25rem]"
            />
          </div>
        </div>
      </section>
    ),
    mission: (
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary" />
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                {has('missionEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">{t('missionEyebrow')}</p>}
                {has('missionHeading') && <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{t('missionHeading')}</h3>}
              </div>
            </div>
            <RichText value={aboutContent.mission} className="text-muted-foreground leading-relaxed text-lg pl-16" />
          </div>
        </div>
      </section>
    ),
    programs: (
      <section className="py-16 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            {has('programsEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('programsEyebrow')}</p>}
            {has('programsHeading') && <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{t('programsHeading')}</h2>}
            <RichText value={aboutContent.programs} className="text-muted-foreground" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {aboutContent.programSections.map((section, idx) => {
              const Icon = programIcons[idx % programIcons.length];
              return (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-foreground mb-3">{section.title}</h4>
                  <RichText value={section.content} className="text-muted-foreground leading-relaxed text-sm" />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    ),
    leadership: (
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-4xl text-center">
          {has('leadershipEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('leadershipEyebrow')}</p>}
          {has('leadershipHeading') && <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{t('leadershipHeading')}</h2>}
          <RichText value={t('leadershipText')} className="text-muted-foreground mb-6" />
          {has('leadershipButton') && (
            <SmartLink
              to={t('leadershipButtonLink')}
              className="inline-block bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('leadershipButton')}
            </SmartLink>
          )}
        </div>
      </section>
    ),
  };

  return (
    <PublicLayout>
      <PageHero eyebrow={t('heroEyebrow')} title={t('heroTitle')} subtitle={t('heroSubtitle')} image={t('heroImage')} />
      <OrderedSections pageId="about" sections={sections} />
    </PublicLayout>
  );
}
