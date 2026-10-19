import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowDown, ArrowUp, LayoutList, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { sectionDefs, extraSectionId } from '@/data/pageContent';
import { SECTION_PAGES, type SectionPageId } from '@/data/siteContent';
import { resolveSectionOrder } from '@/lib/pageContent';
import { adminSectionAnchor } from '@/components/admin/PageTextFields';
import { PAGE_SECTIONS_CARD_ID } from '@/components/admin/PageSectionsCard';

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Order and visibility of a built-in page's sections — built-in ones and the page's Additional
 * Sections in one list, so added sections can go anywhere on the page.
 */
export default function PageLayoutCard({ pageId }: { pageId: SectionPageId }) {
  const { pageLayout, setPageLayout, pageSections } = useSiteContent();
  const builtins = sectionDefs(pageId).filter(([, s]) => !s.fixed);
  const builtinIds = builtins.map(([id]) => id);
  const blocks = pageSections[pageId] || [];
  const saved = pageLayout[pageId];

  const [draft, setDraft] = useState({ order: saved?.order ?? [], hidden: saved?.hidden ?? [] });
  const [isDirty, setIsDirty] = useState(false);

  // The saved layout arrives from the database after mount — show it unless editing has started.
  useEffect(() => {
    if (!isDirty) setDraft({ order: pageLayout[pageId]?.order ?? [], hidden: pageLayout[pageId]?.hidden ?? [] });
  }, [pageLayout, pageId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Always resolved, so sections added or deleted meanwhile show up / drop out immediately.
  const order = resolveSectionOrder(builtinIds, blocks.map((b) => b.id), draft);
  const hidden = new Set(draft.hidden);

  const labelFor = (id: string) => {
    const builtin = builtins.find(([b]) => b === id);
    if (builtin) return { label: builtin[1].label, added: false };
    const block = blocks.find((b) => extraSectionId(b.id) === id);
    const text = block ? stripHtml(block.body || '') : '';
    const snippet = text ? (text.length > 50 ? `${text.slice(0, 50)}…` : text) : block?.imageUrl ? 'Image' : 'Empty section';
    return { label: snippet, added: true };
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    setDraft((d) => ({ ...d, order: next }));
    setIsDirty(true);
  };

  const toggle = (id: string, visible: boolean) => {
    setDraft((d) => ({ order: order, hidden: visible ? d.hidden.filter((h) => h !== id) : [...d.hidden, id] }));
    setIsDirty(true);
  };

  const jumpTo = (id: string) => {
    const target = document.getElementById(id.startsWith('extra:') ? PAGE_SECTIONS_CARD_ID : adminSectionAnchor(pageId, id));
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSave = () => {
    const known = new Set(order);
    setPageLayout(pageId, { order, hidden: draft.hidden.filter((h) => known.has(h)) });
    setIsDirty(false);
    toast.success('Section order saved');
  };

  const handleDiscard = () => {
    setDraft({ order: saved?.order ?? [], hidden: saved?.hidden ?? [] });
    setIsDirty(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-primary" />
              Section Order &amp; Visibility
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Reorder the sections of the {SECTION_PAGES[pageId]} page, including ones you added below, or hide a section
              without deleting it. The page banner always stays at the top.
            </p>
          </div>
          <div className="flex gap-2">
            {isDirty && <Button variant="outline" onClick={handleDiscard}>Discard</Button>}
            <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
              <Save className="w-4 h-4" />
              {isDirty ? 'Save Order' : 'Saved'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="divide-y rounded-lg border">
          {order.map((id, idx) => {
            const { label, added } = labelFor(id);
            const visible = !hidden.has(id);
            return (
              <li key={id} className={`flex items-center gap-3 px-3 py-2 ${visible ? '' : 'bg-muted/50'}`}>
                <span className="w-6 text-center text-xs font-semibold text-muted-foreground">{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => jumpTo(id)}
                  className={`flex-1 min-w-0 text-left text-sm hover:text-primary truncate ${visible ? 'text-foreground' : 'text-muted-foreground line-through'}`}
                  title="Go to this section's editor"
                >
                  {added && <span className="mr-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Added</span>}
                  {label}
                </button>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={visible} onCheckedChange={(v) => toggle(id, v)} aria-label={`Show ${label}`} />
                  <span className="hidden sm:inline w-12">{visible ? 'Shown' : 'Hidden'}</span>
                </label>
                <div className="flex">
                  <Button size="icon" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up"><ArrowUp className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === order.length - 1} aria-label="Move down"><ArrowDown className="w-4 h-4" /></Button>
                </div>
              </li>
            );
          })}
        </ol>
        {isDirty && <p className="text-xs text-primary mt-3">Unsaved changes — click "Save Order" to publish them.</p>}
      </CardContent>
    </Card>
  );
}
