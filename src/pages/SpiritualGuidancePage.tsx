import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Quote } from 'lucide-react';
import { getImageSrc } from '@/lib/imageMap';
import RichText from '@/components/RichText';
import { isRichTextEmpty } from '@/lib/richText';
import OrderedSections from '@/components/OrderedSections';
import SocialLinks, { useSocialLinks } from '@/components/SocialLinks';
import { usePageText } from '@/hooks/usePageText';
import { MASTER_GRID, toImageSize } from '@/lib/imageSize';

export default function SpiritualGuidancePage() {
  const { spiritualMasters } = useSiteContent();
  const { t, has } = usePageText('spiritual-guidance');
  const hasSocial = useSocialLinks().length > 0;

  const sections = {
    intro: has('introQuote') && (
      <section className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="relative bg-gradient-to-br from-section to-muted/30 rounded-2xl p-8 md:p-10 border-l-4 border-primary">
            <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/20" />
            <RichText value={t('introQuote')} className="text-muted-foreground leading-relaxed text-[17px]" />
          </div>
        </div>
      </section>
    ),
    masters: (
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-6xl">
          {(has('mastersEyebrow') || has('mastersHeading')) && (
            <div className="text-center mb-12">
              {has('mastersEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('mastersEyebrow')}</p>}
              {has('mastersHeading') && <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">{t('mastersHeading')}</h2>}
            </div>
          )}

          <div className={`grid ${MASTER_GRID[toImageSize(t('mastersPhotoSize'), 'lg')]} gap-8 mx-auto`}>
            {spiritualMasters.map((master) => (
              <div
                key={master.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={getImageSrc(master.imageUrl)}
                    alt={master.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif font-bold text-2xl text-white">{master.name}</h3>
                    <div className="w-12 h-1 bg-primary rounded-full mt-2" />
                  </div>
                </div>
                {!isRichTextEmpty(master.description) && (
                  <div className="p-6">
                    <RichText value={master.description} className="text-muted-foreground leading-relaxed text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* About Samanijis */}
          {(has('aboutHeading') || has('aboutText')) && (
            <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-border">
              {has('aboutHeading') && <h3 className="font-serif font-bold text-xl text-foreground mb-3">{t('aboutHeading')}</h3>}
              <RichText value={t('aboutText')} className="text-muted-foreground leading-relaxed" />
            </div>
          )}

          {/* Social */}
          {hasSocial && (
            <div className="mt-12 flex flex-col items-center gap-4">
              {has('socialLabel') && <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">{t('socialLabel')}</p>}
              <SocialLinks className="flex gap-3" />
            </div>
          )}
        </div>
      </section>
    ),
  };

  return (
    <PublicLayout>
      <PageHero eyebrow={t('heroEyebrow')} title={t('heroTitle')} subtitle={t('heroSubtitle')} image={t('heroImage')} />
      <OrderedSections pageId="spiritual-guidance" sections={sections} />
    </PublicLayout>
  );
}
