import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ExternalLink, Calendar, Youtube, BookOpen, CheckCircle2 } from 'lucide-react';
import RichText from '@/components/RichText';
import OrderedSections from '@/components/OrderedSections';
import SmartLink from '@/components/SmartLink';
import { usePageText } from '@/hooks/usePageText';

export default function ActivitiesPage() {
  const { activities } = useSiteContent();
  const { t, has } = usePageText('activities');

  const sections = {
    intro: (
      <section className="py-14 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-7 border border-primary/10">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              {has('everyoneHeading') && <h3 className="font-serif font-bold text-lg text-foreground mb-2">{t('everyoneHeading')}</h3>}
              <RichText value={t('everyoneText')} className="text-muted-foreground text-sm leading-relaxed" />
            </div>
            <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl p-7 border border-secondary/10">
              <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              {has('familiesHeading') && <h3 className="font-serif font-bold text-lg text-foreground mb-2">{t('familiesHeading')}</h3>}
              <RichText value={t('familiesText')} className="text-muted-foreground text-sm leading-relaxed" />
            </div>
          </div>
        </div>
      </section>
    ),
    ongoing: (
      <section className="py-14 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-6xl">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              {has('ongoingEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('ongoingEyebrow')}</p>}
              {has('ongoingHeading') && <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">{t('ongoingHeading')}</h2>}
            </div>
            <div className="h-1 flex-1 max-w-[200px] bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {activities.map((activity, idx) => (
              <article
                key={activity.id}
                className="group relative bg-white rounded-2xl border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-12 -mt-12" />
                <div className="absolute top-5 right-5 font-serif text-4xl font-bold text-primary/20">
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <h3 className="font-serif font-bold text-xl text-foreground mb-2 pr-12">{activity.title}</h3>
                <RichText value={activity.description} className="text-muted-foreground mb-4 leading-relaxed" />

                {activity.items.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {activity.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {activity.dates && (
                  <div className="flex items-start gap-2 text-sm bg-section rounded-lg p-3 mb-3">
                    <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{has('datesLabel') && <><span className="font-semibold">{t('datesLabel')}</span>{' '}</>}{activity.dates}</span>
                  </div>
                )}

                {activity.zoomLink && has('zoomLabel') && (
                  <a
                    href={activity.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-secondary hover:text-primary font-semibold text-sm transition-colors"
                  >
                    {t('zoomLabel')} <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    ),
    calendar: (
      <section className="py-14 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-8 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative grid md:grid-cols-[1fr,auto] gap-6 items-center">
              <div>
                {has('calendarHeading') && <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">{t('calendarHeading')}</h3>}
                <RichText value={t('calendarText')} onDark className="text-white/90" />
              </div>
              <div className="flex flex-wrap gap-3">
                {has('calendarButton') && (
                  <SmartLink to={t('calendarButtonLink')} className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white text-primary font-semibold hover:bg-white/90 transition-colors">
                    <Calendar className="w-4 h-4" /> {t('calendarButton')}
                  </SmartLink>
                )}
                {has('youtubeButton') && (
                  <SmartLink
                    to={t('youtubeButtonLink')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 border border-white/30 text-white font-semibold hover:bg-white/20 transition-colors"
                  >
                    <Youtube className="w-4 h-4" /> {t('youtubeButton')}
                  </SmartLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
  };

  return (
    <PublicLayout>
      <PageHero eyebrow={t('heroEyebrow')} title={t('heroTitle')} subtitle={t('heroSubtitle')} image={t('heroImage')} />
      <OrderedSections pageId="activities" sections={sections} />
    </PublicLayout>
  );
}
