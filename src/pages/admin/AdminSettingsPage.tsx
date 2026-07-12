import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Settings, Calendar, Save, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const { calendarUrl, setCalendarUrl, photosUrl, setPhotosUrl } = useSiteContent();
  const [calendarInput, setCalendarInput] = useState(calendarUrl);
  const [photosInput, setPhotosInput] = useState(photosUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPhotos, setIsSavingPhotos] = useState(false);

  const handleSaveCalendar = () => {
    setIsSaving(true);
    setCalendarUrl(calendarInput);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Calendar URL saved');
    }, 500);
  };

  const handleSavePhotos = () => {
    setIsSavingPhotos(true);
    setPhotosUrl(photosInput);
    setTimeout(() => {
      setIsSavingPhotos(false);
      toast.success('Photos URL saved');
    }, 500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure website settings and preferences
          </p>
        </div>

        {/* Google Calendar Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Google Calendar Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-url">Google Calendar Embed URL</Label>
              <Input
                id="calendar-url"
                value={calendarInput}
                onChange={(e) => setCalendarInput(e.target.value)}
                placeholder="https://calendar.google.com/calendar/embed?src=..."
              />
              <p className="text-xs text-muted-foreground">
                To get your calendar embed URL: Open Google Calendar → Settings → Select your calendar → 
                "Integrate calendar" → Copy the "Embed code" and extract the src URL
              </p>
            </div>
            <Button onClick={handleSaveCalendar} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Calendar URL'}
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-foreground mb-2">How to Get Google Calendar Embed URL</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">Google Calendar</a></li>
                <li>Click the gear icon (⚙️) → Settings</li>
                <li>On the left, click on your calendar name</li>
                <li>Scroll down to "Integrate calendar"</li>
                <li>Copy the "Embed code" (starts with &lt;iframe...)</li>
                <li>Extract just the URL from src="..."</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Google Photos Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Google Photos Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photos-url">Google Photos Shared Album URL</Label>
              <Input
                id="photos-url"
                value={photosInput}
                onChange={(e) => setPhotosInput(e.target.value)}
                placeholder="https://photos.google.com/share/..."
              />
              <p className="text-xs text-muted-foreground">
                Paste your Google Photos shared album link (e.g. <code className="bg-muted px-1 rounded">https://photos.app.goo.gl/...</code>). Visitors click "Open Photo Gallery" on the Photos page to browse it.
              </p>
            </div>
            <Button onClick={handleSavePhotos} disabled={isSavingPhotos} className="gap-2">
              <Save className="w-4 h-4" />
              {isSavingPhotos ? 'Saving...' : 'Save Photos URL'}
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
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



        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-1">Site Name</h4>
                <p className="text-muted-foreground">JVBNA - Jain Vishwa Bharati of North America</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-1">Tagline</h4>
                <p className="text-muted-foreground">Center for Peace and Preksha Meditation</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Site name and tagline are displayed in the header. To modify these, contact the developer.
            </p>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2" asChild>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View Live Site
                </a>
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-4 h-4" />
                  Google Calendar
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
