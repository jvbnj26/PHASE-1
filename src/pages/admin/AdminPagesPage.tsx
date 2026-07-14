import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ImagePlus, ArrowUp, ArrowDown, ExternalLink, Save, FileText, Lock, Send, Archive, RotateCcw, FileEdit } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCustomPages, slugify, type PageBlock, type CustomPage, type PageStatus } from '@/hooks/useCustomPages';
import { toast } from 'sonner';

// Built-in site pages — managed via their own editors
const BUILTIN_PAGES = [
  { title: 'Home', path: '/', admin: '/admin/home' },
  { title: 'About Us', path: '/about', admin: '/admin/about' },
  { title: 'Events', path: '/events', admin: '/admin/events' },
  { title: 'Activities', path: '/activities', admin: '/admin/activities' },
  { title: 'Calendar', path: '/calendar', admin: '/admin/settings' },
  { title: 'Spiritual Guidance', path: '/spiritual-guidance', admin: '/admin/spiritual-guidance' },
  { title: 'Volunteer / Get Involved', path: '/volunteer', admin: '/admin/volunteer' },
  { title: 'Donate', path: '/donate', admin: '/admin/donations' },
  { title: 'Contact Us', path: '/contact', admin: '/admin/contact' },
  { title: 'Board & EC Members', path: '/about#board', admin: '/admin/board' },
];

function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

