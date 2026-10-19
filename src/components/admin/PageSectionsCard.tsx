import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { SECTION_PAGES, type SectionPageId } from '@/data/siteContent';
import type { PageBlock } from '@/hooks/useCustomPages';
import PageBlocksEditor from '@/components/admin/PageBlocksEditor';
import { uploadSiteImage } from '@/lib/siteImages';

const uploadSectionImage = (file: File) => uploadSiteImage(file, 'page-sections');

/** "Additional Sections" editor for a built-in page — same section builder as Admin > Pages. */
export default function PageSectionsCard({ pageId }: { pageId: SectionPageId }) {
  const { pageSections, setPageSections } = useSiteContent();
  const saved = pageSections[pageId] || [];
  const [draft, setDraft] = useState<PageBlock[]>(saved);
  const [isDirty, setIsDirty] = useState(false);

  // Saved sections arrive from the database after mount — show them unless editing has started.
  useEffect(() => {
    if (!isDirty) setDraft(pageSections[pageId] || []);
  }, [pageSections, pageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (blocks: PageBlock[]) => {
    setDraft(blocks);
    setIsDirty(true);
  };

  const handleSave = () => {
    setPageSections(pageId, draft);
    setIsDirty(false);
    toast.success('Sections saved');
  };

  const handleDiscard = () => {
    setDraft(saved);
    setIsDirty(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Additional Sections
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Add your own sections to the bottom of the {SECTION_PAGES[pageId]} page — text, images, or both.
            </p>
          </div>
          <div className="flex gap-2">
            {isDirty && (
              <Button variant="outline" onClick={handleDiscard}>Discard</Button>
            )}
            <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
              <Save className="w-4 h-4" />
              {isDirty ? 'Save Sections' : 'Saved'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <PageBlocksEditor blocks={draft} onChange={handleChange} onUploadImage={uploadSectionImage} />
        {isDirty && (
          <p className="text-xs text-primary">You have unsaved section changes — click "Save Sections" to publish them.</p>
        )}
      </CardContent>
    </Card>
  );
}
