import DOMPurify from 'dompurify';
import { toRichHtml } from '@/lib/richText';

/**
 * Displays a site-content text field edited with the admin rich-text editor (or legacy plain
 * text). Font size and color come from `className`, so each page keeps its own design — only
 * the formatting inside (bold, lists, headings, links, …) is added. Use `onDark` on colored
 * backgrounds so headings and links stay readable.
 */
export default function RichText({
  value,
  className,
  splitLines,
  onDark,
}: {
  value: string | undefined | null;
  className?: string;
  splitLines?: boolean;
  onDark?: boolean;
}) {
  const html = DOMPurify.sanitize(toRichHtml(value, { splitLines }));
  if (!html) return null;
  return (
    <div
      // Plain join, not cn(): tailwind-merge drops `leading-*` when a font-size class follows it,
      // which would change line height compared with the original markup.
      className={['rich-text', onDark && 'rich-text-on-dark', className].filter(Boolean).join(' ')}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
