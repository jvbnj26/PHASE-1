import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventMediaItem } from '@/data/siteContent';

export default function EventMediaCarousel({
  media, alt, className,
}: { media: EventMediaItem[]; alt: string; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (media.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % media.length), 5000);
    return () => clearInterval(timer);
  }, [media.length]);

  if (media.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % media.length);
  const prev = () => setIndex((i) => (i - 1 + media.length) % media.length);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {media.map((item, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {item.type === 'video' ? (
            <video src={item.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={item.url} alt={alt} className="w-full h-full object-cover" />
          )}
        </div>
      ))}

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prev(); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); next(); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {media.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(i); }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const PLACEHOLDER_IMAGE = '/placeholder.svg';

// Thumbnail (imageUrl) always leads the gallery so it's guaranteed to be the
// first frame shown; the rest of the gallery media follows and auto-rotates.
// The generic placeholder is skipped as a leading frame when real media exists,
// so older events without a dedicated thumbnail don't open on a blank square.
export function eventMediaFor(event: { imageUrl: string; videoUrl?: string; media?: EventMediaItem[] }): EventMediaItem[] {
  const items: EventMediaItem[] = [];
  const seen = new Set<string>();
  const push = (url: string | undefined, type: EventMediaItem['type']) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    items.push({ url, type });
  };

  const hasOtherMedia = Boolean(event.videoUrl) || Boolean(event.media && event.media.length > 0);
  if (!(event.imageUrl === PLACEHOLDER_IMAGE && hasOtherMedia)) {
    push(event.imageUrl, 'image');
  }
  push(event.videoUrl, 'video');
  (event.media || []).forEach((item) => push(item.url, item.type));

  return items;
}
