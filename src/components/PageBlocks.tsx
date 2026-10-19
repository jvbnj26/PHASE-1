import DOMPurify from 'dompurify';
import type { PageBlock } from '@/hooks/useCustomPages';
import { SIDE_IMAGE_WIDTH, STANDALONE_IMAGE_WIDTH, toImageSize } from '@/lib/imageSize';

// Renders sections built with the admin section editor (src/components/admin/PageBlocksEditor.tsx).
// Shared by custom pages (/p/:slug) and the "Additional Sections" on built-in pages.
export function PageBlockView({ b }: { b: PageBlock }) {
  const text = b.body ? (
    <div
      className="prose max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(b.body) }}
    />
  ) : null;
  const size = b.imageSize ? toImageSize(b.imageSize, 'full') : null;
  const img = b.imageUrl ? (
    <img src={b.imageUrl} alt={b.imageAlt || ''} className="w-full h-auto rounded-lg shadow-md object-cover" />
  ) : null;

  // "Image only" layouts default to contained (image) or full width (image-full).
  if ((b.layout === 'image-full' || b.layout === 'image') && img) {
    const width = STANDALONE_IMAGE_WIDTH[size ?? (b.layout === 'image' ? 'lg' : 'full')];
    return <div className={['my-8', width].filter(Boolean).join(' ')}>{img}</div>;
  }
  const sideImg = img && <div className={size ? SIDE_IMAGE_WIDTH[size] : undefined}>{img}</div>;
  if (b.layout === 'text') {
    return <div className="my-8 max-w-3xl mx-auto">{text}</div>;
  }
  if (b.layout === 'text-image-left' && img) {
    return (
      <div className="my-10 grid md:grid-cols-2 gap-8 items-center">
        {sideImg}
        <div>{text}</div>
      </div>
    );
  }
  // text-image-right (default)
  return (
    <div className="my-10 grid md:grid-cols-2 gap-8 items-center">
      <div>{text}</div>
      {sideImg}
    </div>
  );
}
