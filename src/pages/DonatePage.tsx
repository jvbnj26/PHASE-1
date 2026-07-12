import { Link } from 'react-router-dom';
import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, Globe, CheckCircle, Heart, Shield, ArrowRight, LogIn } from 'lucide-react';

export default function DonatePage() {
  const { donationContent } = useSiteContent();
  const { isAuthenticated } = useAuth();

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
            <div className="md:col-span-8 space-y-5 text-muted-foreground leading-relaxed text-[17px]">
              {donationContent.intro.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
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
            <div className="text-muted-foreground space-y-2">
              {donationContent.pledgeInfo.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
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

          <div className="grid md:grid-cols-3 gap-6">
            {/* Check */}
            <div className="group relative bg-white rounded-2xl border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                <CreditCard className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-xl text-foreground mb-2">Pay by Check</h4>
              <p className="text-sm text-muted-foreground mb-4">Mail check or hand it to any EC member.</p>
              <div className="text-xs text-muted-foreground bg-section rounded-lg p-4 space-y-1.5">
                <p><span className="font-semibold text-foreground">Address:</span> 151 Middlesex Avenue, Iselin, NJ 08830</p>
                <p><span className="font-semibold text-foreground">Payable to:</span> JVBNA</p>
                <p><span className="font-semibold text-foreground">Memo:</span> Donation category</p>
              </div>
            </div>

            {/* Bank Transfer */}
            <div className="group relative bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl border border-secondary p-7 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-xl mb-2">Bank Transfer (ACH)</h4>
              <p className="text-sm text-white/90 mb-4">Preferred and safe — pay directly from your bank account.</p>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Lowest fees, fastest processing</span>
              </div>
            </div>

            {/* International */}
            <div className="group relative bg-white rounded-2xl border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/70 text-accent-foreground flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                <Globe className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-xl text-foreground mb-2">International Donors</h4>
              <p className="text-sm text-muted-foreground mb-4">Outside the USA? PayPal works worldwide.</p>
              <Button variant="outline" className="w-full">Donate via PayPal</Button>
            </div>
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
              <p className="text-muted-foreground text-sm leading-relaxed">{donationContent.taxInfo}</p>
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
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  Donate Now <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
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
    </PublicLayout>
  );
}
