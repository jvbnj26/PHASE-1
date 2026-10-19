// Admin-chosen display sizes for images. Class strings are written out in full so Tailwind
// generates them.

export type ImageSize = 'sm' | 'md' | 'lg' | 'full';

export const IMAGE_SIZES: ImageSize[] = ['sm', 'md', 'lg', 'full'];

export const DEFAULT_SIZE_LABELS: Record<ImageSize, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  full: 'Full width',
};

export function toImageSize(value: string | undefined | null, fallback: ImageSize): ImageSize {
  return IMAGE_SIZES.includes(value as ImageSize) ? (value as ImageSize) : fallback;
}

/** A standalone image (Donor Categories, "Image only" added sections): max width, centered. */
export const STANDALONE_IMAGE_WIDTH: Record<ImageSize, string> = {
  sm: 'max-w-sm mx-auto',
  md: 'max-w-xl mx-auto',
  lg: 'max-w-3xl mx-auto',
  full: '',
};

/** The image beside text in "Text + Image" added sections — full = fills its half. */
export const SIDE_IMAGE_WIDTH: Record<ImageSize, string> = {
  sm: 'max-w-xs mx-auto',
  md: 'max-w-sm mx-auto',
  lg: 'max-w-md mx-auto',
  full: '',
};

/** Image on a "How to Donate" card (e.g. a QR code) — limits its height; full = natural size. */
export const DONATION_CARD_IMAGE: Record<ImageSize, string> = {
  sm: 'max-h-24',
  md: 'max-h-40',
  lg: 'max-h-56',
  full: '',
};

/** Samaniji photo frames beside the Home welcome text. */
export const HOME_MASTER_PHOTO: Record<ImageSize, string> = {
  sm: 'w-24 h-32 sm:w-32 sm:h-40',
  md: 'w-32 h-40 sm:w-40 sm:h-48 md:w-48 md:h-56',
  lg: 'w-40 h-48 sm:w-48 sm:h-60 md:w-56 md:h-64',
  full: 'w-48 h-60 sm:w-56 sm:h-72 md:w-64 md:h-80',
};

/** Spiritual Guidance Samaniji cards: columns and overall width of the grid. */
export const MASTER_GRID: Record<ImageSize, string> = {
  sm: 'md:grid-cols-3 max-w-5xl',
  md: 'md:grid-cols-2 max-w-2xl',
  lg: 'md:grid-cols-2 max-w-4xl',
  full: 'grid-cols-1 max-w-xl',
};

/** Photo album cover cards (flex-wrap with a 24px gap). */
export const ALBUM_CARD_WIDTH: Record<ImageSize, string> = {
  sm: 'w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]',
  md: 'w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]',
  lg: 'w-full sm:w-[calc(50%-12px)]',
  full: 'w-full max-w-3xl',
};

/** Event flyer cards (flex-wrap with a 2rem gap). */
export const FLYER_CARD_WIDTH: Record<ImageSize, string> = {
  sm: 'w-full sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-6rem)/4)]',
  md: 'w-full sm:w-[calc((100%-2rem)/2)] lg:w-[calc((100%-4rem)/3)]',
  lg: 'w-full sm:w-[calc((100%-2rem)/2)]',
  full: 'w-full max-w-xl',
};

export const PER_ROW_LABELS: Record<ImageSize, string> = {
  sm: 'Small (4 per row)',
  md: 'Medium (3 per row)',
  lg: 'Large (2 per row)',
  full: 'Full width (1 per row)',
};
