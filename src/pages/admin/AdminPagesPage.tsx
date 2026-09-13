import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ImagePlus, ArrowUp, ArrowDown, ExternalLink, Save, FileText, Lock, Send, Archive, RotateCcw, FileEdit, ArrowUpDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCustomPages, slugify, type PageBlock, type CustomPage, type PageStatus } from '@/hooks/useCustomPages';
import { BUILTIN_NAV_ITEMS, orderTopLevelPages, builtinPathToSegment, RESERVED_PARENT_SLUGS } from '@/data/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';

// Built-in site pages — managed via their own editors.
//
// This list is the source of truth checked by src/App.pageRegistry.test.tsx: every hardcoded
// public route in App.tsx must either live here (a "built-in" page with a dedicated admin
// editor) or be created through the custom pages CMS below (stored in `custom_pages`, always
// automatically listed & mutable). A route in neither place fails that test — that's the class
// of bug that let the Gyanshala page ship hardcoded with no editor and no listing here.
export const BUILTIN_PAGES = [
  { title: 'Home', path: '/', admin: '/admin/home' },
  { title: 'About Us', path: '/about', admin: '/admin/about' },
  { title: 'Leadership', path: '/about/leadership', admin: '/admin/board' },
  { title: 'Events', path: '/events', admin: '/admin/events' },
  { title: 'Activities', path: '/activities', admin: '/admin/activities' },
  { title: 'Gyanshala', path: '/activities/gyanshala', admin: '/admin/gyanshala' },
  { title: 'Calendar', path: '/calendar', admin: '/admin/settings' },
  { title: 'Photos', path: '/photos', admin: '/admin/settings' },
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
    body: '',
    imageUrl: '',
  };
}

