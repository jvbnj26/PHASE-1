import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Sparkles, Heart, Brain, Target } from 'lucide-react';

const programIcons = [Heart, Brain, Sparkles];

export default function AboutPage() {
  const { aboutContent } = useSiteContent();


  return (
    <PublicLayout>
      <PageHero
        eyebrow="Who We Are"
        title="About JVBNA"
        subtitle="Jain Vishwa Bharati of North America — a center for peace, Preksha Meditation, and the timeless values of nonviolence."
      />

      {/* Intro */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4">
              <div className="sticky top-24">
                <div className="w-16 h-1 bg-primary mb-4 rounded-full" />
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  A Non-Violent Way of Life
                </h2>
              </div>
            </div>
            <div className="md:col-span-8 space-y-5 text-muted-foreground leading-relaxed text-[17px]">
              {aboutContent.intro.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary to-secondary" />
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-1">Our Mission</p>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Spreading the universal message</h3>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg pl-16">{aboutContent.mission}</p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">What We Do</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Programs</h2>
            <p className="text-muted-foreground">{aboutContent.programs}</p>
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
                  <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership CTA */}
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-4xl text-center">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Leadership</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Management (Present)</h2>
          <p className="text-muted-foreground mb-6">Meet the Board of Directors and Executive Committee who guide JVBNA.</p>
          <a
            href="/about/leadership"
            className="inline-block bg-secondary text-secondary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            View Leadership
          </a>
        </div>
      </section>

    </PublicLayout>
  );
}
