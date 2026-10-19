import { useEffect, useRef, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { PhotoAlbum } from '@/data/siteContent';
import { normalizeAlbums, validatePhotoAlbums } from '@/lib/photoAlbums';
import { uploadSiteImage } from '@/lib/siteImages';
import { Camera, Plus, Trash2, ArrowUp, ArrowDown, Save, ExternalLink, Images, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

function AlbumImageUpload({ imageUrl, onChange }: { imageUrl?: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      onChange(await uploadSiteImage(file, 'photo-albums'));
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title={imageUrl ? 'Change image' : 'Upload image'}
        className="group relative w-20 h-20 rounded-2xl overflow-hidden bg-muted border-2 border-dashed border-border hover:border-primary transition-colors block"
      >
        {uploading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : imageUrl ? (
          <>
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-[10px] font-medium text-white">Change</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground group-hover:text-primary transition-colors">
            <Images className="w-6 h-6" />
            <span className="text-[10px] font-medium">Add image</span>
          </div>
        )}
      </button>
      {imageUrl && !uploading && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Remove image"
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

export default function AdminPhotosPage() {
  const { photoAlbums, setPhotoAlbums, contentLoaded } = useSiteContent();
  const [draft, setDraft] = useState<PhotoAlbum[]>(photoAlbums);
  const [isDirty, setIsDirty] = useState(false);

  // The context starts with defaults and swaps in DB values once loaded — resync the draft
  // when that happens, unless the admin has already started editing.
  useEffect(() => {
    if (!isDirty) setDraft(photoAlbums);
  }, [photoAlbums, contentLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (next: PhotoAlbum[]) => {
    setDraft(next);
    setIsDirty(true);
  };

  const handleAdd = () => update([...draft, { id: crypto.randomUUID(), name: '', url: '' }]);

  const handleChange = (idx: number, patch: Partial<PhotoAlbum>) =>
    update(draft.map((a, i) => (i === idx ? { ...a, ...patch } : a)));

  const handleMove = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.length) return;
    const next = [...draft];
    [next[idx], next[target]] = [next[target], next[idx]];
    update(next);
  };

  const handleDelete = (idx: number) => update(draft.filter((_, i) => i !== idx));

  const handleSave = () => {
    const cleaned = normalizeAlbums(draft);
    const error = validatePhotoAlbums(cleaned);
    if (error) {
      toast.error(error);
      return;
    }
    setPhotoAlbums(cleaned);
    setDraft(cleaned);
    setIsDirty(false);
    toast.success('Photo albums saved');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Photos</h1>
            <p className="text-muted-foreground mt-2">
              Shared albums shown on the public Photos page, in this order. Add an optional cover image for each album — landscape photos look best.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Album
            </Button>
            <Button onClick={handleSave} disabled={!isDirty} className="gap-2">
              <Save className="w-4 h-4" />
              {isDirty ? 'Save Albums' : 'Saved'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Shared Albums ({draft.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {draft.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No albums yet — click "Add Album" to get started.
              </p>
            )}

            {draft.map((album, idx) => (
              <div key={album.id} className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">Album {idx + 1}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleMove(idx, -1)} disabled={idx === 0} aria-label="Move up">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleMove(idx, 1)} disabled={idx === draft.length - 1} aria-label="Move down">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(idx)} aria-label="Delete album">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <AlbumImageUpload
                    imageUrl={album.imageUrl}
                    onChange={(imageUrl) => handleChange(idx, { imageUrl })}
                  />
                  <div className="flex-1 min-w-0 grid md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor={`album-name-${album.id}`}>Album Name</Label>
                      <Input
                        id={`album-name-${album.id}`}
                        value={album.name}
                        onChange={(e) => handleChange(idx, { name: e.target.value })}
                        placeholder="e.g. Paryushan 2026"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`album-url-${album.id}`}>Shareable Link</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`album-url-${album.id}`}
                          value={album.url}
                          onChange={(e) => handleChange(idx, { url: e.target.value })}
                          placeholder="https://photos.app.goo.gl/..."
                        />
                        {album.url.trim() && (
                          <Button size="icon" variant="outline" asChild aria-label="Test link">
                            <a href={album.url.trim()} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isDirty && (
              <p className="text-xs text-primary">You have unsaved changes — click "Save Albums" to publish them.</p>
            )}

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">How to Get a Google Photos Shared Album Link</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://photos.google.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">Google Photos</a></li>
                <li>Open (or create) the album you want to share</li>
                <li>Click the Share icon → "Create link"</li>
                <li>Copy the generated link and paste it above</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
