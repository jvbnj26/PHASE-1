import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Button } from '@/components/ui/button';
import { ExternalLink, Camera } from 'lucide-react';

export default function PhotosPage() {
  const { photosUrl } = useSiteContent();

  return (
    <PublicLayout>
      {/* Page Header */}
      <section className="bg-primary py-8">
        <div className="container-custom">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">
            PHOTOS
          </h1>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-primary" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
              Our Photo Gallery
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Browse photos from JVBNA events, Preksha Meditation sessions, Gyanshala
              programs, Paryushan celebrations, and community gatherings.
            </p>

            <a href={photosUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 px-10 py-6 text-base rounded-full shadow-md hover:shadow-lg transition-shadow">
                <ExternalLink className="w-5 h-5" />
                View Photo Gallery
              </Button>
            </a>

            <p className="text-xs text-muted-foreground mt-5">
              Opens in Google Photos &mdash; no account required to browse.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
