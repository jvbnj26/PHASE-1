import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowUp, ArrowDown, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import type { DonationMethod, DonationMethodIcon } from '@/data/siteContent';
import { DONATION_METHOD_ICONS, newDonationMethod } from '@/lib/donationMethods';
import { toRichHtml } from '@/lib/richText';
import { uploadSiteImage } from '@/lib/siteImages';

/** Add / edit / reorder / remove the "How to Donate" cards. */
export default function DonationMethodsEditor({
  methods,
  onChange,
  onUploadingChange,
}: {
  methods: DonationMethod[];
  onChange: (methods: DonationMethod[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  // Uploads finish asynchronously — apply the result to the latest list so edits made meanwhile
  // aren't lost.
  const latest = useRef(methods);
  latest.current = methods;

  const update = (id: string, patch: Partial<DonationMethod>) =>
    onChange(latest.current.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= methods.length) return;
    const next = [...methods];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  const handleImage = async (id: string, file: File | undefined) => {
    if (!file) return;
    setUploadingId(id);
    onUploadingChange?.(true);
    try {
      const url = await uploadSiteImage(file, 'page-images');
      if (latest.current.some((m) => m.id === id)) update(id, { imageUrl: url });
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploadingId(null);
      onUploadingChange?.(false);
    }
  };

  return (
    <div className="space-y-4">
      {methods.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No donation methods yet — add one below.</p>
      )}

      {methods.map((m, idx) => (
        <div key={m.id} className="rounded-lg border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Method {idx + 1}</span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up"><ArrowUp className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(idx, 1)} disabled={idx === methods.length - 1} aria-label="Move down"><ArrowDown className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => onChange(methods.filter((x) => x.id !== m.id))} aria-label="Delete method"><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr,220px] gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={m.title} onChange={(e) => update(m.id, { title: e.target.value })} placeholder="e.g. Zelle" />
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select value={m.icon} onValueChange={(v) => update(m.id, { icon: v as DonationMethodIcon })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(DONATION_METHOD_ICONS) as DonationMethodIcon[]).map((key) => {
                    const { label, Icon } = DONATION_METHOD_ICONS[key];
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="inline-flex items-center gap-2"><Icon className="w-4 h-4" /> {label}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <RichTextEditor
              value={toRichHtml(m.description)}
              onChange={(html) => update(m.id, { description: html })}
              placeholder="One or two lines about this method"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Details <span className="text-muted-foreground font-normal">(optional — shown in a box, e.g. address, account info)</span></Label>
            <RichTextEditor
              value={toRichHtml(m.details)}
              onChange={(html) => update(m.id, { details: html })}
              placeholder="Address, payee, memo, account details…"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Button text <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input value={m.buttonLabel} onChange={(e) => update(m.id, { buttonLabel: e.target.value })} placeholder="e.g. Donate via PayPal" />
            </div>
            <div className="space-y-1.5">
              <Label>Button link</Label>
              <Input value={m.buttonUrl} onChange={(e) => update(m.id, { buttonUrl: e.target.value })} placeholder="https://www.paypal.com/donate/..." />
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-1">The button only appears on the site when it has both text and a link.</p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-background text-sm">
              {uploadingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {uploadingId === m.id ? 'Uploading…' : m.imageUrl ? 'Replace image' : 'Add image (e.g. QR code)'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingId === m.id}
                onChange={(e) => { handleImage(m.id, e.target.files?.[0]); e.target.value = ''; }}
              />
            </label>
            {m.imageUrl && (
              <Button size="sm" variant="ghost" onClick={() => update(m.id, { imageUrl: '' })}>Remove image</Button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Switch id={`rec-${m.id}`} checked={m.recommended} onCheckedChange={(v) => update(m.id, { recommended: v })} />
              <Label htmlFor={`rec-${m.id}`}>Highlight as recommended</Label>
            </div>
          </div>
          {m.imageUrl && <img src={m.imageUrl} alt="" className="max-h-40 rounded border bg-white p-1" />}
        </div>
      ))}

      <Button variant="outline" onClick={() => onChange([...methods, newDonationMethod()])} className="gap-2">
        <Plus className="w-4 h-4" />
        Add donation method
      </Button>
    </div>
  );
}
