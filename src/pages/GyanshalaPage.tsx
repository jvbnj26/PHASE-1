import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Heart, Users, Calendar, Mail, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// Pillar copy is editable (Admin > Gyanshala), but the icon per position is fixed —
// mirrors how About's programSections are structured (content is data, icon is code).
const PILLAR_ICONS: LucideIcon[] = [BookOpen, Heart, Users];

export default function GyanshalaPage() {
  const { executiveCommittee, gyanshalaContent } = useSiteContent();
  const coordinators = executiveCommittee.filter((m) => m.role.toLowerCase().includes('gyanshala'));
  const pillars = gyanshalaContent.pillars.map((p, i) => ({
    ...p,
    icon: PILLAR_ICONS[i % PILLAR_ICONS.length],
  }));

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Education for Children"
        title="Gyanshala"
        subtitle="JVBNA's religious school for children — teaching Jain philosophy, the Science of Living, and life values in a warm, welcoming setting."
      />

      <section className="py-14 bg-white">
        <div className="container-custom max-w-5xl">
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed mb-12">
            {gyanshalaContent.intro.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {pillars.map((p) => (
              <div key={p.title} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-7 border border-primary/10">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4">
                  <p.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>

          {coordinators.length > 0 && (
            <div className="bg-section rounded-2xl p-7 mb-10">
              <h3 className="font-serif font-bold text-lg text-foreground mb-4">Gyanshala Coordinators</h3>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {coordinators.map((c) => (
                  <p key={c.id} className="text-foreground">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground"> — {c.role}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
            <div className="relative grid md:grid-cols-[1fr,auto] gap-6 items-center">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-2">{gyanshalaContent.ctaTitle}</h3>
                <p className="text-white/90">
                  {gyanshalaContent.ctaText}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="font-semibold gap-2">
                    <Users className="w-4 h-4" /> Sign Up
                  </Button>
                </Link>
                <a href="mailto:info@jvbnj.org">
                  <Button size="lg" variant="outline" className="font-semibold gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
                    <Mail className="w-4 h-4" /> Contact Us
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link to="/activities" className="inline-flex items-center gap-2 text-primary hover:text-secondary font-semibold text-sm transition-colors">
              <Calendar className="w-4 h-4" /> See Gyanshala dates on the Activities page
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