// Renders one parent's list of sub-pages with reorder arrows — shared by both a custom page's
// own kids and a built-in page's kids (see the two call sites below).
function SubpageList({
  kids, selectedId, setSelectedId, movePage,
}: {
  kids: CustomPage[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  movePage: (list: CustomPage[], idx: number, dir: -1 | 1) => void;
}) {
  if (kids.length === 0) return null;
  return (
    <ul className="pl-4 border-l ml-2">
      {kids.map((k, kidx) => (
        <li key={k.id}>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedId(k.id)}
              className={`flex-1 text-left px-2 py-1 rounded text-xs hover:bg-muted ${selectedId === k.id ? 'bg-muted font-medium' : ''}`}
            >
              ↳ {k.title}
            </button>
            <Button
              size="icon" variant="ghost" className="h-5 w-5 shrink-0"
              disabled={kidx === 0}
              onClick={() => movePage(kids, kidx, -1)}
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              size="icon" variant="ghost" className="h-5 w-5 shrink-0"
              disabled={kidx === kids.length - 1}
              onClick={() => movePage(kids, kidx, 1)}
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
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
  const { pageOrder, setPageOrder } = useSiteContent();
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

  // "Site Navigation Order" — every top-level page, built-in and custom, merged into one
  // reorderable list. Only *published* top-level custom pages are included: drafts/archived
  // pages have no nav position to control yet. Sub-pages/submenu items aren't part of this —
  // they nest under whichever top-level item they belong to and keep their own ordering.
  const navPages = [
    ...BUILTIN_NAV_ITEMS.map((item) => ({
      id: item.path,
      title: item.name,
      kind: 'builtin' as const,
      publicPath: item.path,
      adminPath: item.admin,
    })),
    ...pages
      .filter((p) => p.status === 'published' && !p.parent_slug)
      .map((p) => ({
        id: `custom:${p.id}`,
        title: p.title,
        kind: 'custom' as const,
        publicPath: `/p/${p.slug}`,
        adminPath: null as string | null,
        pageId: p.id,
      })),
  ];
  const orderedNavPages = orderTopLevelPages(navPages, pageOrder);

  async function moveNavPage(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= orderedNavPages.length) return;
    const ids = orderedNavPages.map((p) => p.id);
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    setPageOrder(ids);
    toast.success('Navigation order updated');
  }

  const statusCounts = {
    published: pages.filter((p) => p.status === 'published').length,
    draft: pages.filter((p) => p.status === 'draft').length,
    archived: pages.filter((p) => p.status === 'archived').length,
  };

  async function handleCreate(asStatus: PageStatus) {
    if (!newTitle.trim()) return toast.error('Title required');
    const slug = slugify(newTitle);
    // A built-in parent is selected as `builtin:<segment>` (see the Select below) — unwrap it
    // to the plain segment (e.g. 'about'), which is what actually gets stored as parent_slug
    // and what the /p/:parent/:slug route matches against.
    const parent_slug = newParent === 'none'
      ? null
      : newParent.startsWith('builtin:')
        ? newParent.slice('builtin:'.length)
        : newParent;
    // A top-level page can't take a slug reserved for a built-in page's own segment (e.g.
    // "about") — that would make /p/:parent/:slug ambiguous between "a subpage of this custom
    // page" and "a subpage of the built-in About page". Sub-pages have no such restriction.
    if (parent_slug === null && RESERVED_PARENT_SLUGS.has(slug)) {
      return toast.error(`"${newTitle.trim()}" is too close to a built-in page's URL — try a different title.`);
    }
    // New pages join the end of their sibling group (same parent_slug) by default.
    const sort_order = pages.filter((p) => p.parent_slug === parent_slug).length;
    const { data, error } = await supabase
      .from('custom_pages')
      .insert({ title: newTitle.trim(), slug, parent_slug, blocks: [newBlock()] as any, status: asStatus, sort_order })
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

  // Swaps sort_order between two adjacent pages in the given (already-filtered) list — this
  // is what controls both the order pages appear in this sidebar and the order they appear in
  // the public nav dropdown (Header.tsx sorts custom pages by sort_order).
  async function movePage(list: CustomPage[], idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[idx];
    const b = list[j];
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('custom_pages').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('custom_pages').update({ sort_order: a.sort_order }).eq('id', b.id),
    ]);
    if (e1 || e2) return toast.error((e1 || e2)!.message);
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

        {/* Site navigation order — every top-level page, built-in and custom, in one reorderable list */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-serif text-lg font-bold">Site Navigation Order</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Controls the order every page — built-in or custom — appears in the site's top navigation menu.
            Sub-pages and submenu items keep their own order under whichever page they belong to.
          </p>
          <ul className="divide-y rounded-md border">
            {orderedNavPages.map((p, idx) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                <span className="text-xs text-muted-foreground w-5 text-right tabular-nums">{idx + 1}</span>
                <Badge variant={p.kind === 'builtin' ? 'outline' : 'secondary'} className="text-[10px] uppercase tracking-wide shrink-0">
                  {p.kind === 'builtin' ? 'Built-in' : 'Custom'}
                </Badge>
                <span className="text-sm font-medium flex-1 truncate">{p.title}</span>
                <code className="text-xs text-muted-foreground hidden sm:inline">{p.publicPath}</code>
                <div className="flex gap-1 shrink-0">
                  <a href={p.publicPath} target="_blank" rel="noreferrer">
                    <Button size="icon" variant="ghost" className="h-7 w-7"><ExternalLink className="w-3.5 h-3.5" /></Button>
                  </a>
                  {p.kind === 'builtin' ? (
                    <Link to={p.adminPath!}>
                      <Button size="sm" variant="outline" className="h-7">Edit</Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7" onClick={() => setSelectedId(p.pageId!)}>Edit</Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === 0} onClick={() => moveNavPage(idx, -1)}>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" disabled={idx === orderedNavPages.length - 1} onClick={() => moveNavPage(idx, 1)}>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

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
                  {BUILTIN_NAV_ITEMS.map((item) => (
                    <SelectItem key={item.path} value={`builtin:${builtinPathToSegment(item.path)}`}>
                      Subpage of: {item.name} (built-in)
                    </SelectItem>
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
              {(topLevel.some((p) => filteredPages.some((x) => x.parent_slug === p.slug)) ||
                BUILTIN_NAV_ITEMS.some((item) => filteredPages.some((x) => x.parent_slug === builtinPathToSegment(item.path)))) && (
                <p className="text-xs text-muted-foreground mb-2">
                  Use the arrows to reorder sub-pages. Top-level order is set in "Site Navigation Order" above.
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
                      <SubpageList kids={kids} selectedId={selectedId} setSelectedId={setSelectedId} movePage={movePage} />
                    </li>
                  );
                })}
                {/* Sub-pages nested under a built-in page (e.g. a subpage of "About Us") — the
                    built-in page itself is edited via its own dedicated editor, listed below, so
                    this row exists only to group and reorder any custom sub-pages under it. */}
                {BUILTIN_NAV_ITEMS.map((item) => {
                  const segment = builtinPathToSegment(item.path);
                  const kids = filteredPages.filter((x) => x.parent_slug === segment);
                  if (kids.length === 0) return null;
                  return (
                    <li key={`builtin:${segment}`}>
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground">
                        <Lock className="w-3 h-3" /> {item.name}
                        <span className="text-[10px] uppercase tracking-wide">(built-in)</span>
                      </div>
                      <SubpageList kids={kids} selectedId={selectedId} setSelectedId={setSelectedId} movePage={movePage} />
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
