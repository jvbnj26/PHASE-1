import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, Search, Eye, Upload, Database, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { rowsToCsv, downloadCsv, formatDate, parseCsv } from '@/lib/csvExport';
import { toast } from 'sonner';

// Every editable column on member_profiles. Used for CSV download AND upload.
const MEMBER_COLUMNS: { key: string; header: string }[] = [
  { key: 'id', header: 'id' },
  { key: 'user_id', header: 'user_id' },
  { key: 'first_name', header: 'first_name' },
  { key: 'last_name', header: 'last_name' },
  { key: 'preferred_name', header: 'preferred_name' },
  { key: 'age_group', header: 'age_group' },
  { key: 'school_name', header: 'school_name' },
  { key: 'gender', header: 'gender' },
  { key: 'member_type', header: 'member_type' },
  { key: 'organization_role', header: 'organization_role' },
  { key: 'profile_picture_url', header: 'profile_picture_url' },
  { key: 'membership_status', header: 'membership_status' },
  { key: 'join_date', header: 'join_date' },
  { key: 'how_heard_about_us', header: 'how_heard_about_us' },
  { key: 'referred_by', header: 'referred_by' },
  { key: 'primary_email', header: 'primary_email' },
  { key: 'secondary_email', header: 'secondary_email' },
  { key: 'primary_phone', header: 'primary_phone' },
  { key: 'secondary_phone', header: 'secondary_phone' },
  { key: 'preferred_contact_method', header: 'preferred_contact_method' },
  { key: 'street_address', header: 'street_address' },
  { key: 'city', header: 'city' },
  { key: 'state', header: 'state' },
  { key: 'zip_code', header: 'zip_code' },
  { key: 'country', header: 'country' },
  { key: 'emergency_contact_name', header: 'emergency_contact_name' },
  { key: 'emergency_contact_phone', header: 'emergency_contact_phone' },
  { key: 'emergency_contact_relationship', header: 'emergency_contact_relationship' },
  { key: 'interested_in_gyanshala', header: 'interested_in_gyanshala' },
  { key: 'created_at', header: 'created_at' },
  { key: 'updated_at', header: 'updated_at' },
];

const DATE_FIELDS = new Set(['join_date']);
const TIMESTAMP_FIELDS = new Set(['created_at', 'updated_at']);

const DUMMY_MEMBERS = [
  ['Aarav','Shah','Aaru','Adult','','Male','Member','Board Member','Active','2022-01-15','Friend','Priya Mehta','aarav.shah@example.com','aarav.work@example.com','555-201-3344','555-998-1122','Email','12 Maple Ave','Edison','NJ','08820','USA','Priya Shah','555-201-9988','Spouse','false'],
  ['Priya','Mehta','','Adult','','Female','Parent','Sunday School Teacher','Active','2021-09-01','Temple event','','priya.mehta@example.com','','555-410-7788','','Phone','45 Oak Street','Princeton','NJ','08540','USA','Rohan Mehta','555-410-1010','Spouse','true'],
  ['Rohan','Patel','Ron','Adult','','Male','Donor','General Member','Active','2019-03-20','Website','','rohan.patel@example.com','','555-665-1212','555-665-3434','SMS','88 Birch Lane','Iselin','NJ','08830','USA','Anita Patel','555-665-9090','Spouse','false'],
  ['Anita','Joshi','','Youth','Rutgers University','Female','Volunteer','Volunteer Lead','Active','2023-06-10','Instagram','Priya Mehta','anita.joshi@example.com','','555-887-2211','','WhatsApp','22 Cedar Court','New Brunswick','NJ','08901','USA','Vikram Joshi','555-887-3322','Father','false'],
  ['Vikram','Sharma','Vik','Adult','','Male','Member','President','Active','2010-05-05','Founding member','','vikram.sharma@example.com','','555-330-4455','','Email','9 Pine Drive','Parsippany','NJ','07054','USA','Meena Sharma','555-330-9911','Spouse','false'],
  ['Meena','Sharma','','Adult','','Female','Member','General Member','Active','2010-05-05','Spouse','Vikram Sharma','meena.sharma@example.com','','555-330-4456','','Phone','9 Pine Drive','Parsippany','NJ','07054','USA','Vikram Sharma','555-330-4455','Spouse','false'],
  ['Karan','Desai','','Teen','Edison High School','Male','Student','General Member','Active','2022-09-01','Parent','Nisha Desai','karan.desai@example.com','','555-220-5566','','Email','100 Elm Road','Edison','NJ','08817','USA','Nisha Desai','555-220-7788','Mother','true'],
  ['Nisha','Desai','','Adult','','Female','Parent','Event Coordinator','Active','2018-04-12','Friend','','nisha.desai@example.com','','555-220-7788','','Email','100 Elm Road','Edison','NJ','08817','USA','Sameer Desai','555-220-9090','Spouse','true'],
  ['Sameer','Kapoor','','Adult','','Male','Donor','Vice President','Active','2015-11-30','Community event','','sameer.kapoor@example.com','','555-554-6677','','Email','7 Willow Way','Morristown','NJ','07960','USA','Ritu Kapoor','555-554-8899','Spouse','false'],
  ['Ritu','Kapoor','','Adult','','Female','Volunteer','Secretary','Active','2016-02-14','Spouse','Sameer Kapoor','ritu.kapoor@example.com','','555-554-8899','','SMS','7 Willow Way','Morristown','NJ','07960','USA','Sameer Kapoor','555-554-6677','Spouse','false'],
  ['Devansh','Gupta','Dev','Teen','Iselin Middle School','Male','Student','General Member','New','2024-09-01','Parent','Anjali Gupta','devansh.gupta@example.com','','555-661-2233','','Email','55 Spruce St','Iselin','NJ','08830','USA','Anjali Gupta','555-661-4455','Mother','true'],
  ['Anjali','Gupta','','Adult','','Female','Parent','Youth Coordinator','Active','2020-07-22','Friend','','anjali.gupta@example.com','','555-661-4455','','Email','55 Spruce St','Iselin','NJ','08830','USA','Rakesh Gupta','555-661-7788','Spouse','true'],
];

