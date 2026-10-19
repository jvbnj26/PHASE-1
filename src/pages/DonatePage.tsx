import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart, Shield, ArrowRight, LogIn } from 'lucide-react';
import donorCategoriesImg from '@/assets/donor-categories.png';
import RichText from '@/components/RichText';
import OrderedSections from '@/components/OrderedSections';
import SmartLink from '@/components/SmartLink';
import { usePageText } from '@/hooks/usePageText';
import DonationMethodCard from '@/components/DonationMethodCard';
import { STANDALONE_IMAGE_WIDTH, toImageSize } from '@/lib/imageSize';

export default function DonatePage() {
  const { donationContent } = useSiteContent();
  const { isAuthenticated, user } = useAuth();
  const { t, has } = usePageText('donate');
  const [donorCategory, setDonorCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setDonorCategory(null); return; }
    supabase.from('donation_preferences').select('donor_category').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setDonorCategory(data?.donor_category ?? null));
  }, [user]);

  const sections = {
    intro: (
      <section className="py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4">
              <div className="sticky top-24">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                {has('introEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('introEyebrow')}</p>}
                {has('introHeading') && (
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
                    {t('introHeading')}
                  </h2>
                )}
              </div>
            </div>
            <RichText
              value={donationContent.intro}
              className="md:col-span-8 text-muted-foreground leading-relaxed text-[17px] [--rt-gap:1.25rem]"
            />
          </div>
        </div>
      </section>
    ),
    pledge: (
      <section className="py-10 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-white rounded-2xl border border-border p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-20 -mt-20" />
            {has('pledgeEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('pledgeEyebrow')}</p>}
            {has('pledgeHeading') && (
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('pledgeHeading')}
              </h3>
            )}
            <RichText value={donationContent.pledgeInfo} splitLines className="text-muted-foreground [--rt-gap:0.5rem]" />
          </div>
        </div>
      </section>
    ),
    categories: (
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            {has('categoriesEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('categoriesEyebrow')}</p>}
            {has('categoriesHeading') && <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">{t('categoriesHeading')}</h2>}
            <RichText value={t('categoriesText')} className="text-muted-foreground" />
          </div>
          <div className={`bg-white rounded-2xl border border-border p-4 md:p-6 ${STANDALONE_IMAGE_WIDTH[toImageSize(t('categoriesImageSize'), 'full')]}`}>
            <img
              src={donationContent.donorCategoriesImage || donorCategoriesImg}
              alt="Donor contribution categories, amounts, and benefits"
              className="w-full rounded-lg object-contain"
            />
          </div>
        </div>
      </section>
    ),
    methods: (
      <section id="how-to-donate" className="py-16 bg-white scroll-mt-4">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            {has('methodsEyebrow') && <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('methodsEyebrow')}</p>}
            {has('methodsHeading') && <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">{t('methodsHeading')}</h2>}
            <RichText value={t('methodsText')} className="text-muted-foreground" />
          </div>

          {/* Flex-wrap (not grid) so any number of cards stays centered. */}
          <div className="flex flex-wrap justify-center gap-6">
            {donationContent.paymentMethods.map((method, idx, all) => (
              <div key={method.id} className="w-full md:w-[calc(33.333%-16px)] flex">
                <DonationMethodCard
                  method={method}
                  // Alternate icon colors across the plain (non-recommended) cards.
                  accent={all.slice(0, idx).filter((m) => !m.recommended).length % 2 === 1}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    tax: (
      <section className="py-10 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="flex items-start gap-4 bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              {has('taxHeading') && <p className="font-semibold text-foreground mb-1">{t('taxHeading')}</p>}
              <RichText value={donationContent.taxInfo} className="text-muted-foreground text-sm leading-relaxed" />
            </div>
          </div>
        </div>
      </section>
    ),
    cta: (
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-10 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="relative">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              {has('ctaHeading') && <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3">{t('ctaHeading')}</h3>}
              <RichText value={t('ctaText')} onDark className="text-white/90 mb-6 max-w-xl mx-auto" />
              {isAuthenticated ? (
                <div className="space-y-3">
                  {donorCategory && (
                    <p className="text-white/90 text-sm">
                      {has('ctaSignedUpAs') && <>{t('ctaSignedUpAs')} </>}<span className="font-semibold">{donorCategory}</span>
                    </p>
                  )}
                  {has('ctaButton') && (
                    <SmartLink to={t('ctaButtonLink')}>
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                        {t('ctaButton')} <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </SmartLink>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {has('ctaSignInPrompt') && <p className="text-white/80 text-sm">{t('ctaSignInPrompt')}</p>}
                  {has('ctaSignInButton') && (
                    <Link to="/auth?tab=signin&redirect=/donate">
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                        <LogIn className="w-4 h-4 mr-2" />
                        {t('ctaSignInButton')}
                      </Button>
                    </Link>
                  )}
                  {(has('ctaNewMember') || has('ctaNewMemberLink')) && (
                    <p className="text-white/60 text-xs">
                      {has('ctaNewMember') && <>{t('ctaNewMember')}{' '}</>}
                      {has('ctaNewMemberLink') && (
                        <Link to="/signup" className="underline text-white/80 hover:text-white">
                          {t('ctaNewMemberLink')}
                        </Link>
                      )}
                    </p>
                  )}
                </div>
              )}
              <RichText value={t('ctaContact')} onDark className="mt-8 text-white/80 text-sm [&_strong]:text-white" />
            </div>
          </div>
        </div>
      </section>
    ),
  };

  return (
    <PublicLayout>
      <PageHero eyebrow={t('heroEyebrow')} title={t('heroTitle')} subtitle={t('heroSubtitle')} image={t('heroImage')} />
      <OrderedSections pageId="donate" sections={sections} />
    </PublicLayout>
  );
}
