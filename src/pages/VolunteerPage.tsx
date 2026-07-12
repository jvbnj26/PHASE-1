import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Heart, GraduationCap, Megaphone, ArrowRight, Facebook, Youtube, Camera } from 'lucide-react';

const iconMap: { [key: string]: React.ReactNode } = {
  Heart: <Heart className="w-7 h-7" />,
  GraduationCap: <GraduationCap className="w-7 h-7" />,
  Megaphone: <Megaphone className="w-7 h-7" />,
};

export default function VolunteerPage() {
  const { volunteerSections } = useSiteContent();

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Get Involved"
        title="Volunteer With Us"
        subtitle="Lend your time, talent, and voice to help our community grow and thrive."
      />

      {/* Three pillars */}
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
                <p className="text-muted-foreground leading-relaxed text-sm mb-5">{section.description}</p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-1.5 text-secondary font-semibold text-sm hover:gap-2.5 transition-all"
                >
                  Get in touch <ArrowRight className="w-4 h-4" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Socials */}
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-5xl">
          <div className="bg-gradient-to-r from-secondary to-primary rounded-2xl p-10 text-white text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="relative">
              <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3">Ready to make a difference?</h3>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                We are always looking for people with various backgrounds, talents, and skill levels.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-white text-secondary font-semibold hover:bg-white/90 transition-colors"
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-4">Connect With Us</p>
            <div className="flex justify-center gap-3">
              {[
                { href: 'https://facebook.com', Icon: Facebook, color: 'bg-[#1877F2]' },
                { href: 'https://flickr.com', Icon: Camera, color: 'bg-[#FF0084]' },
                { href: 'https://youtube.com', Icon: Youtube, color: 'bg-[#FF0000]' },
              ].map(({ href, Icon, color }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md`}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
