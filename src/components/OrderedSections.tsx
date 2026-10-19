import { Fragment, type ReactNode } from 'react';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { PageBlockView } from '@/components/PageBlocks';
import { sectionDefs, extraSectionId, type SectionId } from '@/data/pageContent';
import type { SectionPageId } from '@/data/siteContent';
import type { PageBlock } from '@/hooks/useCustomPages';
import { isRichTextEmpty } from '@/lib/richText';
import { resolveSectionOrder } from '@/lib/pageContent';

// A block with no text and no image renders nothing useful — skip it (e.g. a freshly added,
// never-filled section that was saved by accident).
export function blockHasContent(b: PageBlock): boolean {
  return Boolean(b.imageUrl) || !isRichTextEmpty(b.body);
}

/** The movable sections of a page, in display order (built-in and Additional Sections mixed). */
export function useSectionOrder(pageId: SectionPageId) {
  const { pageSections, pageLayout } = useSiteContent();
  const builtinIds = sectionDefs(pageId).filter(([, s]) => !s.fixed).map(([id]) => id);
  const blocks = pageSections[pageId] || [];
  const layout = pageLayout[pageId];
  const order = resolveSectionOrder(builtinIds, blocks.map((b) => b.id), layout);
  return { order, hidden: new Set(layout?.hidden ?? []), blocks };
}

/**
 * Renders a built-in page's sections in the admin-chosen order, skipping hidden ones, with the
 * page's Additional Sections placed wherever they were moved to. `className` goes on the wrapper
 * (used for first/last-section spacing on pages whose sections share one background).
 */
export default function OrderedSections<P extends SectionPageId>({
  pageId,
  sections,
  className,
}: {
  pageId: P;
  sections: Record<Exclude<SectionId<P>, 'hero'>, ReactNode>;
  className?: string;
}) {
  const { order, hidden, blocks } = useSectionOrder(pageId);
  const byId = sections as Record<string, ReactNode>;
  return (
    <div className={className}>
      {order.map((id) => {
        if (hidden.has(id)) return null;
        if (!id.startsWith('extra:')) return <Fragment key={id}>{byId[id]}</Fragment>;
        const block = blocks.find((b) => extraSectionId(b.id) === id);
        if (!block || !blockHasContent(block)) return null;
        return (
          <section key={id} className="py-8 bg-white">
            <div className="container-custom">
              <PageBlockView b={block} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
