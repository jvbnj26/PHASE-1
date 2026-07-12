import PublicLayout from '@/components/layout/PublicLayout';
import PageHero from '@/components/layout/PageHero';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Facebook, Youtube, Camera, Quote } from 'lucide-react';
import samaniSamatvaPragya from '@/assets/samani-samatva-pragya.png';
import samaniAbhayPragya from '@/assets/samani-abhay-pragya.png';

const imageMap: Record<string, string> = {
  'samani-samatva-pragya': samaniSamatvaPragya,
  'samani-abhay-pragya': samaniAbhayPragya,
};
const getImageSrc = (url: string) => imageMap[url] || url;

export default function SpiritualGuidancePage() {
  const { spiritualMasters } = useSiteContent();

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Our Guides"
        title="Spiritual Guidance"
        subtitle="JVBNA operates under the blessings of visiting Samanijis from Jain Vishwa Bharati, India."
      />

      {/* Pull-quote intro */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="relative bg-gradient-to-br from-section to-muted/30 rounded-2xl p-8 md:p-10 border-l-4 border-primary">
            <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/20" />
            <p className="text-muted-foreground leading-relaxed text-[17px]">
              In 1980, under the guidance of Acharya Shri Tulsi and Acharya Shri Mahapragya, a special
              Jain monk status of <span className="font-semibold text-foreground">Samani</span> was established.
              Samanijis adopt the five prime vows of Jain monk-life — Ahimsa (nonviolence), Satya (truthfulness),
              Achaurya, Brahmacharya, and Aparigrah — and are committed to purity and detachment for life.
              They are permitted to travel outside India to propagate the message of Bhagwan Mahaveer.
            </p>
          </div>
        </div>
      </section>

      {/* Masters Grid */}
      <section className="py-16 bg-gradient-to-br from-section to-muted/30">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Resident Samanijis</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Our Spiritual Masters</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                {master.description && (
                  <div className="p-6">
                    <p className="text-muted-foreground leading-relaxed text-sm">{master.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* About Samanijis */}
          <div className="mt-12 max-w-4xl mx-auto bg-white rounded-2xl p-8 border border-border">
            <h3 className="font-serif font-bold text-xl text-foreground mb-3">About Our Samanijis</h3>
            <p className="text-muted-foreground leading-relaxed">
              JVBNA is blessed to host Samanijis year round. Our resident Samanijis typically hold advanced
              (Masters and Ph.D.) degrees in Jain Philosophy and Comparative Studies, Science of Living,
              Sanskrit and English. They are well versed with the practical aspects of common life and are
              experts in the practice of Preksha (yoga and meditation) and natural health therapies. They
              provide spiritual guidance to Jains and non-Jains alike, and inspire the community to adopt a
              non-violent way of life.
            </p>
          </div>

          {/* Social */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Follow Their Discourses</p>
            <div className="flex gap-3">
              {[
                { href: 'https://facebook.com', Icon: Facebook, color: 'bg-[#1877F2]' },
                { href: 'https://flickr.com', Icon: Camera, color: 'bg-[#FF0084]' },
                { href: 'https://youtube.com', Icon: Youtube, color: 'bg-[#FF0000]' },
              ].map(({ href, Icon, color }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md`}
                >
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
