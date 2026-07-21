import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import PublicLayout from '@/components/layout/PublicLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useRsvps } from '@/hooks/useRsvps';
import { toast } from 'sonner';
import {
  User, Calendar, CheckCircle2, X, Edit, Save, Loader2,
  Phone, Mail, MapPin, Shield, Bell, ExternalLink
} from 'lucide-react';

export default function MemberDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { events } = useSiteContent();
  const { rsvpIds, toggleRsvp, refresh: refreshRsvps } = useRsvps();

  const [profile, setProfile] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [commPrefs, setCommPrefs] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const upcomingEvents = events.filter((e) => e.type === 'upcoming');

  const load = async () => {
    if (!user) return;
    setPageLoading(true);
    const [mp, rv, cp] = await Promise.all([
      supabase.from('member_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('rsvps').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('communication_preferences').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    setProfile(mp.data);
    setEditData(mp.data || {});
    setRsvps(rv.data || []);
    setCommPrefs(cp.data);
    setPageLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth?tab=signin&redirect=/member" replace />;
  }

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ')
    : (user?.user_metadata?.name as string) || user?.email || 'Member';

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const patch = {
      primary_phone: editData.primary_phone || null,
      secondary_phone: editData.secondary_phone || null,
      secondary_email: editData.secondary_email || null,
      street_address: editData.street_address || null,
      city: editData.city || null,
      state: editData.state || null,
      zip_code: editData.zip_code || null,
      country: editData.country || null,
      emergency_contact_name: editData.emergency_contact_name || null,
      emergency_contact_phone: editData.emergency_contact_phone || null,
    };
    const { error } = await supabase
      .from('member_profiles')
      .update(patch)
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast.error('Could not save changes. Please try again.');
    } else {
      toast.success('Profile updated.');
      setEditMode(false);
      load();
    }
  };

  const handleCancelRsvp = async (eventId: string, eventTitle: string) => {
    const ok = await toggleRsvp(eventId, eventTitle);
    if (ok) {
      toast.success('RSVP cancelled.');
      setRsvps((prev) => prev.filter((r) => r.event_id !== eventId));
      refreshRsvps();
    }
  };

  const handleRsvp = async (eventId: string, eventTitle: string, rsvpLink?: string) => {
    const ok = await toggleRsvp(eventId, eventTitle);
    if (ok) {
      toast.success(`You're registered for ${eventTitle}!`);
      setRsvps((prev) => [...prev, { event_id: eventId, event_title: eventTitle, created_at: new Date().toISOString() }]);
      refreshRsvps();
      if (rsvpLink) window.open(rsvpLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (authLoading || pageLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Hero header */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-10">
        <div className="container-custom">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-2xl font-bold font-serif shrink-0">
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">Member Portal</p>
              <h1 className="font-serif text-3xl font-bold text-primary-foreground">
                Welcome back, {profile?.first_name || displayName.split(' ')[0]}!
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile?.member_type && (
                  <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {profile.member_type}
                  </span>
                )}
                {profile?.membership_status && (
                  <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {profile.membership_status}
                  </span>
                )}
                {profile?.organization_role && profile.organization_role !== 'General Member' && (
                  <span className="bg-secondary/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {profile.organization_role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{rsvps.length}</p>
              <p className="text-primary-foreground/70 text-xs mt-1">My RSVPs</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
              <p className="text-primary-foreground/70 text-xs mt-1">Upcoming Events</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {profile?.join_date ? new Date(profile.join_date).getFullYear() : '—'}
              </p>
              <p className="text-primary-foreground/70 text-xs mt-1">Member Since</p>
            </div>
          </div>
        </div>
      </section>

      {/* No profile yet — prompt to complete registration */}
      {!profile && (
        <section className="py-10 bg-section">
          <div className="container-custom max-w-2xl">
            <Card className="p-8 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold mb-2">Complete Your Member Profile</h2>
              <p className="text-muted-foreground mb-6">
                You have an account, but haven't completed the full member registration yet.
                Complete your profile so JVBNA can stay connected with you.
              </p>
              <Link to="/signup">
                <Button size="lg" className="font-semibold">Complete Registration</Button>
              </Link>
            </Card>
          </div>
        </section>
      )}

      {/* Main dashboard */}
      {profile && (
        <section className="py-10 bg-section">
          <div className="container-custom">
            <Tabs defaultValue="rsvps">
              <TabsList className="mb-6 flex flex-wrap h-auto gap-1">
                <TabsTrigger value="rsvps" className="gap-2">
                  <Calendar className="w-4 h-4" /> My RSVPs
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Upcoming Events
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" /> My Profile
                </TabsTrigger>
                <TabsTrigger value="communication" className="gap-2">
                  <Bell className="w-4 h-4" /> Communication
                </TabsTrigger>
              </TabsList>

              {/* My RSVPs */}
              <TabsContent value="rsvps">
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-bold">My RSVPs</h2>
                  {rsvps.length === 0 ? (
                    <Card className="p-10 text-center">
                      <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium text-foreground">No RSVPs yet</p>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Browse upcoming events and register your spot.
                      </p>
                      <Link to="/events/upcoming">
                        <Button variant="outline">View Upcoming Events</Button>
                      </Link>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {rsvps.map((r) => (
                        <Card key={r.id || r.event_id} className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{r.event_title}</p>
                              <p className="text-xs text-muted-foreground">
                                RSVPed {new Date(r.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelRsvp(r.event_id, r.event_title)}
                            className="text-muted-foreground hover:text-destructive gap-1 shrink-0"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Upcoming events with RSVP */}
              <TabsContent value="events">
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-bold">Upcoming Events</h2>
                  {upcomingEvents.length === 0 ? (
                    <Card className="p-10 text-center">
                      <p className="text-muted-foreground">No upcoming events at this time.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => {
                        const hasRsvp = rsvpIds.has(event.id);
                        return (
                          <Card key={event.id} className="p-4 flex items-center gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground">{event.title}</p>
                                {hasRsvp && (
                                  <Badge variant="secondary" className="text-xs gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> RSVPed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">{event.date}</p>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                variant={hasRsvp ? 'outline' : 'default'}
                                onClick={() => hasRsvp
                                  ? handleCancelRsvp(event.id, event.title)
                                  : handleRsvp(event.id, event.title, event.rsvpLink)
                                }
                              >
                                {hasRsvp ? 'Cancel RSVP' : 'RSVP'}
                              </Button>
                              {event.photosLink && (
                                <a href={event.photosLink} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline" className="gap-1.5">
                                    View Photos <ExternalLink className="w-3.5 h-3.5" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Profile */}
              <TabsContent value="profile">
                <Card className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold">My Profile</h2>
                    {!editMode ? (
                      <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-2">
                        <Edit className="w-4 h-4" /> Edit Contact Info
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); setEditData(profile); }}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Identity (read-only — admin manages) */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Identity</p>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Name:</span> <span className="font-medium ml-1">{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || '—'}</span></div>
                      <div><span className="text-muted-foreground">Preferred name:</span> <span className="font-medium ml-1">{profile.preferred_name || '—'}</span></div>
                      <div><span className="text-muted-foreground">Member type:</span> <span className="font-medium ml-1">{profile.member_type || '—'}</span></div>
                      <div><span className="text-muted-foreground">Role:</span> <span className="font-medium ml-1">{profile.organization_role || '—'}</span></div>
                      <div><span className="text-muted-foreground">Status:</span> <span className="font-medium ml-1">{profile.membership_status || '—'}</span></div>
                      <div><span className="text-muted-foreground">Primary email:</span> <span className="font-medium ml-1">{profile.primary_email || user?.email || '—'}</span></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Name, member type, role, and status are managed by JVBNA administrators.</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Contact Information</p>
                    {editMode ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Primary phone</Label>
                          <Input value={editData.primary_phone || ''} onChange={(e) => setEditData({ ...editData, primary_phone: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Secondary phone</Label>
                          <Input value={editData.secondary_phone || ''} onChange={(e) => setEditData({ ...editData, secondary_phone: e.target.value })} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-xs">Secondary email</Label>
                          <Input type="email" value={editData.secondary_email || ''} onChange={(e) => setEditData({ ...editData, secondary_email: e.target.value })} />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label className="text-xs">Street address</Label>
                          <Input value={editData.street_address || ''} onChange={(e) => setEditData({ ...editData, street_address: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">City</Label>
                          <Input value={editData.city || ''} onChange={(e) => setEditData({ ...editData, city: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">State</Label>
                          <Input value={editData.state || ''} onChange={(e) => setEditData({ ...editData, state: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">ZIP code</Label>
                          <Input value={editData.zip_code || ''} onChange={(e) => setEditData({ ...editData, zip_code: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Country</Label>
                          <Input value={editData.country || ''} onChange={(e) => setEditData({ ...editData, country: e.target.value })} />
                        </div>
                        <div className="border-t pt-4 sm:col-span-2">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Emergency Contact</p>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Name</Label>
                              <Input value={editData.emergency_contact_name || ''} onChange={(e) => setEditData({ ...editData, emergency_contact_name: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Phone</Label>
                              <Input value={editData.emergency_contact_phone || ''} onChange={(e) => setEditData({ ...editData, emergency_contact_phone: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Relationship</Label>
                              <Input value={editData.emergency_contact_relationship || ''} onChange={(e) => setEditData({ ...editData, emergency_contact_relationship: e.target.value })} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4 shrink-0" />
                          <span>{profile.primary_phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4 shrink-0" />
                          <span>{profile.secondary_email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>
                            {[profile.street_address, profile.city, profile.state, profile.zip_code]
                              .filter(Boolean).join(', ') || '—'}
                          </span>
                        </div>
                        {profile.emergency_contact_name && (
                          <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">
                              Emergency: {profile.emergency_contact_name}
                              {profile.emergency_contact_phone && ` · ${profile.emergency_contact_phone}`}
                              {profile.emergency_contact_relationship && ` (${profile.emergency_contact_relationship})`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Data accuracy note */}
                  <div className="flex items-start gap-3 bg-section rounded-lg p-4 text-sm">
                    <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Need to update your name or membership info?</p>
                      <p className="text-muted-foreground mt-0.5">
                        Contact JVBNA at{' '}
                        <a href="mailto:info@jvbnj.org" className="text-primary hover:underline">info@jvbnj.org</a>
                        {' '}and an administrator will update your record.
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Communication Preferences */}
              <TabsContent value="communication">
                <Card className="p-6">
                  <h2 className="font-serif text-xl font-bold mb-4">Communication Preferences</h2>
                  {!commPrefs ? (
                    <p className="text-muted-foreground">No preferences on file. Complete your registration to set them.</p>
                  ) : (
                    <div className="space-y-3 text-sm">
                      {([
                        ['General announcements', commPrefs.general_announcements],
                        ['Event reminders', commPrefs.event_reminders],
                        ['Donation reminders', commPrefs.donation_reminders],
                        ['Volunteer requests', commPrefs.volunteer_requests],
                        ['WhatsApp group', commPrefs.whatsapp_group_interest],
                      ] as [string, boolean][]).map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between py-2 border-b last:border-0">
                          <span className="text-foreground">{label}</span>
                          <Badge variant={val ? 'default' : 'outline'}>{val ? 'On' : 'Off'}</Badge>
                        </div>
                      ))}
                      {commPrefs.do_not_contact && (
                        <div className="mt-3 bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm font-medium">
                          Do Not Contact is active — JVBNA will not send you communications.
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground pt-2">
                        To update your preferences, contact{' '}
                        <a href="mailto:info@jvbnj.org" className="text-primary hover:underline">info@jvbnj.org</a>.
                      </p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
