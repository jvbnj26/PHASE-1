import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Save, ArrowRight } from 'lucide-react';
import { ImageUploadButton } from '@/components/admin/ImageUploadButton';
import { useToast } from '@/hooks/use-toast';
import { getImageSrc } from '@/lib/imageMap';

export default function AdminHomePage() {
  const { isAuthenticated } = useAuth();
  const {
    bannerSlides, setBannerSlides,
    welcomeText, setWelcomeText,
    activities2025, setActivities2025
  } = useSiteContent();
  const { toast } = useToast();

  const [localBanners, setLocalBanners] = useState(bannerSlides);
  const [localWelcome, setLocalWelcome] = useState(welcomeText);
  const [localActivities, setLocalActivities] = useState(activities2025.map(a => typeof a === 'string' ? a : a.name));

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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical className="w-5 h-5" />
                    <span className="text-sm font-medium">#{index + 1}</span>
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
              <Textarea
                value={localWelcome.content}
                onChange={(e) => setLocalWelcome({ ...localWelcome, content: e.target.value })}
                rows={8}
                placeholder="Welcome text content..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use blank lines to separate paragraphs
              </p>
            </div>
          </div>

          <Button onClick={handleSaveWelcome} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save Welcome Section
          </Button>
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
        </section>

        {/* Activities 2025 */}
        <section className="admin-card">
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
      </div>
    </AdminLayout>
  );
}
