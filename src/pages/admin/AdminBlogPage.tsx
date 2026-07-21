import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import AdminLayout from '@/components/admin/AdminLayout';
import BlogImagePlaceholder from '@/components/BlogImagePlaceholder';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, ExternalLink, Save, Send, FileEdit, ImagePlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePosts, slugify, type Post, type PostStatus } from '@/hooks/usePosts';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toast } from 'sonner';

function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

function newPost(): Omit<Post, 'id' | 'created_at' | 'updated_at'> {
  return {
    slug: '',
    title: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    author: '',
    published_at: new Date().toISOString(),
    status: 'draft',
    category: '',
  };
}

export default function AdminBlogPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { posts, refresh } = usePosts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Post | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
  const [creating, setCreating] = useState(false);
  const [newDraft, setNewDraft] = useState(newPost());

  useEffect(() => {
    if (selectedId) {
      const p = posts.find((x) => x.id === selectedId);
      if (p) setDraft({ ...p });
    } else {
      setDraft(null);
    }
  }, [selectedId, posts]);

  if (!authLoading && !isAuthenticated) return <Navigate to="/admin" replace />;

  const filteredPosts = statusFilter === 'all' ? posts : posts.filter((p) => p.status === statusFilter);
  const statusCounts = {
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
  };

  async function handleCreate(status: PostStatus) {
    if (!newDraft.title.trim()) return toast.error('Title required');
    const slug = slugify(newDraft.title);
    const { data, error } = await supabase
      .from('posts')
      .insert({ ...newDraft, slug, status })
      .select()
      .single();
    if (error) return toast.error(error.message);
    toast.success(status === 'published' ? 'Post published' : 'Draft saved');
    setCreating(false);
    setNewDraft(newPost());
    setStatusFilter(status);
    await refresh();
    setSelectedId(data!.id);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Post deleted');
    setSelectedId(null);
    refresh();
  }

  async function handleSave(overrideStatus?: PostStatus) {
    if (!draft) return;
    const nextStatus = overrideStatus ?? draft.status;
    const { error } = await supabase
      .from('posts')
      .update({
        title: draft.title,
        content: draft.content,
        excerpt: draft.excerpt,
        featured_image_url: draft.featured_image_url,
        author: draft.author,
        published_at: draft.published_at,
        category: draft.category,
        status: nextStatus,
      })
      .eq('id', draft.id);
    if (error) return toast.error(error.message);
    toast.success(overrideStatus === 'published' ? 'Published' : overrideStatus === 'draft' ? 'Moved to drafts' : 'Saved');
    if (overrideStatus) {
      setDraft({ ...draft, status: overrideStatus });
      setStatusFilter(overrideStatus);
    }
    refresh();
  }

  async function handleImage(file: File | undefined, target: 'draft' | 'new') {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image is larger than 5MB');
    const url = await fileToDataUrl(file);
    if (target === 'draft' && draft) setDraft({ ...draft, featured_image_url: url });
    if (target === 'new') setNewDraft({ ...newDraft, featured_image_url: url });
  }

  return (
    <AdminLayout>
      <div className="fade-in">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Blog</h1>
            <p className="text-muted-foreground mt-1">
              Create, edit, and publish blog posts. {posts.length} posts total.
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedId(null);
              setCreating(true);
              setNewDraft(newPost());
            }}
          >
            <Plus className="w-4 h-4" /> New post
          </Button>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="space-y-4">
            <Card className="p-4">
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | PostStatus)} className="mb-3">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">All <span className="ml-1 text-xs opacity-70">({posts.length})</span></TabsTrigger>
                  <TabsTrigger value="published">Published <span className="ml-1 text-xs opacity-70">({statusCounts.published})</span></TabsTrigger>
                  <TabsTrigger value="draft">Drafts <span className="ml-1 text-xs opacity-70">({statusCounts.draft})</span></TabsTrigger>
                </TabsList>
              </Tabs>
              {filteredPosts.length === 0 && (
                <p className="text-xs text-muted-foreground">No posts here yet.</p>
              )}
              <ul className="space-y-1 max-h-[65vh] overflow-y-auto">
                {filteredPosts.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => {
                        setCreating(false);
                        setSelectedId(p.id);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm hover:bg-muted flex items-center justify-between gap-2 ${selectedId === p.id ? 'bg-muted font-medium' : ''}`}
                    >
                      <span
                        className="truncate"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.title || '(untitled)', { ALLOWED_TAGS: [] }) }}
                      />
                      {p.status === 'draft' && <Badge variant="secondary" className="text-[10px] shrink-0">draft</Badge>}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            {creating ? (
              <Card className="p-6 space-y-4">
                <h2 className="font-serif text-lg font-bold">New post</h2>
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input value={newDraft.title} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })} placeholder="Post title" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Author</Label>
                    <Input value={newDraft.author || ''} onChange={(e) => setNewDraft({ ...newDraft, author: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Input value={newDraft.category || ''} onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Excerpt</Label>
                  <Input value={newDraft.excerpt || ''} onChange={(e) => setNewDraft({ ...newDraft, excerpt: e.target.value })} placeholder="Short summary shown on the blog list" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Featured image</Label>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-muted text-sm">
                      <ImagePlus className="w-4 h-4" />
                      {newDraft.featured_image_url ? 'Replace image' : 'Upload image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0], 'new')} />
                    </label>
                    {newDraft.featured_image_url && (
                      <Button size="sm" variant="ghost" onClick={() => setNewDraft({ ...newDraft, featured_image_url: '' })}>Remove</Button>
                    )}
                  </div>
                  {newDraft.featured_image_url ? (
                    <img src={newDraft.featured_image_url} alt="" className="w-full max-w-xs aspect-video rounded border object-cover" />
                  ) : (
                    <BlogImagePlaceholder className="w-full max-w-xs aspect-video rounded border" />
                  )}
                  <p className="text-xs text-muted-foreground">No image yet? The branded placeholder shown above is what visitors will see instead.</p>
                </div>
                <div>
                  <Label className="text-xs">Content</Label>
                  <RichTextEditor value={newDraft.content} onChange={(html) => setNewDraft({ ...newDraft, content: html })} placeholder="Write the post..." />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
                  <Button variant="outline" onClick={() => handleCreate('draft')}>
                    <FileEdit className="w-4 h-4" /> Save draft
                  </Button>
                  <Button onClick={() => handleCreate('published')}>
                    <Send className="w-4 h-4" /> Publish
                  </Button>
                </div>
              </Card>
            ) : !draft ? (
              <Card className="p-10 text-center text-muted-foreground">
                Select a post on the left, or create a new one to begin editing.
              </Card>
            ) : (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-xs">Title</Label>
                      <Badge variant={draft.status === 'published' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-wide">
                        {draft.status}
                      </Badge>
                    </div>
                    <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL: <code>/blog/{draft.slug}</code>
                      {draft.status !== 'published' && <span className="ml-2 italic">(not visible on the public site)</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <a href={`/blog/${draft.slug}`} target="_blank" rel="noreferrer">
                      <Button variant="outline"><ExternalLink className="w-4 h-4" /> View</Button>
                    </a>
                    <Button variant="destructive" onClick={() => handleDelete(draft.id)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                    <Button variant="secondary" onClick={() => handleSave()}>
                      <Save className="w-4 h-4" /> Save {draft.status === 'draft' ? 'draft' : 'changes'}
                    </Button>
                    {draft.status !== 'published' ? (
                      <Button onClick={() => handleSave('published')}>
                        <Send className="w-4 h-4" /> Publish
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => handleSave('draft')}>
                        <FileEdit className="w-4 h-4" /> Move to drafts
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Author</Label>
                      <Input value={draft.author || ''} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Input value={draft.category || ''} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Excerpt</Label>
                    <Input value={draft.excerpt || ''} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} placeholder="Short summary shown on the blog list" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Featured image</Label>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-muted text-sm">
                        <ImagePlus className="w-4 h-4" />
                        {draft.featured_image_url ? 'Replace image' : 'Upload image'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0], 'draft')} />
                      </label>
                      {draft.featured_image_url && (
                        <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, featured_image_url: '' })}>Remove</Button>
                      )}
                    </div>
                    {draft.featured_image_url ? (
                      <img src={draft.featured_image_url} alt="" className="w-full max-w-xs aspect-video rounded border object-cover" />
                    ) : (
                      <BlogImagePlaceholder className="w-full max-w-xs aspect-video rounded border" />
                    )}
                    <p className="text-xs text-muted-foreground">No image yet? The branded placeholder shown above is what visitors will see instead.</p>
                  </div>
                  <div>
                    <Label className="text-xs">Content</Label>
                    <RichTextEditor key={draft.id} value={draft.content} onChange={(html) => setDraft({ ...draft, content: html })} placeholder="Write the post..." />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
