import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { ArrowRight, Newspaper } from 'lucide-react';
import BlogImagePlaceholder from '@/components/BlogImagePlaceholder';
import type { RecentPost } from '@/hooks/usePosts';

interface RecentPostsTickerProps {
  posts: RecentPost[];
  loading: boolean;
}

const SCROLL_SPEED_PX_PER_SEC = 18;

function TickerCard({ post }: { post: RecentPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex items-center gap-3 shrink-0 w-64 bg-white border border-border shadow-sm px-5 py-2.5 transition-shadow hover:shadow-md"
      style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
    >
      <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-muted">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <BlogImagePlaceholder className="w-full h-full" />
        )}
      </div>
      <h3
        className="min-w-0 text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.title) }}
      />
    </Link>
  );
}

/** Slim ticker of recent posts above the events grid — auto-scrolls, pauses and hands off to the
 *  user's own wheel/trackpad scroll on hover, then resumes from wherever they left it. */
export default function RecentPostsTicker({ posts, loading }: RecentPostsTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  // Authoritative floating-point scroll offset, tracked independently of the
  // DOM: at ~18px/s a per-tick delta is under 1px, and browsers round
  // scrollLeft writes to whole pixels — reading it back each tick would
  // truncate that fraction away every time and the ticker would never move.
  const positionRef = useRef(0);

  useEffect(() => {
    if (loading || posts.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    positionRef.current = track.scrollLeft;
    let lastTime = performance.now();

    // A plain interval (not requestAnimationFrame) so the ticker keeps
    // advancing even when rAF is suspended — e.g. inside a preview iframe
    // that the host page doesn't treat as "visible".
    const intervalId = window.setInterval(() => {
      const now = performance.now();
      // Clamp dt so a big gap (throttled background tab, slow preview
      // refresh, etc.) doesn't jump the scroll position forward to "catch up".
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!pausedRef.current) {
        positionRef.current += SCROLL_SPEED_PX_PER_SEC * dt;
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0 && positionRef.current >= halfWidth) {
          positionRef.current -= halfWidth;
        }
        track.scrollLeft = positionRef.current;
      }
    }, 30);

    return () => window.clearInterval(intervalId);
  }, [loading, posts.length]);

  // Content is rendered twice back-to-back; once we scroll past the first
  // copy, jump back by exactly its width so the loop is seamless — this
  // fires for both the auto-scroll above and the user's own manual scroll.
  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const halfWidth = track.scrollWidth / 2;
    if (track.scrollLeft >= halfWidth) {
      track.scrollLeft -= halfWidth;
    }
  };

  // Most mice only scroll vertically — translate that into horizontal motion here
  // so hovering + scrolling moves the ticker instead of the page.
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const track = trackRef.current;
    if (!track) return;
    e.preventDefault();
    track.scrollLeft += e.deltaY;
  };

  if (!loading && posts.length === 0) return null;

  return (
    <section className="bg-section border-b border-border">
      <div className="container-custom py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground pl-2.5 pr-3.5 py-1.5 rounded-full shadow-sm">
            <Newspaper className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Recent Posts</span>
          </div>
          <Link
            to="/blog"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 shrink-0 w-64 bg-white border border-border px-5 py-2.5 animate-pulse"
                style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
              >
                <div className="w-10 h-10 rounded bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-section to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-section to-transparent z-10" />
            <div
              ref={trackRef}
              onMouseEnter={() => { pausedRef.current = true; }}
              onMouseLeave={() => {
                pausedRef.current = false;
                // Pick up from wherever manual scrolling left it.
                if (trackRef.current) positionRef.current = trackRef.current.scrollLeft;
              }}
              onScroll={handleScroll}
              onWheel={handleWheel}
              className="flex gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {[...posts, ...posts].map((post, i) => (
                <TickerCard key={`${post.id}-${i}`} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
