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
import PageSections from '@/components/PageSections';
import DonationMethodCard from '@/components/DonationMethodCard';

export default function DonatePage() {
  const { donationContent } = useSiteContent();
  const { isAuthenticated, user } = useAuth();
  const [donorCategory, setDonorCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setDonorCategory(null); return; }
    supabase.from('donation_preferences').select('donor_category').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setDonorCategory(data?.donor_category ?? null));
  }, [user]);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Support Our Mission"
        title="Donations"
        subtitle="Your generous contribution helps us maintain our centers, support Samanijis, and spread the message of peace and nonviolence."
      />

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4">
              <div className="sticky top-24">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Why Donate</p>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  JVBNA & Donations
                </h2>
              </div>
            </div>
            <RichText
              value={donationContent.intro}
              className="md:col-span-8 text-muted-foreground leading-relaxed text-[17px] [--rt-gap:1.25rem]"
            />
          </div>
        </div>
      </section>

      {/* Pledge banner */}
      <section className="py-10 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-white rounded-2xl border border-border p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-20 -mt-20" />
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Annual Pledge</p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              2024 Annual Fund Raising
            </h3>
            <RichText value={donationContent.pledgeInfo} splitLines className="text-muted-foreground [--rt-gap:0.5rem]" />
          </div>
        </div>
      </section>

      {/* Donor categories */}
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Contribution Tiers</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">Donor Categories</h2>
            <p className="text-muted-foreground">
              Choose a contribution category during signup and it's already on file — just add your
              payment info here when you're ready to give.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
            <img
              src={donationContent.donorCategoriesImage || donorCategoriesImg}
              alt="Donor contribution categories, amounts, and benefits"
              className="w-full rounded-lg object-contain"
            />
          </div>
        </div>
      </section>

      {/* How to Donate */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Choose Your Method</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">How to Donate</h2>
            <p className="text-muted-foreground">
              Pledge your donation, or directly donate using any of the methods below.
            </p>
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

      {/* Tax notice */}
      <section className="py-10 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="flex items-start gap-4 bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Tax Exemption</p>
              <RichText value={donationContent.taxInfo} className="text-muted-foreground text-sm leading-relaxed" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-10 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="relative">
              <Heart className="w-12 h-12 mx-auto mb-4" />
              <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3">Make a Difference Today</h3>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                Every contribution, large or small, helps sustain our mission of peace, nonviolence, and spiritual upliftment.
              </p>
              {isAuthenticated ? (
                <div className="space-y-3">
                  {donorCategory && (
                    <p className="text-white/90 text-sm">
                      You signed up as: <span className="font-semibold">{donorCategory}</span>
                    </p>
                  )}
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                    Donate Now <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Please sign in to donate.</p>
                  <Link to="/auth?tab=signin&redirect=/donate">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In to Donate
                    </Button>
                  </Link>
                  <p className="text-white/60 text-xs">
                    New member?{' '}
                    <Link to="/signup" className="underline text-white/80 hover:text-white">
                      Start your membership application.
                    </Link>
                  </p>
                </div>
              )}
              <p className="mt-8 text-white/80 text-sm">
                Questions? Reach out to <span className="font-semibold text-white">Vinodh Anchaliya</span> · WhatsApp +1 732 619 5500
              </p>
            </div>
          </div>
        </div>
      </section>

      <PageSections pageId="donate" />
    </PublicLayout>
  );
}
