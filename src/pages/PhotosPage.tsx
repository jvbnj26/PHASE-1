import PublicLayout from '@/components/layout/PublicLayout';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { ArrowUpRight, Camera, Images } from 'lucide-react';

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
              {photoAlbums.map((album) => (
                <a
                  key={album.id}
                  href={album.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open the ${album.name} album (opens in a new tab)`}
                  className="group flex flex-col w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {/* Cover — fills most of the card; albums without an image get a branded placeholder of the same size */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {album.imageUrl ? (
                      <img
                        src={album.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/85 to-primary/65 flex items-center justify-center">
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                        />
                        <Images className="relative w-16 h-16 text-primary-foreground/90 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Title bar */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-lg text-foreground leading-snug break-words">{album.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">View album</p>
                    </div>
                    <span className="shrink-0 w-10 h-10 rounded-full border border-primary/30 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <ArrowUpRight className="w-5 h-5" />
                    </span>
                  </div>
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
