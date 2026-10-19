import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ImagePlus, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import type { PageBlock } from '@/hooks/useCustomPages';
import { toast } from 'sonner';

// Single unified template: every block has an optional heading, body text, and image.
// Layout choice controls how text + image are arranged — formatting handled for the user.
export function newBlock(): PageBlock {
  return {
    id: crypto.randomUUID(),
    layout: 'text-image-right',
    body: '',
    imageUrl: '',
  };
}

const LAYOUT_OPTIONS: { value: PageBlock['layout']; label: string; hint: string }[] = [
  { value: 'text-image-right', label: 'Text + Image (image on right)', hint: 'Balanced — best for most sections' },
  { value: 'text-image-left', label: 'Text + Image (image on left)', hint: 'Alternate layout for variety' },
  { value: 'text', label: 'Text only', hint: 'Paragraphs without an image' },
  { value: 'image', label: 'Image only', hint: 'Standalone image, contained width' },
  { value: 'image-full', label: 'Full-width banner image', hint: 'Use for hero / flyer images' },
];

// The section builder used by Admin > Pages and by the "Additional Sections" card on built-in
// page editors. `onUploadImage` turns a picked file into the URL stored on the block.
export default function PageBlocksEditor({
  blocks,
  onChange,
  onUploadImage,
}: {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  onUploadImage: (file: File) => Promise<string>;
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  // Uploads finish asynchronously — apply the result to the latest blocks, not the ones captured
  // when the upload started, so edits made in the meantime aren't lost.
  const latestBlocks = useRef(blocks);
  latestBlocks.current = blocks;

  function updateBlock(idx: number, patch: Partial<PageBlock>) {
    const next = [...blocks];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  }
  function moveBlock(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  }
  function removeBlock(idx: number) {
    onChange(blocks.filter((_, i) => i !== idx));
  }
  function addBlock() {
    onChange([...blocks, newBlock()]);
  }
  async function handleImage(idx: number, file: File | undefined) {
    if (!file) return;
    const id = blocks[idx].id;
    setUploadingId(id);
    try {
      const url = await onUploadImage(file);
      const current = latestBlocks.current;
      if (current.some((b) => b.id === id)) {
        onChange(current.map((b) => (b.id === id ? { ...b, imageUrl: url } : b)));
      }
    } catch (err) {
      toast.error(`Image upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Content sections</h3>
          <p className="text-xs text-muted-foreground">Each section uses the same template: heading + text + optional image. Pick a layout — spacing & styling are automatic.</p>
        </div>
        <Button size="sm" variant="secondary" onClick={addBlock}><Plus className="w-4 h-4" /> Add section</Button>
      </div>

      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No sections yet — add one to get started.</p>
      )}

      {blocks.map((b, idx) => (
        <Card key={b.id} className="p-4 space-y-3 bg-muted/40">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Select value={b.layout} onValueChange={(v) => updateBlock(idx, { layout: v as PageBlock['layout'] })}>
              <SelectTrigger className="w-full sm:w-[300px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LAYOUT_OPTIONS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    <div>
                      <div>{l.label}</div>
                      <div className="text-xs text-muted-foreground">{l.hint}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => moveBlock(idx, -1)} aria-label="Move section up"><ArrowUp className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => moveBlock(idx, 1)} aria-label="Move section down"><ArrowDown className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => removeBlock(idx)} aria-label="Delete section"><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>

          {b.layout !== 'image' && b.layout !== 'image-full' && (
            <RichTextEditor
              value={b.body || ''}
              onChange={(html) => updateBlock(idx, { body: html })}
              placeholder="Write this section's content — pick a heading style from the dropdown, or just start typing..."
            />
          )}

          {b.layout !== 'text' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-background text-sm">
                  {uploadingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {uploadingId === b.id ? 'Uploading…' : b.imageUrl ? 'Replace image' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === b.id}
                    onChange={(e) => { handleImage(idx, e.target.files?.[0]); e.target.value = ''; }}
                  />
                </label>
                {b.imageUrl && <Button size="sm" variant="ghost" onClick={() => updateBlock(idx, { imageUrl: '' })}>Remove</Button>}
              </div>
              {b.imageUrl && (
                <img src={b.imageUrl} alt="" className="max-h-48 rounded border" />
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
