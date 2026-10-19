import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Calendar, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { toCalendarEmbedUrl } from '@/lib/calendarUrl';
import { PageTextCard } from '@/components/admin/PageTextFields';
import PageLayoutCard from '@/components/admin/PageLayoutCard';
import PageSectionsCard from '@/components/admin/PageSectionsCard';

export default function AdminSettingsPage() {
  const { calendarUrl, setCalendarUrl } = useSiteContent();
  const [calendarInput, setCalendarInput] = useState(calendarUrl);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCalendar = () => {
    const embedUrl = toCalendarEmbedUrl(calendarInput);
    if (!embedUrl) {
      toast.error('That isn\'t a Google Calendar. Paste the calendar\'s email (e.g. socialmedia@jvbnj.org), its Calendar ID, or its embed code.');
      return;
    }
    setIsSaving(true);
    setCalendarInput(embedUrl);
    setCalendarUrl(embedUrl);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Calendar saved');
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
              <Label htmlFor="calendar-url">Google Calendar</Label>
              <Input
                id="calendar-url"
                value={calendarInput}
                onChange={(e) => setCalendarInput(e.target.value)}
                placeholder="socialmedia@jvbnj.org"
              />
              <p className="text-xs text-muted-foreground">
                Paste the calendar's email address, its Calendar ID, or its embed code — the website builds
                the correct link automatically. The calendar must be set to public in Google Calendar.
              </p>
            </div>
            <Button onClick={handleSaveCalendar} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Calendar'}
            </Button>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-foreground mb-2">How to Set Up the Calendar (signed in as socialmedia@jvbnj.org)</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary">Google Calendar</a></li>
                <li>Click the gear icon (⚙️) → Settings, then click the calendar's name on the left</li>
                <li>Under "Access permissions for events", tick "Make available to public" → "See all event details"</li>
                <li>Scroll to "Integrate calendar" and copy the "Calendar ID" (or the "Embed code")</li>
                <li>Paste it above and click Save Calendar</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-3">
                Events added or changed in this Google Calendar appear on the website automatically — no need to
                save here again. Keep the calendar public, or visitors will see an empty calendar.
              </p>
            </div>
          </CardContent>
        </Card>

        <PageTextCard page="calendar" section="hero" title="Calendar Page Banner" description="The colored title bar at the top of the public Calendar page." />
        <PageTextCard page="calendar" section="body" title="Calendar Page Text" />
        <PageLayoutCard pageId="calendar" />
        <PageSectionsCard pageId="calendar" />

        {/* Site-wide: header, social links, footer */}
        <PageTextCard page="site" section="header" title="Site Header" description="The site name and tagline next to the logo at the top of every page." />
        <PageTextCard
          page="site"
          section="social"
          title="Social Media Links"
          description="Used by the social buttons in the footer and on the Spiritual Guidance and Volunteer pages."
        />
        <PageTextCard page="site" section="footer" title="Site Footer" />

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
