import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, EyeOff, ImagePlus, Loader2, RotateCcw, Save, Type } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteContent } from '@/contexts/SiteContentContext';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { PAGE_CONTENT, pageTextKey, type ContentPage, type PageSectionDef, type PageTextField, type SectionId } from '@/data/pageContent';
import { resolvePageText, isFieldEmpty, linkHref, mapEmbedSrc } from '@/lib/pageContent';
import { isRichTextEmpty, toRichHtml } from '@/lib/richText';
import { uploadSiteImage } from '@/lib/siteImages';
import ImageSizePicker from '@/components/admin/ImageSizePicker';
import { DEFAULT_SIZE_LABELS, toImageSize, type ImageSize } from '@/lib/imageSize';

export const adminSectionAnchor = (page: string, section: string) => `page-section-${page}-${section}`;

const stripHtml = (html: string) => html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function FieldPreview({ field, value }: { field: PageTextField; value: string }) {
  if (field.kind === 'size') {
    const labels = field.sizeLabels ?? DEFAULT_SIZE_LABELS;
    return <span className="text-foreground">{labels[toImageSize(value, field.default as ImageSize)]}</span>;
  }
  if (isFieldEmpty(value, field.kind)) return <span className="italic text-muted-foreground">(hidden)</span>;
  if (field.kind === 'image') return <img src={value} alt="" className="h-12 rounded border object-cover" />;
  const text = field.kind === 'rich' ? stripHtml(value) : value;
  return <span className="text-foreground break-words">{text.length > 140 ? `${text.slice(0, 140)}…` : text}</span>;
}

// Rich fields compare by rendered HTML, since the editor wraps plain defaults in <p>.
const sameAsDefault = (field: PageTextField, value: string) =>
  field.kind === 'rich' ? toRichHtml(value) === toRichHtml(field.default) : value === field.default;

function validate(field: PageTextField, value: string): string | null {
  if (!value.trim()) return null;
  if (field.kind === 'url' && !linkHref(value)) {
    return `"${field.label}" isn't a valid link. Use a full web address (https://…), a site page (/about), an anchor (#how-to-donate), mailto: or tel:.`;
  }
  if (field.kind === 'map' && !mapEmbedSrc(value)) {
    return `"${field.label}" isn't a street address or a Google Maps embed link.`;
  }
  return null;
}

/**
 * Edit the fixed text (headings, labels, buttons, links, images) of one page section — see
 * src/data/pageContent.ts. Saves on its own, independent of the page's other editors.
 * Emptying a field hides it on the site; "Reset" brings back the original wording.
 */
export default function PageTextFields<P extends ContentPage>({
  page,
  section,
  className,
}: {
  page: P;
  section: SectionId<P>;
  className?: string;
}) {
  const { pageText, setPageText, pageLayout } = useSiteContent();
  const def = (PAGE_CONTENT[page].sections as Record<string, PageSectionDef>)[section];
  const fields = Object.entries(def.fields);
  const current = (key: string) => resolvePageText(pageText, page, key);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const hiddenOnPage = pageLayout[page]?.hidden?.includes(section);

  if (fields.length === 0) return null;

  const startEditing = () => {
    setDraft(Object.fromEntries(fields.map(([key]) => [key, current(key)])));
    setEditing(true);
  };

  const set = (key: string, value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const handleImage = async (key: string, file: File | undefined) => {
    if (!file) return;
    setUploading(key);
    try {
      set(key, await uploadSiteImage(file, 'page-images'));
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(null);
    }
  };

  const handleSave = () => {
    for (const [key, field] of fields) {
      const error = validate(field, draft[key] ?? '');
      if (error) {
        toast.error(error);
        return;
      }
    }
    const updates: Record<string, string | null> = {};
    for (const [key, field] of fields) {
      let value = draft[key] ?? '';
      if (field.kind === 'rich' && isRichTextEmpty(value)) value = '';
      if (field.kind !== 'rich') value = value.trim();
      // Matching the original wording stores nothing, so future default updates still apply.
      updates[pageTextKey(page, key)] = sameAsDefault(field, value) ? null : value;
    }
    setPageText(updates);
    setEditing(false);
    toast.success(`${def.label} text saved`);
  };

  return (
    <div id={adminSectionAnchor(page, section)} className={['rounded-lg border bg-muted/30 p-4 scroll-mt-6', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          Headings, labels, buttons &amp; images
          {hiddenOnPage && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <EyeOff className="w-3 h-3" /> Section hidden on the site
            </span>
          )}
        </p>
        {editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={uploading !== null} className="gap-1">
              <Save className="w-4 h-4" /> Save text
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={startEditing} className="gap-1">
            <Edit2 className="w-4 h-4" /> Edit text
          </Button>
        )}
      </div>

      {!editing ? (
        <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[minmax(0,14rem),1fr]">
          {fields.map(([key, field]) => (
            <div key={key} className="contents">
              <dt className="text-muted-foreground">{field.label}</dt>
              <dd className="min-w-0"><FieldPreview field={field} value={current(key)} /></dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="space-y-4">
          {fields.map(([key, field]) => {
            const value = draft[key] ?? '';
            const id = `pt-${page}-${key}`;
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor={id}>{field.label}</Label>
                  {!sameAsDefault(field, value) && (
                    <button
                      type="button"
                      onClick={() => set(key, field.default)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset to original
                    </button>
                  )}
                </div>
                {field.kind === 'size' ? (
                  <ImageSizePicker
                    id={id}
                    value={toImageSize(value, field.default as ImageSize)}
                    onChange={(v) => set(key, v)}
                    labels={field.sizeLabels}
                  />
                ) : field.kind === 'rich' ? (
                  <RichTextEditor value={toRichHtml(value)} onChange={(html) => set(key, html)} />
                ) : field.kind === 'image' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    {value && <img src={value} alt="" className="h-16 rounded border object-cover" />}
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer bg-background hover:bg-muted text-sm">
                      {uploading === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                      {uploading === key ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
                      <input
                        id={id}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading !== null}
                        onChange={(e) => { handleImage(key, e.target.files?.[0]); e.target.value = ''; }}
                      />
                    </label>
                    {value && (
                      <Button size="sm" variant="ghost" onClick={() => set(key, '')}>Remove image</Button>
                    )}
                  </div>
                ) : (
                  <Input
                    id={id}
                    value={value}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={field.kind === 'line' ? 'Empty = hidden on the site' : undefined}
                  />
                )}
                {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">Leave a field empty to hide it on the site.</p>
        </div>
      )}
    </div>
  );
}

/** A section's text editor in its own card, for sections that have no other admin card. */
export function PageTextCard<P extends ContentPage>({
  page,
  section,
  title,
  description,
}: {
  page: P;
  section: SectionId<P>;
  title?: string;
  description?: string;
}) {
  const def = (PAGE_CONTENT[page].sections as Record<string, PageSectionDef>)[section];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? def.label}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <PageTextFields page={page} section={section} />
      </CardContent>
    </Card>
  );
}
