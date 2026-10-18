import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ExternalLink, Camera, Images } from 'lucide-react';

export default function PhotosPage() {
  const { photoAlbums } = useSiteContent();

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

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-4">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Shared Albums</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Our Photo Gallery</h2>
            </div>
            <div className="h-1 flex-1 max-w-[200px] bg-gradient-to-r from-primary to-secondary rounded-full" />
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-3xl">
            Browse photos from JVBNA events, Preksha Meditation sessions, Gyanshala
            programs, Paryushan celebrations, and community gatherings.
          </p>

          {photoAlbums.length === 0 ? (
            <div className="max-w-xl mx-auto text-center bg-section rounded-2xl p-10">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground">Photo albums are coming soon — check back after our next event.</p>
            </div>
          ) : (
            // Flex-wrap (not grid) so a partial last row is centered rather than left-aligned.
            <div className="flex flex-wrap justify-center gap-6">
              {photoAlbums.map((album, idx) => (
                <a
                  key={album.id}
                  href={album.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-12 -mt-12" />
                  <div className="absolute top-5 right-5 font-serif text-4xl font-bold text-primary/20">
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {album.imageUrl ? (
                    <img
                      src={album.imageUrl}
                      alt=""
                      loading="lazy"
                      className="w-14 h-14 rounded-2xl object-cover mb-5 shadow-sm group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Images className="w-7 h-7" />
                    </div>
                  )}

                  <h3 className="font-serif font-bold text-xl text-foreground mb-6 pr-12 break-words">{album.name}</h3>

                  <span className="mt-auto inline-flex items-center gap-2 text-secondary group-hover:text-primary font-semibold text-sm transition-colors">
                    Open Album <ExternalLink className="w-4 h-4" />
                  </span>
                </a>
              ))}
            </div>
          )}

          {photoAlbums.length > 0 && (
            <p className="text-xs text-muted-foreground mt-10 text-center">
              Albums open in Google Photos &mdash; no account required to browse.
            </p>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