function buildDummyRow(row: string[]) {
  const headers = ['first_name','last_name','preferred_name','age_group','school_name','gender','member_type','organization_role','membership_status','join_date','how_heard_about_us','referred_by','primary_email','secondary_email','primary_phone','secondary_phone','preferred_contact_method','street_address','city','state','zip_code','country','emergency_contact_name','emergency_contact_phone','emergency_contact_relationship','interested_in_gyanshala'];
  const obj: Record<string, any> = {};
  headers.forEach((h, i) => {
    if (h === 'interested_in_gyanshala') { obj[h] = row[i] === 'true'; return; }
    obj[h] = row[i] || null;
  });
  return obj;
}

type Member = Record<string, any>;

export default function MembersDatabasePanel() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingRows, setPendingRows] = useState<Record<string, any>[] | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('member_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setMembers((data as Member[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      if (typeFilter !== 'all' && m.member_type !== typeFilter) return false;
      if (statusFilter !== 'all' && m.membership_status !== statusFilter) return false;
      if (!q) return true;
      const blob = [
        m.first_name, m.last_name, m.primary_email, m.primary_phone,
        m.member_type, m.membership_status, m.city, m.organization_role,
      ].filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    });
  }, [members, search, typeFilter, statusFilter]);

  const exportMembers = async () => {
    const { data } = await supabase.from('member_profiles').select('*');
    const rows = (data || []).map((r: any) => {
      const out: any = { ...r };
      for (const k of TIMESTAMP_FIELDS) if (out[k]) out[k] = formatDate(out[k]);
      return out;
    });
    downloadCsv('members.csv', rowsToCsv(rows, MEMBER_COLUMNS));
    toast.success(`Downloaded ${rows.length} members`);
  };

  const seedDummy = async () => {
    setBusy(true);
    const rows = DUMMY_MEMBERS.map(buildDummyRow);
    const { error } = await supabase.from('member_profiles').insert(rows as any);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Added ${rows.length} dummy members`);
    load();
  };

  const onFilePicked = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = parseCsv(text);
      if (!parsed.length) return toast.error('CSV has no data rows');
      // Clean rows: keep only known columns, normalize blanks/dates.
      const valid = new Set(MEMBER_COLUMNS.map((c) => c.key));
      const cleaned = parsed.map((row) => {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(row)) {
          if (!valid.has(k)) continue;
          if (v === '' || v == null) { out[k] = null; continue; }
          if (DATE_FIELDS.has(k)) {
            const d = new Date(v);
            out[k] = isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
          } else if (TIMESTAMP_FIELDS.has(k)) {
            // let the DB regenerate timestamps on insert
            continue;
          } else {
            out[k] = v;
          }
        }
        // Drop primary key so inserts always create fresh rows.
        delete out.id;
        if (!out.user_id) delete out.user_id; // DB default will generate one
        return out;
      });
      setPendingRows(cleaned);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to read file');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const confirmReplace = async () => {
    if (!pendingRows) return;
    setBusy(true);
    const del = await supabase.from('member_profiles').delete().not('id', 'is', null);
    if (del.error) { setBusy(false); return toast.error(del.error.message); }
    if (pendingRows.length) {
      const ins = await supabase.from('member_profiles').insert(pendingRows as any);
      if (ins.error) { setBusy(false); return toast.error(ins.error.message); }
    }
    setBusy(false);
    setPendingRows(null);
    toast.success(`Replaced database with ${pendingRows.length} rows`);
    load();
  };
  const deleteAll = async () => {
    setBusy(true);
    const del = await supabase.from('member_profiles').delete().not('id', 'is', null);
    setBusy(false);
    setConfirmDeleteAll(false);
    if (del.error) return toast.error(del.error.message);
    toast.success('Deleted all members');
    load();
  };


  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-serif font-bold">Members Database</h2>
            <p className="text-muted-foreground text-sm">
              {filtered.length} of {members.length} member{members.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={seedDummy} disabled={busy}>
              <Database className="w-4 h-4 mr-2" />Add dummy data
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="w-4 h-4 mr-2" />Upload CSV (replace all)
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFilePicked(e.target.files[0])}
            />
            <Button variant="secondary" onClick={exportMembers}>
              <Download className="w-4 h-4 mr-2" />Download CSV
            </Button>
            <Button variant="destructive" onClick={() => setConfirmDeleteAll(true)} disabled={busy || members.length === 0}>
              <Trash2 className="w-4 h-4 mr-2" />Delete all
            </Button>
          </div>
        </div>

        <Card className="p-4 bg-muted/30 text-sm text-muted-foreground">
          <strong className="text-foreground">CSV format:</strong> headers must match the
          downloaded file's columns. Uploading <em>replaces every row</em> in the members
          table with the file's contents. Tip: download first, edit in Excel/Sheets, then
          re-upload.
        </Card>

        <Card className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {['Member','Parent','Student','Volunteer','Donor','Visitor'].map((x) =>
                <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {['New','Active','Visitor','Prospect'].map((x) =>
                <SelectItem key={x} value={x}>{x}</SelectItem>)}
            </SelectContent>
          </Select>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">
                    <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />Loading…
                  </td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-muted-foreground">
                    No members yet. Click <strong>Add dummy data</strong> to seed sample rows.
                  </td></tr>
                )}
                {filtered.map((m) => {
                  const name = [m.first_name, m.last_name].filter(Boolean).join(' ') || '—';
                  const initials = ((m.first_name?.[0] || '') + (m.last_name?.[0] || '')) || '?';
                  return (
                    <tr key={m.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-3">
                          {m.profile_picture_url ? (
                            <img src={m.profile_picture_url} alt="" className="h-9 w-9 rounded-full object-cover border" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-muted border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                              {initials.toUpperCase()}
                            </div>
                          )}
                          <span>{name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{m.primary_email || '—'}</td>
                      <td className="px-4 py-3">{m.primary_phone || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.city || '—'}</td>
                      <td className="px-4 py-3">
                        {m.member_type && <Badge variant="outline">{m.member_type}</Badge>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.organization_role || '—'}</td>
                      <td className="px-4 py-3">
                        {m.membership_status && <Badge>{m.membership_status}</Badge>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.created_at ? formatDate(m.created_at).slice(0, 10) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {m.user_id && (
                          <Link to={`/admin/members/${m.user_id}`}>
                            <Button size="sm" variant="ghost"><Eye className="w-4 h-4 mr-1" />View</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AlertDialog open={!!pendingRows} onOpenChange={(o) => !o && setPendingRows(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace entire members database?</AlertDialogTitle>
            <AlertDialogDescription>
              This will <strong>delete all {members.length} existing member{members.length === 1 ? '' : 's'}</strong> and
              insert <strong>{pendingRows?.length ?? 0} row{pendingRows?.length === 1 ? '' : 's'}</strong> from your CSV.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReplace} disabled={busy}>
              {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Replacing…</> : 'Replace all'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={confirmDeleteAll} onOpenChange={(o) => !o && setConfirmDeleteAll(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all members?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>all {members.length} member{members.length === 1 ? '' : 's'}</strong> from
              the database. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAll} disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : 'Delete all'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
