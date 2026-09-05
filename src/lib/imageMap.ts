import bannerMahapragya from '@/assets/banner-mahapragya.png';
import samaniSamatvaPragya from '@/assets/samani-samatva-pragya.png';
import samaniAbhayPragya from '@/assets/samani-abhay-pragya.png';
import eventBhikshuBhakti from '@/assets/event-bhikshu-bhakti.jpeg';

/**
 * Some CMS image fields store a short "key" instead of a real URL (legacy default
 * content authored before Supabase Storage uploads existed — see defaultBannerSlides,
 * defaultSpiritualMasters, etc. in data/siteContent.ts). This is the single map from
 * those keys to their bundled assets — every page that renders a CMS image key must
 * go through getImageSrc() here rather than keeping its own copy, so a page can't
 * silently drift out of sync and render a broken <img> for a key the others resolve
 * fine (this happened: the admin banner editor preview used to render banner.imageUrl
 * directly, without this mapping).
 */
export const imageMap: Record<string, string> = {
  'banner-mahapragya': bannerMahapragya,
  'samani-samatva-pragya': samaniSamatvaPragya,
  'samani-abhay-pragya': samaniAbhayPragya,
  'event-bhikshu-bhakti': eventBhikshuBhakti,
};

/** Resolves a CMS image field to a real, renderable src. Empty/missing values fall
 *  back to the placeholder graphic instead of producing a broken <img>. */
export function getImageSrc(imageUrl: string | undefined | null): string {
  if (!imageUrl) return '/placeholder.svg';
  return imageMap[imageUrl] || imageUrl;
}
