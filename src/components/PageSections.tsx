import { useSiteContent } from '@/contexts/SiteContentContext';
import { PageBlockView } from '@/components/PageBlocks';
import type { SectionPageId } from '@/data/siteContent';
import type { PageBlock } from '@/hooks/useCustomPages';
import { isRichTextEmpty } from '@/lib/richText';

// A block with no text and no image renders nothing useful — skip it (e.g. a freshly added,
// never-filled section that was saved by accident).
function hasContent(b: PageBlock): boolean {
  return Boolean(b.imageUrl) || !isRichTextEmpty(b.body);
}

/** "Additional Sections" an admin added to a built-in page, rendered at the bottom of it. */
export default function PageSections({ pageId }: { pageId: SectionPageId }) {
  const { pageSections } = useSiteContent();
  const blocks = (pageSections[pageId] || []).filter(hasContent);
  if (blocks.length === 0) return null;
  return (
    <section className="py-8 bg-white">
      <div className="container-custom">
        {blocks.map((b) => (
          <PageBlockView key={b.id} b={b} />
        ))}
      </div>
    </section>
  );
}
