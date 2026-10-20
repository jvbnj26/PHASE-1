import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, ArrowRight, RotateCcw } from 'lucide-react';
import { ImageUploadButton } from '@/components/admin/ImageUploadButton';
import { useToast } from '@/hooks/use-toast';
import { getImageSrc } from '@/lib/imageMap';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { toRichHtml } from '@/lib/richText';
import PageSectionsCard from '@/components/admin/PageSectionsCard';
import PageTextFields, { PageTextCard } from '@/components/admin/PageTextFields';
import PageLayoutCard from '@/components/admin/PageLayoutCard';
import ReorderButtons from '@/components/admin/ReorderButtons';
import { moveItem } from '@/lib/reorder';
import type { HomePhoto } from '@/data/siteContent';

export default function AdminHomePage() {
  const { isAuthenticated } = useAuth();
  const {
    bannerSlides, setBannerSlides,
    welcomeText, setWelcomeText,
    spiritualMasters, homePhotos, setHomePhotos,
    activities2025, setActivities2025
  } = useSiteContent();
  const { toast } = useToast();

  const [localBanners, setLocalBanners] = useState(bannerSlides);
  useEffect(() => setLocalBanners(bannerSlides), [bannerSlides]);
  const [localWelcome, setLocalWelcome] = useState(welcomeText);
  // Saved content arrives from the database after this page mounts — show it, not the defaults.
  useEffect(() => setLocalWelcome(welcomeText), [welcomeText]);
  // Until customised, the homepage shows the Samanijis from the Spiritual Guidance page.
  const toLocalPhotos = (): HomePhoto[] =>
    (homePhotos ?? spiritualMasters).map(({ id, name, imageUrl }) => ({ id, name, imageUrl }));
  const [localPhotos, setLocalPhotos] = useState<HomePhoto[]>(toLocalPhotos);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setLocalPhotos(toLocalPhotos()), [homePhotos, spiritualMasters]);
  const [localActivities, setLocalActivities] = useState(activities2025.map(a => typeof a === 'string' ? a : a.name));
  useEffect(() => setLocalActivities(activities2025.map(a => typeof a === 'string' ? a : a.name)), [activities2025]);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSaveBanners = () => {
    setBannerSlides(localBanners);
    toast({
      title: "Banners Updated",
      description: "Homepage banners have been saved successfully.",
    });
  };

  const handleSaveWelcome = () => {
    setWelcomeText(localWelcome);
    toast({
      title: "Welcome Section Updated",
      description: "The welcome section has been saved successfully.",
    });
  };

  const handleSavePhotos = () => {
    // A photo with no image would render as an empty box on the homepage — leave it out.
    const withImage = localPhotos.filter((p) => p.imageUrl.trim());
    const skipped = localPhotos.length - withImage.length;
    setHomePhotos(withImage);
    toast({
      title: "Welcome Photos Updated",
      description: skipped
        ? `Saved ${withImage.length} photo${withImage.length === 1 ? '' : 's'}. ${skipped} without an image ${skipped === 1 ? 'was' : 'were'} left out.`
        : "The homepage photos have been saved successfully.",
    });
  };

  const handleResetPhotos = () => {
    setHomePhotos(null);
    toast({
      title: "Welcome Photos Reset",
      description: "The homepage now shows the Samanijis from the Spiritual Guidance page.",
    });
  };

  const updatePhoto = (id: string, field: keyof HomePhoto, value: string) => {
    setLocalPhotos((photos) => photos.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSaveActivities = () => {
    setActivities2025(localActivities);
    toast({
      title: "Activities 2025 Updated",
      description: "The activities list has been saved successfully.",
    });
  };

  const addBanner = () => {
    setLocalBanners([
      ...localBanners,
      {
        id: String(Date.now()),
        imageUrl: '/placeholder.svg',
        title: 'New Banner',
        subtitle: 'Add your subtitle here',
        order: localBanners.length + 1,
      }
    ]);
  };

  const removeBanner = (id: string) => {
    setLocalBanners(localBanners.filter(b => b.id !== id));
  };

  const updateBanner = (id: string, field: string, value: string) => {
    setLocalBanners(localBanners.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  return (
    <AdminLayout>
      <div className="fade-in max-w-4xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Home Page</h1>
          <p className="text-muted-foreground mt-1">
            Manage the homepage banner carousel, welcome text, and featured lists
          </p>
        </div>

        <div className="mb-8"><PageLayoutCard pageId="home" /></div>

        {/* Banner Carousel Section */}
        <section className="admin-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-foreground">Banner Carousel</h2>
            <Button onClick={addBanner} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </div>

          <div className="space-y-4">
            {localBanners.map((banner, index) => (
              <div key={banner.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <ReorderButtons
                      index={index}
                      count={localBanners.length}
                      label="slide"
                      onMove={(dir) => setLocalBanners((b) => moveItem(b, index, dir))}
                    />
                  </div>
                  
                  <div className="flex-1 grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={banner.title}
                          onChange={(e) => updateBanner(banner.id, 'title', e.target.value)}
                          placeholder="Banner title"
                        />
                      </div>
                      <div>
                        <Label>Subtitle</Label>
                        <Input
                          value={banner.subtitle}
                          onChange={(e) => updateBanner(banner.id, 'subtitle', e.target.value)}
                          placeholder="Banner subtitle"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Banner Image</Label>
                      <div className="flex gap-2">
                        <Input
                          value={banner.imageUrl}
                          onChange={(e) => updateBanner(banner.id, 'imageUrl', e.target.value)}
                          placeholder="Image URL or upload"
                        />
                        <ImageUploadButton
                          iconOnly
                          label="Upload banner image"
                          onUploaded={(url) => updateBanner(banner.id, 'imageUrl', url)}
                        />
                      </div>
                      {banner.imageUrl && (
                        <img src={getImageSrc(banner.imageUrl)} alt="" className="mt-2 h-20 rounded border object-cover" />
                      )}
                    </div>
                  </div>


                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBanner(banner.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSaveBanners} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save Banners
          </Button>
        </section>

        {/* Welcome Section */}
        <section className="admin-card mb-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-6">Welcome Section</h2>
          <PageTextFields page="home" section="welcome" className="mb-4" />
          
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={localWelcome.title}
                onChange={(e) => setLocalWelcome({ ...localWelcome, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Content</Label>
              <RichTextEditor
                value={toRichHtml(localWelcome.content)}
                onChange={(html) => setLocalWelcome((w) => ({ ...w, content: html }))}
                placeholder="Welcome text content..."
              />
            </div>
          </div>

          <Button onClick={handleSaveWelcome} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save Welcome Section
          </Button>
        </section>

        {/* Welcome photos — shown beside the welcome text */}
        <section className="admin-card mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-xl font-bold text-foreground">Welcome Photos</h2>
            <Button
              onClick={() => setLocalPhotos((p) => [...p, { id: String(Date.now()), name: '', imageUrl: '' }])}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {homePhotos
              ? 'These photos appear beside the welcome text on the homepage.'
              : 'Currently showing the Samanijis from the Spiritual Guidance page. Saving here gives the homepage its own photos.'}
          </p>

          <div className="space-y-4">
            {localPhotos.map((photo, index) => (
              <div key={photo.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <ReorderButtons
                      index={index}
                      count={localPhotos.length}
                      label="photo"
                      onMove={(dir) => setLocalPhotos((p) => moveItem(p, index, dir))}
                    />
                  </div>

                  <div className="w-20 h-24 shrink-0 rounded border overflow-hidden bg-muted flex items-center justify-center">
                    {photo.imageUrl ? (
                      <img src={getImageSrc(photo.imageUrl)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center px-1">No image yet</span>
                    )}
                  </div>

                  <div className="flex-1 grid gap-4">
                    <div>
                      <Label>Caption</Label>
                      <Input
                        value={photo.name}
                        onChange={(e) => updatePhoto(photo.id, 'name', e.target.value)}
                        placeholder="Name shown under the photo (optional)"
                      />
                    </div>
                    <div>
                      <Label>Image</Label>
                      <div className="flex gap-2">
                        <Input
                          value={photo.imageUrl}
                          onChange={(e) => updatePhoto(photo.id, 'imageUrl', e.target.value)}
                          placeholder="Image URL or upload"
                        />
                        <ImageUploadButton
                          iconOnly
                          label="Upload photo"
                          onUploaded={(url) => updatePhoto(photo.id, 'imageUrl', url)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocalPhotos((p) => p.filter((x) => x.id !== photo.id))}
                    className="text-destructive hover:text-destructive"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={handleSavePhotos}>
              <Save className="w-4 h-4 mr-2" />
              Save Photos
            </Button>
            {homePhotos && (
              <Button variant="outline" onClick={handleResetPhotos}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Use Samanijis from Spiritual Guidance
              </Button>
            )}
          </div>
        </section>

        {/* Events — the homepage's Events card is now a live view of the real Events data
            (same source as the public Events page), so there's nothing to hand-maintain here
            anymore. Manage events, including which ones show as upcoming/ongoing/past, from
            Admin > Events. */}
        <section className="admin-card mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground mb-1">Events</h2>
              <p className="text-sm text-muted-foreground">
                The homepage's Events card now updates automatically from Admin &gt; Events — add, edit, or
                remove events there and the homepage (and its Upcoming / Ongoing / Past tabs) reflects it immediately.
              </p>
            </div>
            <Link to="/admin/events">
              <Button variant="outline" className="gap-2 shrink-0">
                Go to Admin &gt; Events <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <PageTextFields page="home" section="events" className="mt-4" />
        </section>

        <div className="mb-8">
          <PageTextCard page="home" section="cta" title="Join Our Community (bottom banner)" />
        </div>

        {/* Activities 2025 */}
        <section className="admin-card mb-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-6">Activities 2025 List</h2>
          
          <div className="space-y-2">
            {localActivities.map((activity, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={activity}
                  onChange={(e) => {
                    const updated = [...localActivities];
                    updated[index] = e.target.value;
                    setLocalActivities(updated);
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocalActivities(localActivities.filter((_, i) => i !== index))}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setLocalActivities([...localActivities, 'New Activity'])}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
            <Button onClick={handleSaveActivities}>
              <Save className="w-4 h-4 mr-2" />
              Save Activities
            </Button>
          </div>
        </section>

        <PageSectionsCard pageId="home" />
      </div>
    </AdminLayout>
  );
}
