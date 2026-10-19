import { findField, pageTextKey, extraSectionId, type ContentPage, type PageLayout } from '@/data/pageContent';
import { isRichTextEmpty } from '@/lib/richText';
import { donationButtonHref } from '@/lib/donationMethods';

/** The text to show for a field: the admin's override if there is one (even empty = hidden), else the default. */
export function resolvePageText(overrides: Record<string, string>, page: ContentPage, field: string): string {
  const key = pageTextKey(page, field);
  if (Object.prototype.hasOwnProperty.call(overrides, key)) return overrides[key] ?? '';
  return findField(page, field)?.default ?? '';
}

export function isFieldEmpty(value: string, kind: string | undefined): boolean {
  return kind === 'rich' ? isRichTextEmpty(value) : !value.trim();
}

/**
 * Button / link destination. Site paths (/about) and in-page anchors (#how-to-donate) are kept
 * as-is; anything else goes through the same check as donation buttons (web, mailto:, tel:).
 */
export function linkHref(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^\/(?!\/)/.test(v) || /^#[\w-]+$/.test(v)) return v;
  return donationButtonHref(v);
}

export const isInternalHref = (href: string) => href.startsWith('/') || href.startsWith('#');

/**
 * Google Maps iframe src from what an admin pasted: an embed link, a whole <iframe> embed code,
 * or a plain street address (embedded through the keyless maps?q= endpoint).
 */
export function mapEmbedSrc(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const src = v.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? v;
  if (/^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed\b/i.test(src)) return src.replace(/&amp;/g, '&');
  if (/^https?:\/\//i.test(src) || /[<>]/.test(src)) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(v)}&output=embed`;
}

/**
 * Final section order for a page: the saved order (dropping sections that no longer exist),
 * with built-in sections that aren't in it yet placed right after their default predecessor,
 * and new Additional Sections appended at the end.
 */
export function resolveSectionOrder(builtinIds: string[], extraBlockIds: string[], saved?: PageLayout | null): string[] {
  const extras = extraBlockIds.map(extraSectionId);
  const known = new Set([...builtinIds, ...extras]);
  const order: string[] = [];
  for (const id of saved?.order ?? []) {
    if (known.has(id) && !order.includes(id)) order.push(id);
  }
  builtinIds.forEach((id, i) => {
    if (order.includes(id)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const idx = order.indexOf(builtinIds[j]);
      if (idx !== -1) { at = idx + 1; break; }
    }
    order.splice(at, 0, id);
  });
  for (const id of extras) if (!order.includes(id)) order.push(id);
  return order;
}
