import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDate } from '@/lib/csvExport';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORGANIZATION_ROLES } from '@/lib/signupSchema';

const EDITABLE_FIELDS = [
  'first_name','last_name','preferred_name','primary_email','primary_phone','secondary_phone',
  'member_type','organization_role','membership_status','age_group','school_name',
  'street_address','city','state','zip_code','country',
  'emergency_contact_name','emergency_contact_phone','emergency_contact_relationship',
  'profile_picture_url',
];

export default function AdminMemberDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [households, setHouseholds] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [eventPrefs, setEventPrefs] = useState<any>(null);
  const [donationPrefs, setDonationPrefs] = useState<any>(null);
  const [commPrefs, setCommPrefs] = useState<any>(null);
  const [consents, setConsents] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [mp, hh, sp, ep, dp, cp, co, an, al, rv] = await Promise.all([
      supabase.from('member_profiles').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('household_members').select('*, households(*)').eq('user_id', id),
      supabase.from('student_profiles').select('*').eq('parent_user_id', id),
      supabase.from('event_preferences').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('donation_preferences').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('communication_preferences').select('*').eq('user_id', id).maybeSingle(),
      supabase.from('consents').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('admin_notes').select('*').eq('user_id', id).order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
      supabase.from('rsvps').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    ]);
    setProfile(mp.data);
    setHouseholds(hh.data || []);
    setStudents(sp.data || []);
    setEventPrefs(ep.data);
    setDonationPrefs(dp.data);
    setCommPrefs(cp.data);
    setConsents(co.data || []);
    setNotes(an.data || []);
    setAuditLogs(al.data || []);
    setRsvps(rv.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const saveProfile = async () => {
    if (!profile || !user) return;
    setSaving(true);
    const patch: any = {};
    for (const f of EDITABLE_FIELDS) patch[f] = profile[f] ?? null;
    const { data: oldRow } = await supabase.from('member_profiles').select('*').eq('user_id', id!).maybeSingle();
    const { error } = await supabase.from('member_profiles').update(patch).eq('user_id', id!);
    if (error) {
      toast.error(error.message);
    } else {
      await supabase.from('audit_logs').insert({
        user_id: id, action: 'admin_update_profile',
        changed_by: user.id, old_value: oldRow, new_value: patch,
      });
      toast.success('Profile saved');
      load();
    }
    setSaving(false);
  };

  const addNote = async () => {
    if (!newNote.trim() || !user) return;
    const { error } = await supabase.from('admin_notes').insert({
      user_id: id, note: newNote.trim(), created_by_admin_id: user.id,
    });
    if (error) toast.error(error.message);
    else { setNewNote(''); load(); }
  };

  if (loading) {
    return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin" /></div></AdminLayout>;
  }
  if (!profile) {
    return (
      <AdminLayout>
        <Link to="/admin/members" className="text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="w-4 h-4 inline mr-1" />Back to members</Link>
        <p className="mt-6">Member not found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link to="/admin/members" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />Back to members
        </Link>

        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt="" className="h-16 w-16 rounded-full object-cover border" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-muted border flex items-center justify-center text-sm font-semibold text-muted-foreground">
                {((profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-serif font-bold">
                {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.primary_email}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground items-center">
                <Badge variant="outline">{profile.member_type}</Badge>
                {profile.organization_role && <Badge variant="secondary">{profile.organization_role}</Badge>}
                <Badge>{profile.membership_status}</Badge>
                <span>Joined {formatDate(profile.created_at).slice(0,10)}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="rsvps">RSVPs {rsvps.length > 0 && `(${rsvps.length})`}</TabsTrigger>
            <TabsTrigger value="household">Household</TabsTrigger>
            <TabsTrigger value="students">Children</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="comm">Communication</TabsTrigger>
            <TabsTrigger value="consents">Consents</TabsTrigger>
            <TabsTrigger value="notes">Admin Notes</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {EDITABLE_FIELDS.map((f) => (
                  <div key={f} className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      {f.replace(/_/g, ' ')}
                    </Label>
                    {f === 'organization_role' ? (
                      <Select
                        value={profile[f] ?? ''}
                        onValueChange={(v) => setProfile({ ...profile, [f]: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>
                          {ORGANIZATION_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : f === 'profile_picture_url' ? (
                      <div className="flex items-center gap-3">
                        {profile[f] && (
                          <img src={profile[f]} alt="" className="h-12 w-12 rounded-full object-cover border" />
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
                            const reader = new FileReader();
                            reader.onload = () => setProfile({ ...profile, [f]: String(reader.result) });
                            reader.readAsDataURL(file);
                          }}
                        />
                        {profile[f] && (
                          <Button type="button" variant="outline" size="sm" onClick={() => setProfile({ ...profile, [f]: '' })}>
                            Remove
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Input
                        value={profile[f] ?? ''}
                        onChange={(e) => setProfile({ ...profile, [f]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button onClick={saveProfile} variant="secondary" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : <><Save className="w-4 h-4 mr-2" />Save changes</>}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="rsvps">
            <Card className="p-6">
              {rsvps.length === 0 ? (
                <p className="text-muted-foreground text-sm">No RSVPs recorded for this member.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    {rsvps.length} RSVP{rsvps.length !== 1 ? 's' : ''} total
                  </p>
                  {rsvps.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 border rounded-lg p-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{r.event_title || r.event_id}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>RSVPed {formatDate(r.created_at).slice(0, 10)}</span>
                          <span className="text-muted-foreground/50">·</span>
                          <span className="font-mono text-[10px]">{r.event_id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="household">
            <Card className="p-6">
              {households.length === 0 ? (
                <p className="text-muted-foreground">No household.</p>
              ) : (
                households.map((hm) => (
                  <div key={hm.id} className="border-b last:border-0 py-3">
                    <p className="font-medium">{hm.households?.household_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {hm.relationship_to_household} · {hm.is_primary_contact ? 'Primary contact' : 'Member'}
                    </p>
                    <p className="text-sm">
                      {[hm.households?.street_address, hm.households?.city, hm.households?.state, hm.households?.zip_code].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ))
              )}
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="p-6 space-y-3">
              {students.length === 0 ? <p className="text-muted-foreground">No student profiles.</p> :
                students.map((s) => (
                  <div key={s.id} className="border rounded-lg p-4">
                    <p className="font-semibold">{s.first_name} {s.last_name}</p>
                    <p className="text-sm text-muted-foreground">
                      DOB {s.date_of_birth || '—'} · Grade {s.school_grade || '—'} · Class {s.religious_class_grade || '—'}
                    </p>
                    {s.allergies_medical_notes && <p className="text-sm mt-1"><b>Medical:</b> {s.allergies_medical_notes}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Photo/video: {s.photo_video_permission ? 'Yes' : 'No'} · Field trips: {s.field_trip_permission ? 'Yes' : 'No'}
                    </p>
                  </div>
                ))
              }
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="p-6 text-sm space-y-2">
              {!eventPrefs ? <p className="text-muted-foreground">No event preferences.</p> : (<>
                <p><b>Interested events:</b> {eventPrefs.interested_event_types?.join(', ') || '—'}</p>
                <p><b>Volunteer:</b> {eventPrefs.willing_to_volunteer ? 'Yes' : 'No'}</p>
                <p><b>Areas:</b> {eventPrefs.volunteer_areas?.join(', ') || '—'}</p>
                <p><b>Availability:</b> {eventPrefs.availability?.join(', ') || '—'}</p>
              </>)}
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card className="p-6 text-sm space-y-2">
              {!donationPrefs ? <p className="text-muted-foreground">No donation preferences.</p> : (<>
                <p><b>Donor category:</b> {donationPrefs.donor_category || '—'}</p>
                <p><b>Receipt email:</b> {donationPrefs.donation_receipt_email || '—'}</p>
              </>)}
            </Card>
          </TabsContent>

          <TabsContent value="comm">
            <Card className="p-6 text-sm space-y-2">
              {!commPrefs ? <p className="text-muted-foreground">No preferences.</p> : (<>
                <p><b>General announcements:</b> {commPrefs.general_announcements ? 'Yes' : 'No'}</p>
                <p><b>Event reminders:</b> {commPrefs.event_reminders ? 'Yes' : 'No'}</p>
                <p><b>Donation reminders:</b> {commPrefs.donation_reminders ? 'Yes' : 'No'}</p>
                <p><b>Volunteer requests:</b> {commPrefs.volunteer_requests ? 'Yes' : 'No'}</p>
                <p><b>Newsletter:</b> {commPrefs.newsletter_frequency}</p>
                <p><b>Language:</b> {commPrefs.preferred_language || '—'}</p>
                <p><b>WhatsApp group:</b> {commPrefs.whatsapp_group_interest ? 'Yes' : 'No'}</p>
                <p><b>Do not contact:</b> {commPrefs.do_not_contact ? 'Yes' : 'No'}</p>
              </>)}
            </Card>
          </TabsContent>

          <TabsContent value="consents">
            <Card className="p-6 text-sm space-y-3">
              {consents.length === 0 ? <p className="text-muted-foreground">No consent records.</p> :
                consents.map((c) => (
                  <div key={c.id} className="border-b last:border-0 pb-3">
                    <p className="text-xs text-muted-foreground">{formatDate(c.created_at)} · {c.consent_source}</p>
                    <p>Email: {c.email_consent ? '✓' : '✗'} · SMS: {c.sms_consent ? '✓' : '✗'} · Photo/Video: {c.photo_video_consent ? '✓' : '✗'} · Parent/guardian: {c.parent_guardian_consent ? '✓' : '✗'}</p>
                    <p>Terms accepted: {formatDate(c.terms_accepted_at)}</p>
                    <p>Privacy accepted: {formatDate(c.privacy_accepted_at)}</p>
                  </div>
                ))
              }
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card className="p-6 space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add an internal note…"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                />
                <Button variant="secondary" onClick={addNote}>Add</Button>
              </div>
              <div className="space-y-2">
                {notes.length === 0 && <p className="text-muted-foreground text-sm">No notes yet.</p>}
                {notes.map((n) => (
                  <div key={n.id} className="border rounded-md p-3 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">{formatDate(n.created_at)}</p>
                    <p>{n.note}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="p-6 space-y-2 text-sm">
              {auditLogs.length === 0 && <p className="text-muted-foreground">No audit history.</p>}
              {auditLogs.map((a) => (
                <div key={a.id} className="border-b last:border-0 py-2">
                  <p className="text-xs text-muted-foreground">{formatDate(a.created_at)}</p>
                  <p><b>{a.action}</b></p>
                </div>
              ))}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