// Single unified template: every block has an optional heading, body text, and image.
// Layout choice controls how text + image are arranged — formatting handled for the user.
function newBlock(): PageBlock {
  return {
    id: crypto.randomUUID(),
    layout: 'text-image-right',
    heading: '',
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

export default function AdminPagesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { pages, refresh } = useCustomPages();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomPage | null>(null);
  const [statusFilter, setStatusFilter] = useState<PageStatus>('published');

  const [newTitle, setNewTitle] = useState('');
  const [newParent, setNewParent] = useState<string>('none');

  useEffect(() => {
    if (selectedId) {
      const p = pages.find((x) => x.id === selectedId);
      if (p) setDraft({ ...p, blocks: [...p.blocks] });
    } else {
      setDraft(null);
    }
  }, [selectedId, pages]);

  if (!authLoading && !isAuthenticated) return <Navigate to="/admin" replace />;

  const filteredPages = pages.filter((p) => p.status === statusFilter);
  const topLevel = filteredPages.filter((p) => !p.parent_slug);
  const parentOptions = pages.filter((p) => !p.parent_slug);

  const statusCounts = {
    published: pages.filter((p) => p.status === 'published').length,
    draft: pages.filter((p) => p.status === 'draft').length,
    archived: pages.filter((p) => p.status === 'archived').length,
  };

  async function handleCreate(asStatus: PageStatus) {
    if (!newTitle.trim()) return toast.error('Title required');
    const slug = slugify(newTitle);
    const parent_slug = newParent === 'none' ? null : newParent;
    const { data, error } = await supabase
      .from('custom_pages')
      .insert({ title: newTitle.trim(), slug, parent_slug, blocks: [newBlock()] as any, status: asStatus })
      .select()
      .single();
    if (error) return toast.error(error.message);
    toast.success(asStatus === 'draft' ? 'Draft saved' : 'Page published');
    setNewTitle('');
    setNewParent('none');
    setStatusFilter(asStatus);
    await refresh();
    setSelectedId(data!.id);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    const { error } = await supabase.from('custom_pages').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Page deleted');
    setSelectedId(null);
    refresh();
  }

  async function handleSave(overrideStatus?: PageStatus) {
    if (!draft) return;
    const nextStatus = overrideStatus ?? draft.status;
    const { error } = await supabase
      .from('custom_pages')
      .update({ title: draft.title, blocks: draft.blocks as any, status: nextStatus })
      .eq('id', draft.id);
    if (error) return toast.error(error.message);
    const msg =
      overrideStatus === 'published' ? 'Published' :
      overrideStatus === 'archived' ? 'Archived' :
      overrideStatus === 'draft' ? 'Moved to drafts' :
      draft.status === 'draft' ? 'Draft saved' : 'Saved';
    toast.success(msg);
    if (overrideStatus) {
      setDraft({ ...draft, status: overrideStatus });
      setStatusFilter(overrideStatus);
    }
    refresh();
  }

  function updateBlock(idx: number, patch: Partial<PageBlock>) {
    if (!draft) return;
    const blocks = [...draft.blocks];
    blocks[idx] = { ...blocks[idx], ...patch };
    setDraft({ ...draft, blocks });
  }
  function moveBlock(idx: number, dir: -1 | 1) {
    if (!draft) return;
    const j = idx + dir;
    if (j < 0 || j >= draft.blocks.length) return;
    const blocks = [...draft.blocks];
    [blocks[idx], blocks[j]] = [blocks[j], blocks[idx]];
    setDraft({ ...draft, blocks });
  }
  function removeBlock(idx: number) {
    if (!draft) return;
    setDraft({ ...draft, blocks: draft.blocks.filter((_, i) => i !== idx) });
  }
  function addBlock() {
    if (!draft) return;
    setDraft({ ...draft, blocks: [...draft.blocks, newBlock()] });
  }
  async function handleImage(idx: number, file: File | undefined) {
    if (!file) return;
    const url = await fileToDataUrl(file);
    updateBlock(idx, { imageUrl: url });
  }

  const publicHref = draft
    ? draft.parent_slug
      ? `/p/${draft.parent_slug}/${draft.slug}`
      : `/p/${draft.slug}`
    : '#';

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Pages</h1>
          <p className="text-muted-foreground mt-1">
            View every page on the website. Add new pages or delete custom ones. All edits use one consistent template — just fill in text and images, formatting is handled for you.
          </p>
        </div>

        {/* Built-in pages */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-serif text-lg font-bold">Built-in Site Pages</h2>
            <span className="text-xs text-muted-foreground">(can't be deleted — edit via their dedicated editors)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {BUILTIN_PAGES.map((p) => (
              <div key={p.path} className="flex items-center justify-between border rounded-md px-3 py-2 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{p.title}</span>
                  <code className="text-xs text-muted-foreground">{p.path}</code>
                </div>
                <div className="flex gap-1">
                  <a href={p.path} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                  </a>
                  <Link to={p.admin}>
                    <Button size="sm" variant="outline">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Custom pages manager */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <h2 className="font-semibold text-sm">Create new page</h2>
              <Input placeholder="Page title (e.g. 'Newsletter')" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Select value={newParent} onValueChange={setNewParent}>
                <SelectTrigger><SelectValue placeholder="Parent page" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Top-level page —</SelectItem>
                  {parentOptions.map((p) => (
                    <SelectItem key={p.id} value={p.slug}>Subpage of: {p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleCreate('draft')}>
                  <FileEdit className="w-4 h-4" /> Save draft
                </Button>
                <Button onClick={() => handleCreate('published')}>
                  <Send className="w-4 h-4" /> Publish
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Drafts are saved but hidden from the public site until you publish them.
              </p>
            </Card>

            <Card className="p-4">
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as PageStatus)} className="mb-3">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="published">Published <span className="ml-1 text-xs opacity-70">({statusCounts.published})</span></TabsTrigger>
                  <TabsTrigger value="draft">Drafts <span className="ml-1 text-xs opacity-70">({statusCounts.draft})</span></TabsTrigger>
                  <TabsTrigger value="archived">Archived <span className="ml-1 text-xs opacity-70">({statusCounts.archived})</span></TabsTrigger>
                </TabsList>
              </Tabs>
              {filteredPages.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {statusFilter === 'draft' && 'No drafts yet.'}
                  {statusFilter === 'archived' && 'Nothing archived.'}
                  {statusFilter === 'published' && 'No published custom pages.'}
                </p>
              )}
              <ul className="space-y-1">
                {topLevel.map((p) => {
                  const kids = filteredPages.filter((x) => x.parent_slug === p.slug);
                  return (
                    <li key={p.id}>
                      <button
                        onClick={() => setSelectedId(p.id)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted ${selectedId === p.id ? 'bg-muted font-medium' : ''}`}
                      >
                        {p.title}
                      </button>
                      {kids.length > 0 && (
                        <ul className="pl-4 border-l ml-2">
                          {kids.map((k) => (
                            <li key={k.id}>
                              <button
                                onClick={() => setSelectedId(k.id)}
                                className={`w-full text-left px-2 py-1 rounded text-xs hover:bg-muted ${selectedId === k.id ? 'bg-muted font-medium' : ''}`}
                              >
                                ↳ {k.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>

          </div>

          <div>
            {!draft ? (
              <Card className="p-10 text-center text-muted-foreground">
                Select a custom page on the left, or create a new one to begin editing.
              </Card>
            ) : (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-xs">Page title</Label>
                      <Badge
                        variant={draft.status === 'published' ? 'default' : draft.status === 'draft' ? 'secondary' : 'outline'}
                        className="uppercase text-[10px] tracking-wide"
                      >
                        {draft.status}
                      </Badge>
                    </div>
                    <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL: <code>{publicHref}</code>
                      {draft.status !== 'published' && <span className="ml-2 italic">(not visible on the public site)</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <a href={publicHref} target="_blank" rel="noreferrer">
                      <Button variant="outline"><ExternalLink className="w-4 h-4" /> View</Button>
                    </a>
                    <Button variant="destructive" onClick={() => handleDelete(draft.id)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                    <Button variant="secondary" onClick={() => handleSave()}>
                      <Save className="w-4 h-4" /> Save {draft.status === 'draft' ? 'draft' : 'changes'}
                    </Button>
                    {draft.status !== 'published' && (
                      <Button onClick={() => handleSave('published')}>
                        <Send className="w-4 h-4" /> Publish
                      </Button>
                    )}
                    {draft.status === 'published' && (
                      <>
                        <Button variant="outline" onClick={() => handleSave('draft')}>
                          <FileEdit className="w-4 h-4" /> Move to drafts
                        </Button>
                        <Button variant="outline" onClick={() => handleSave('archived')}>
                          <Archive className="w-4 h-4" /> Archive
                        </Button>
                      </>
                    )}
                    {draft.status === 'archived' && (
                      <Button variant="outline" onClick={() => handleSave('draft')}>
                        <RotateCcw className="w-4 h-4" /> Restore to draft
                      </Button>
                    )}
                  </div>
                </div>


                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Content sections</h3>
                      <p className="text-xs text-muted-foreground">Each section uses the same template: heading + text + optional image. Pick a layout — spacing & styling are automatic.</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={addBlock}><Plus className="w-4 h-4" /> Add section</Button>
                  </div>

                  {draft.blocks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No sections yet — add one to get started.</p>
                  )}

                  {draft.blocks.map((b, idx) => (
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
                          <Button size="icon" variant="ghost" onClick={() => moveBlock(idx, -1)}><ArrowUp className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => moveBlock(idx, 1)}><ArrowDown className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => removeBlock(idx)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </div>

                      {b.layout !== 'image' && b.layout !== 'image-full' && (
                        <>
                          <Input placeholder="Heading (optional)" value={b.heading || ''} onChange={(e) => updateBlock(idx, { heading: e.target.value })} />
                          <Textarea placeholder="Body text" rows={4} value={b.body || ''} onChange={(e) => updateBlock(idx, { body: e.target.value })} />
                        </>
                      )}

                      {b.layout !== 'text' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-background text-sm">
                              <ImagePlus className="w-4 h-4" />
                              {b.imageUrl ? 'Replace image' : 'Upload image'}
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(idx, e.target.files?.[0])} />
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
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
