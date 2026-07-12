import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrograms } from '@/hooks/usePrograms';
import { ChevronLeft, ChevronRight, Check, Trash2, Plus, Loader2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  formSchema, defaultValues, SignupForm, ChildInput,
  AGE_GROUPS, GENDERS, MEMBER_TYPES, MEMBERSHIP_STATUS, CONTACT_METHODS,
  NEWSLETTER_FREQ, MEAL_PREFS, EVENT_TYPES, VOLUNTEER_AREAS, AVAILABILITY,
  CERTIFICATIONS, GIVING_CATEGORIES, RELATIONSHIPS, ORGANIZATION_ROLES,
} from '@/lib/signupSchema';

const STEPS = [
  'Account', 'About You', 'Contact', 'Household', 'Programs',
  'Events', 'Giving', 'Communication', 'Consent', 'Review',
] as const;

type Errors = Record<string, string>;

function Field({
  label, required, error, children, hint,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function MultiCheck<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T[]; onChange: (v: T[]) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {options.map((opt) => {
        const checked = value.includes(opt);
        return (
          <label
            key={opt}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm transition-colors ${
              checked ? 'bg-primary/10 border-primary text-foreground' : 'bg-background hover:bg-muted'
            }`}
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(c) => onChange(c ? [...value, opt] : value.filter((v) => v !== opt))}
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

export default function MemberSignupWizard() {
  const navigate = useNavigate();
  const { programs: availablePrograms, isLoading: programsLoading } = usePrograms();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SignupForm>(defaultValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof SignupForm>(k: K, v: SignupForm[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => {
      if (!e[k as string]) return e;
      const n = { ...e }; delete n[k as string]; return n;
    });
  };

  const setChild = (i: number, patch: Partial<ChildInput>) =>
    set('children', data.children.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addChild = () =>
    set('children', [...data.children, {
      first_name: '', last_name: '', photo_video_permission: false, field_trip_permission: false,
    } as ChildInput]);
  const removeChild = (i: number) =>
    set('children', data.children.filter((_, idx) => idx !== i));

  const seedStep = (s: number) => {
    const patches: Partial<Record<number, Partial<SignupForm>>> = {
      0: {
        email: `anshddoshi+test${Date.now()}@gmail.com`,
        password: 'TestPass123!',
        confirm_password: 'TestPass123!',
        primary_phone: '732-555-0100',
        preferred_contact_method: 'Email',
        email_opt_in: true,
        sms_opt_in: false,
        terms_accepted: true as any,
        privacy_accepted: true as any,
      },
      1: {
        first_name: 'Arjun',
        last_name: 'Shah',
        preferred_name: 'AJ',
        date_of_birth: '1990-03-15',
        age_group: 'Adult',
        gender: 'Male',
        marital_status: 'Married',
        occupation: 'Software Engineer',
        employer_or_school: 'Tech Corp NJ',
        language_preference: 'English',
        member_type: 'Parent',
        organization_role: 'General Member',
        membership_status: 'New',
        how_heard_about_us: 'Friend',
        referred_by: 'Priya Mehta',
        has_household: true,
      },
      2: {
        secondary_email: 'arjun.backup@example.com',
        secondary_phone: '732-555-0101',
        street_address: '45 Maple Street',
        city: 'Iselin',
        state: 'NJ',
        zip_code: '08830',
        country: 'USA',
        emergency_contact_name: 'Priya Shah',
        emergency_contact_phone: '732-555-0102',
        emergency_contact_relationship: 'Spouse',
      },
      3: {
        household_name: 'Shah Family',
        spouse_partner_name: 'Priya Shah',
        relationship_to_household: 'Father',
        is_primary_household_contact: true,
        children: [{
          first_name: 'Anika', last_name: 'Shah',
          date_of_birth: '2015-07-22', school_grade: '3rd',
          religious_class_grade: 'Level 2',
          photo_video_permission: true, field_trip_permission: true,
          allergies_medical_notes: 'None',
          emergency_contact_name: 'Priya Shah',
          emergency_contact_phone: '732-555-0102',
          authorized_pickup_people: 'Priya Shah, Arjun Shah',
          parent_notes: '',
        }],
        wants_program_enrollment: true,
      },
      4: {
        interested_programs: ['Teacher', 'Coordinator'],
        current_class_group: 'Adult Swadhyay',
        preferred_program_time: 'Sunday mornings',
        attendance_expectation: 'Weekly',
        previous_religious_education: 'Gyanshala Level 3',
        accommodations: '',
        parent_volunteer_interest: true,
        program_notes: 'Happy to help with Gyanshala coordination',
      },
      5: {
        interested_event_types: ['Worship/service', 'Sunday school', 'Cultural events'],
        meal_preference: 'Vegetarian',
        food_allergies: 'None',
        willing_to_volunteer: true,
        volunteer_areas: ['Teaching', 'Registration'],
        availability: ['Weekends', 'Evenings'],
        skills_talents: 'Web development, public speaking, Hindi fluency',
        certifications: ['Teaching'],
      },
      6: {
        interested_in_donating: true,
        preferred_donation_type: 'Recurring',
        preferred_giving_category: ['General fund', 'Sunday school'],
        tax_receipt_needed: true,
        donation_receipt_email: 'arjun.tax@example.com',
        employer_matching_interest: true,
        anonymous_donation_preference: false,
      },
      7: {
        general_announcements: true,
        event_reminders: true,
        donation_reminders: true,
        volunteer_requests: true,
        emergency_alerts: true,
        newsletter_frequency: 'Monthly',
        preferred_language_comm: 'English',
        whatsapp_group_interest: true,
        do_not_contact: false,
      },
      8: {
        email_consent: true,
        sms_consent: true,
        photo_video_consent: true,
        parent_guardian_consent: true,
        data_accuracy_confirmation: true as any,
      },
    };
    const patch = patches[s];
    if (patch) {
      setData((d) => ({ ...d, ...patch }));
      setErrors({});
    }
  };

  const showHouseholdStep = data.member_type === 'Parent' || data.has_household;
  const showProgramsStep = data.wants_program_enrollment || data.children.length > 0;
  const showDonationDetails = data.interested_in_donating;
  const showVolunteerDetails = data.willing_to_volunteer;

  // Step fields to validate
  const stepFields: Record<number, (keyof SignupForm)[]> = {
    0: ['email', 'password', 'confirm_password', 'preferred_contact_method', 'terms_accepted', 'privacy_accepted', 'primary_phone'],
    1: ['first_name', 'last_name', 'age_group', 'gender', 'member_type', 'organization_role', 'membership_status'],
    2: [],
    3: showHouseholdStep ? ['children'] : [],
    4: [],
    5: [],
    6: showDonationDetails ? ['donation_receipt_email'] : [],
    7: [],
    8: ['data_accuracy_confirmation', 'parent_guardian_consent'],
    9: [],
  };

  const validateStep = (s: number): boolean => {
    const fields = stepFields[s] ?? [];
    const result = formSchema.safeParse(data);
    if (result.success) return true;
    const fieldSet = new Set(fields.map(String));
    const newErrs: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (s === STEPS.length - 1 || fieldSet.has(key)) {
        if (!newErrs[key]) newErrs[key] = issue.message;
      }
    }
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    // Skip household/programs steps when not applicable
    let n = step + 1;
    if (n === 3 && !showHouseholdStep) n = 4;
    if (n === 4 && !showProgramsStep) n = 5;
    setStep(Math.min(n, STEPS.length - 1));
  };
  const back = () => {
    let n = step - 1;
    if (n === 4 && !showProgramsStep) n = 3;
    if (n === 3 && !showHouseholdStep) n = 2;
    setStep(Math.max(n, 0));
  };

  const submit = async () => {
    const result = formSchema.safeParse(data);
    if (!result.success) {
      const e: Errors = {};
      for (const i of result.error.issues) {
        const k = String(i.path[0] ?? '');
        if (!e[k]) e[k] = i.message;
      }
      setErrors(e);
      toast.error('Please review the form — some fields are invalid');
      return;
    }

    setSubmitting(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { name: `${data.first_name} ${data.last_name}`, phone: data.primary_phone },
        },
      });
      if (signUpErr) throw signUpErr;
      const userId = signUpData.user?.id;
      if (!userId) throw new Error('Account created but no user id returned');

      // If email confirmation required, no session — surface that.
      const session = signUpData.session;
      if (!session) {
        toast.success('Account created! Check your email to confirm, then sign in to finish setup.');
        navigate('/auth?tab=signin');
        return;
      }

      // Insert all profile pieces (RLS scoped to auth.uid())
      const now = new Date().toISOString();

      const { error: mpErr } = await supabase.from('member_profiles').insert({
        user_id: userId,
        first_name: data.first_name, last_name: data.last_name,
        preferred_name: data.preferred_name || null,
        date_of_birth: data.date_of_birth || null,
        age_group: data.age_group, gender: data.gender,
        marital_status: data.marital_status || null,
        occupation: data.occupation || null,
        employer_or_school: data.employer_or_school || null,
        language_preference: data.language_preference || null,
        member_type: data.member_type, membership_status: data.membership_status,
        organization_role: data.organization_role,
        profile_picture_url: data.profile_picture_url || null,
        how_heard_about_us: data.how_heard_about_us || null,
        referred_by: data.referred_by || null,
        primary_email: data.email,
        secondary_email: data.secondary_email || null,
        primary_phone: data.primary_phone || null,
        secondary_phone: data.secondary_phone || null,
        preferred_contact_method: data.preferred_contact_method,
        street_address: data.street_address || null,
        city: data.city || null, state: data.state || null,
        zip_code: data.zip_code || null, country: data.country || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        emergency_contact_relationship: data.emergency_contact_relationship || null,
      });
      if (mpErr) throw mpErr;

      let householdId: string | null = null;
      if (showHouseholdStep) {
        const { data: hh, error: hhErr } = await supabase.from('households').insert({
          household_name: data.household_name || `${data.last_name} Household`,
          primary_contact_user_id: userId,
          street_address: data.street_address || null,
          city: data.city || null, state: data.state || null,
          zip_code: data.zip_code || null, country: data.country || null,
        }).select('id').single();
        if (hhErr) throw hhErr;
        householdId = hh.id;
        await supabase.from('household_members').insert({
          household_id: householdId, user_id: userId,
          relationship_to_household: data.relationship_to_household || null,
          is_primary_contact: data.is_primary_household_contact,
        });
        if (data.children.length) {
          await supabase.from('student_profiles').insert(
            data.children.map((c) => ({
              parent_user_id: userId, household_id: householdId,
              first_name: c.first_name, last_name: c.last_name,
              date_of_birth: c.date_of_birth || null,
              school_grade: c.school_grade || null,
              religious_class_grade: c.religious_class_grade || null,
              allergies_medical_notes: c.allergies_medical_notes || null,
              emergency_contact_name: c.emergency_contact_name || null,
              emergency_contact_phone: c.emergency_contact_phone || null,
              authorized_pickup_people: c.authorized_pickup_people || null,
              photo_video_permission: c.photo_video_permission,
              field_trip_permission: c.field_trip_permission,
              parent_notes: c.parent_notes || null,
            })),
          );
        }
      }

      if (showProgramsStep) {
        await supabase.from('program_enrollments').insert({
          user_id: userId,
          interested_programs: data.interested_programs,
          current_class_group: data.current_class_group || null,
          previous_religious_education: data.previous_religious_education || null,
          preferred_program_time: data.preferred_program_time || null,
          attendance_expectation: data.attendance_expectation || null,
          accommodations: data.accommodations || null,
          parent_volunteer_interest: data.parent_volunteer_interest,
          program_notes: data.program_notes || null,
        });
      }

      await supabase.from('event_preferences').insert({
        user_id: userId,
        interested_event_types: data.interested_event_types,
        meal_preference: data.meal_preference || null,
        food_allergies: data.food_allergies || null,
        willing_to_volunteer: data.willing_to_volunteer,
        volunteer_areas: showVolunteerDetails ? data.volunteer_areas : [],
        availability: showVolunteerDetails ? data.availability : [],
        skills_talents: showVolunteerDetails ? data.skills_talents || null : null,
        certifications: showVolunteerDetails ? data.certifications : [],
      });

      await supabase.from('donation_preferences').insert({
        user_id: userId,
        interested_in_donating: data.interested_in_donating,
        preferred_donation_type: showDonationDetails ? data.preferred_donation_type || null : null,
        preferred_giving_category: showDonationDetails ? data.preferred_giving_category : [],
        tax_receipt_needed: data.tax_receipt_needed,
        donation_receipt_email: data.donation_receipt_email || null,
        employer_matching_interest: data.employer_matching_interest,
        anonymous_donation_preference: data.anonymous_donation_preference,
      });

      await supabase.from('communication_preferences').insert({
        user_id: userId,
        general_announcements: data.general_announcements,
        event_reminders: data.event_reminders,
        donation_reminders: data.donation_reminders,
        volunteer_requests: data.volunteer_requests,
        emergency_alerts: data.emergency_alerts,
        newsletter_frequency: data.newsletter_frequency,
        preferred_language: data.preferred_language_comm || null,
        whatsapp_group_interest: data.whatsapp_group_interest,
        do_not_contact: data.do_not_contact,
      });

      await supabase.from('consents').insert({
        user_id: userId,
        parent_guardian_consent: data.parent_guardian_consent,
        photo_video_consent: data.photo_video_consent,
        sms_consent: data.sms_consent,
        email_consent: data.email_consent,
        data_accuracy_confirmation: data.data_accuracy_confirmation,
        terms_accepted_at: now,
        privacy_accepted_at: now,
        consent_source: 'signup_wizard',
      });

      toast.success('Welcome! Your account has been created.');
      navigate('/');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        {step === 0 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Create your account</h2>
            <p className="text-sm text-muted-foreground">We'll use this to securely sign you in.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" required error={errors.email}>
                <Input type="email" value={data.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Phone" error={errors.primary_phone}>
                <Input value={data.primary_phone} onChange={(e) => set('primary_phone', e.target.value)} />
              </Field>
              <Field label="Password" required error={errors.password} hint="At least 8 characters">
                <Input type="password" value={data.password} onChange={(e) => set('password', e.target.value)} />
              </Field>
              <Field label="Confirm password" required error={errors.confirm_password}>
                <Input type="password" value={data.confirm_password} onChange={(e) => set('confirm_password', e.target.value)} />
              </Field>
              <Field label="Preferred contact method" required>
                <Select value={data.preferred_contact_method} onValueChange={(v) => set('preferred_contact_method', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTACT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={data.email_opt_in} onCheckedChange={(c) => set('email_opt_in', !!c)} />
                Email me announcements and reminders
              </label>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={data.sms_opt_in} onCheckedChange={(c) => set('sms_opt_in', !!c)} />
                Text me SMS reminders (requires phone)
              </label>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={data.terms_accepted} onCheckedChange={(c) => set('terms_accepted', (!!c) as any)} />
                I accept the Terms and Conditions <span className="text-destructive">*</span>
              </label>
              {errors.terms_accepted && <p className="text-xs text-destructive">{errors.terms_accepted}</p>}
              <label className="flex items-start gap-2 text-sm">
                <Checkbox checked={data.privacy_accepted} onCheckedChange={(c) => set('privacy_accepted', (!!c) as any)} />
                I accept the Privacy Policy <span className="text-destructive">*</span>
              </label>
              {errors.privacy_accepted && <p className="text-xs text-destructive">{errors.privacy_accepted}</p>}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Tell us about you</h2>
            <Field label="Profile picture" hint="JPG/PNG, up to 2MB. Optional.">
              <div className="flex items-center gap-4">
                {data.profile_picture_url ? (
                  <img src={data.profile_picture_url} alt="Profile" className="h-20 w-20 rounded-full object-cover border" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-muted border flex items-center justify-center text-xs text-muted-foreground">
                    No photo
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    className="max-w-[260px]"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
                      const reader = new FileReader();
                      reader.onload = () => set('profile_picture_url', String(reader.result));
                      reader.readAsDataURL(file);
                    }}
                  />
                  {data.profile_picture_url && (
                    <Button type="button" variant="outline" size="sm" onClick={() => set('profile_picture_url', '')}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First name" required error={errors.first_name}>
                <Input value={data.first_name} onChange={(e) => set('first_name', e.target.value)} />
              </Field>
              <Field label="Last name" required error={errors.last_name}>
                <Input value={data.last_name} onChange={(e) => set('last_name', e.target.value)} />
              </Field>
              <Field label="Preferred name">
                <Input value={data.preferred_name} onChange={(e) => set('preferred_name', e.target.value)} />
              </Field>
              <Field label="Date of birth">
                <Input type="date" value={data.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
              </Field>
              <Field label="Age group" required>
                <Select value={data.age_group} onValueChange={(v) => set('age_group', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AGE_GROUPS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Gender" required>
                <Select value={data.gender} onValueChange={(v) => set('gender', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GENDERS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Marital status">
                <Input value={data.marital_status} onChange={(e) => set('marital_status', e.target.value)} />
              </Field>
              <Field label="Occupation">
                <Input value={data.occupation} onChange={(e) => set('occupation', e.target.value)} />
              </Field>
              <Field label="Employer or school">
                <Input value={data.employer_or_school} onChange={(e) => set('employer_or_school', e.target.value)} />
              </Field>
              <Field label="Language preference">
                <Input value={data.language_preference} onChange={(e) => set('language_preference', e.target.value)} />
              </Field>
              <Field label="Member type" required>
                <Select value={data.member_type} onValueChange={(v) => set('member_type', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MEMBER_TYPES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Organization role" required hint="Your role in JVBNA. Admins can update this later.">
                <Select value={data.organization_role} onValueChange={(v) => set('organization_role', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORGANIZATION_ROLES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Membership status" required>
                <Select value={data.membership_status} onValueChange={(v) => set('membership_status', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MEMBERSHIP_STATUS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="How did you hear about us?">
                <Input value={data.how_heard_about_us} onChange={(e) => set('how_heard_about_us', e.target.value)} />
              </Field>
              <Field label="Referred by">
                <Input value={data.referred_by} onChange={(e) => set('referred_by', e.target.value)} />
              </Field>
            </div>
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={data.has_household} onCheckedChange={(c) => set('has_household', !!c)} />
                I want to register household / family info
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Contact & address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Secondary email"><Input type="email" value={data.secondary_email} onChange={(e) => set('secondary_email', e.target.value)} /></Field>
              <Field label="Secondary phone"><Input value={data.secondary_phone} onChange={(e) => set('secondary_phone', e.target.value)} /></Field>
              <Field label="Street address"><Input value={data.street_address} onChange={(e) => set('street_address', e.target.value)} /></Field>
              <Field label="City"><Input value={data.city} onChange={(e) => set('city', e.target.value)} /></Field>
              <Field label="State"><Input value={data.state} onChange={(e) => set('state', e.target.value)} /></Field>
              <Field label="ZIP code"><Input value={data.zip_code} onChange={(e) => set('zip_code', e.target.value)} /></Field>
              <Field label="Country"><Input value={data.country} onChange={(e) => set('country', e.target.value)} /></Field>
            </div>
            <div className="pt-2">
              <h3 className="font-semibold text-sm mb-2">Emergency contact</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Name"><Input value={data.emergency_contact_name} onChange={(e) => set('emergency_contact_name', e.target.value)} /></Field>
                <Field label="Phone"><Input value={data.emergency_contact_phone} onChange={(e) => set('emergency_contact_phone', e.target.value)} /></Field>
                <Field label="Relationship"><Input value={data.emergency_contact_relationship} onChange={(e) => set('emergency_contact_relationship', e.target.value)} /></Field>
              </div>
            </div>
          </>
        )}

        {step === 3 && showHouseholdStep && (
          <>
            <h2 className="text-2xl font-serif font-bold">Household & family</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Household name"><Input value={data.household_name} onChange={(e) => set('household_name', e.target.value)} /></Field>
              <Field label="Spouse / partner name"><Input value={data.spouse_partner_name} onChange={(e) => set('spouse_partner_name', e.target.value)} /></Field>
              <Field label="Your relationship to household">
                <Select value={data.relationship_to_household} onValueChange={(v) => set('relationship_to_household', v as any)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{RELATIONSHIPS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Are you the primary household contact?">
                <label className="flex items-center gap-2 text-sm h-10">
                  <Checkbox checked={data.is_primary_household_contact} onCheckedChange={(c) => set('is_primary_household_contact', !!c)} />
                  Yes
                </label>
              </Field>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Children / students</h3>
                <Button type="button" variant="outline" size="sm" onClick={addChild}>
                  <Plus className="w-4 h-4 mr-1" />Add child
                </Button>
              </div>
              {errors.children && <p className="text-xs text-destructive mb-2">{errors.children}</p>}
              {data.children.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No children added.</p>
              )}
              <div className="space-y-4">
                {data.children.map((c, i) => (
                  <Card key={i} className="p-4 space-y-3 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">Child #{i + 1}</p>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeChild(i)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="First name" required><Input value={c.first_name} onChange={(e) => setChild(i, { first_name: e.target.value })} /></Field>
                      <Field label="Last name" required><Input value={c.last_name} onChange={(e) => setChild(i, { last_name: e.target.value })} /></Field>
                      <Field label="Date of birth"><Input type="date" value={c.date_of_birth || ''} onChange={(e) => setChild(i, { date_of_birth: e.target.value })} /></Field>
                      <Field label="School grade"><Input value={c.school_grade || ''} onChange={(e) => setChild(i, { school_grade: e.target.value })} /></Field>
                      <Field label="Religious class grade"><Input value={c.religious_class_grade || ''} onChange={(e) => setChild(i, { religious_class_grade: e.target.value })} /></Field>
                      <Field label="Emergency contact name"><Input value={c.emergency_contact_name || ''} onChange={(e) => setChild(i, { emergency_contact_name: e.target.value })} /></Field>
                      <Field label="Emergency contact phone"><Input value={c.emergency_contact_phone || ''} onChange={(e) => setChild(i, { emergency_contact_phone: e.target.value })} /></Field>
                      <Field label="Authorized pickup people"><Input value={c.authorized_pickup_people || ''} onChange={(e) => setChild(i, { authorized_pickup_people: e.target.value })} /></Field>
                    </div>
                    <Field label="Allergies / medical notes">
                      <Textarea rows={2} value={c.allergies_medical_notes || ''} onChange={(e) => setChild(i, { allergies_medical_notes: e.target.value })} />
                    </Field>
                    <Field label="Parent / guardian notes">
                      <Textarea rows={2} value={c.parent_notes || ''} onChange={(e) => setChild(i, { parent_notes: e.target.value })} />
                    </Field>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <label className="flex items-center gap-2">
                        <Checkbox checked={c.photo_video_permission} onCheckedChange={(v) => setChild(i, { photo_video_permission: !!v })} />
                        Photo / video permission
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox checked={c.field_trip_permission} onCheckedChange={(v) => setChild(i, { field_trip_permission: !!v })} />
                        Field trip permission
                      </label>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={data.wants_program_enrollment} onCheckedChange={(c) => set('wants_program_enrollment', !!c)} />
                We're interested in religious school / programs
              </label>
            </div>
          </>
        )}

        {step === 4 && showProgramsStep && (
          <>
            <h2 className="text-2xl font-serif font-bold">Program enrollment</h2>
            <Field label="Programs & roles" hint="Select all that apply. Programs are configured by the admin.">
              {programsLoading ? (
                <p className="text-sm text-muted-foreground">Loading programs…</p>
              ) : availablePrograms.filter((p) => p.active).length === 0 ? (
                <p className="text-sm text-muted-foreground">No programs available at this time.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availablePrograms.filter((p) => p.active).map((prog) => {
                    const checked = data.interested_programs.includes(prog.name);
                    return (
                      <label
                        key={prog.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm transition-colors ${
                          checked ? 'bg-primary/10 border-primary text-foreground' : 'bg-background hover:bg-muted'
                        }`}
                        title={prog.description}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            set(
                              'interested_programs',
                              c
                                ? [...data.interested_programs, prog.name]
                                : data.interested_programs.filter((n) => n !== prog.name),
                            )
                          }
                        />
                        {prog.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Current class / group"><Input value={data.current_class_group} onChange={(e) => set('current_class_group', e.target.value)} /></Field>
              <Field label="Preferred service / program time"><Input value={data.preferred_program_time} onChange={(e) => set('preferred_program_time', e.target.value)} /></Field>
              <Field label="Attendance expectation"><Input value={data.attendance_expectation} onChange={(e) => set('attendance_expectation', e.target.value)} /></Field>
              <Field label="Previous religious education"><Input value={data.previous_religious_education} onChange={(e) => set('previous_religious_education', e.target.value)} /></Field>
            </div>
            <Field label="Special accommodations">
              <Textarea rows={2} value={data.accommodations} onChange={(e) => set('accommodations', e.target.value)} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={data.parent_volunteer_interest} onCheckedChange={(c) => set('parent_volunteer_interest', !!c)} />
              Parent interested in volunteering with programs
            </label>
            <Field label="Additional program notes">
              <Textarea rows={2} value={data.program_notes} onChange={(e) => set('program_notes', e.target.value)} />
            </Field>
          </>
        )}

        {step === 5 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Events & community</h2>
            <Field label="Interested event types">
              <MultiCheck options={EVENT_TYPES} value={data.interested_event_types} onChange={(v) => set('interested_event_types', v)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Meal preference">
                <Select value={data.meal_preference} onValueChange={(v) => set('meal_preference', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MEAL_PREFS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Food allergies"><Input value={data.food_allergies} onChange={(e) => set('food_allergies', e.target.value)} /></Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={data.willing_to_volunteer} onCheckedChange={(c) => set('willing_to_volunteer', !!c)} />
              I'd like to volunteer at events
            </label>
            {showVolunteerDetails && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                <Field label="Volunteer areas">
                  <MultiCheck options={VOLUNTEER_AREAS} value={data.volunteer_areas} onChange={(v) => set('volunteer_areas', v)} />
                </Field>
                <Field label="Availability">
                  <MultiCheck options={AVAILABILITY} value={data.availability} onChange={(v) => set('availability', v)} />
                </Field>
                <Field label="Skills / talents">
                  <Textarea rows={2} value={data.skills_talents} onChange={(e) => set('skills_talents', e.target.value)} />
                </Field>
                <Field label="Certifications">
                  <MultiCheck options={CERTIFICATIONS} value={data.certifications} onChange={(v) => set('certifications', v)} />
                </Field>
              </div>
            )}
          </>
        )}

        {step === 6 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Giving preferences</h2>
            <p className="text-sm text-muted-foreground">
              We never collect card numbers or bank credentials here. This is only your interest.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={data.interested_in_donating} onCheckedChange={(c) => set('interested_in_donating', !!c)} />
              I'm interested in donating
            </label>
            {showDonationDetails && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Donation type">
                    <Select value={data.preferred_donation_type} onValueChange={(v) => set('preferred_donation_type', v as any)}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="One-time">One-time</SelectItem>
                        <SelectItem value="Recurring">Recurring</SelectItem>
                        <SelectItem value="Not sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Receipt email" error={errors.donation_receipt_email}>
                    <Input type="email" value={data.donation_receipt_email} onChange={(e) => set('donation_receipt_email', e.target.value)} />
                  </Field>
                </div>
                <Field label="Giving categories">
                  <MultiCheck options={GIVING_CATEGORIES} value={data.preferred_giving_category} onChange={(v) => set('preferred_giving_category', v)} />
                </Field>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={data.tax_receipt_needed} onCheckedChange={(c) => set('tax_receipt_needed', !!c)} />
                    I'd like a tax receipt
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={data.employer_matching_interest} onCheckedChange={(c) => set('employer_matching_interest', !!c)} />
                    Interested in employer matching gifts
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={data.anonymous_donation_preference} onCheckedChange={(c) => set('anonymous_donation_preference', !!c)} />
                    Keep my donations anonymous
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        {step === 7 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Communication preferences</h2>
            <div className="space-y-2">
              {([
                ['general_announcements', 'General announcements'],
                ['event_reminders', 'Event reminders'],
                ['donation_reminders', 'Donation reminders'],
                ['volunteer_requests', 'Volunteer requests'],
                ['emergency_alerts', 'Emergency alerts'],
                ['whatsapp_group_interest', 'WhatsApp group'],
                ['do_not_contact', 'Do not contact me'],
              ] as const).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={data[k] as boolean} onCheckedChange={(c) => set(k as any, !!c)} />
                  {l}
                </label>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Newsletter frequency">
                <Select value={data.newsletter_frequency} onValueChange={(v) => set('newsletter_frequency', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{NEWSLETTER_FREQ.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Preferred language">
                <Input value={data.preferred_language_comm} onChange={(e) => set('preferred_language_comm', e.target.value)} />
              </Field>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Consent & privacy</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-start gap-2">
                <Checkbox checked={data.email_consent} onCheckedChange={(c) => set('email_consent', !!c)} />
                I consent to receive email communications
              </label>
              <label className="flex items-start gap-2">
                <Checkbox checked={data.sms_consent} onCheckedChange={(c) => set('sms_consent', !!c)} />
                I consent to receive SMS communications
              </label>
              <label className="flex items-start gap-2">
                <Checkbox checked={data.photo_video_consent} onCheckedChange={(c) => set('photo_video_consent', !!c)} />
                I consent to photo / video use at events
              </label>
              {data.children.length > 0 && (
                <>
                  <label className="flex items-start gap-2">
                    <Checkbox checked={data.parent_guardian_consent} onCheckedChange={(c) => set('parent_guardian_consent', !!c)} />
                    As parent/guardian, I consent to my children's profiles being stored <span className="text-destructive">*</span>
                  </label>
                  {errors.parent_guardian_consent && <p className="text-xs text-destructive ml-6">{errors.parent_guardian_consent}</p>}
                </>
              )}
              <label className="flex items-start gap-2">
                <Checkbox checked={data.data_accuracy_confirmation} onCheckedChange={(c) => set('data_accuracy_confirmation', (!!c) as any)} />
                I confirm the information I've provided is accurate <span className="text-destructive">*</span>
              </label>
              {errors.data_accuracy_confirmation && <p className="text-xs text-destructive ml-6">{errors.data_accuracy_confirmation}</p>}
            </div>
          </>
        )}

        {step === 9 && (
          <>
            <h2 className="text-2xl font-serif font-bold">Review & submit</h2>
            <p className="text-sm text-muted-foreground">Make sure everything looks right before creating your account.</p>
            <ReviewSection title="Account" onEdit={() => setStep(0)}>
              <Row k="Email" v={data.email} />
              <Row k="Phone" v={data.primary_phone} />
              <Row k="Preferred contact" v={data.preferred_contact_method} />
            </ReviewSection>
            <ReviewSection title="About you" onEdit={() => setStep(1)}>
              <Row k="Name" v={`${data.first_name} ${data.last_name}`} />
              <Row k="Age group" v={data.age_group} />
              <Row k="Member type" v={data.member_type} />
              <Row k="Organization role" v={data.organization_role} />
              <Row k="Photo" v={data.profile_picture_url ? 'Uploaded' : '—'} />
              <Row k="Status" v={data.membership_status} />

            </ReviewSection>
            <ReviewSection title="Address" onEdit={() => setStep(2)}>
              <Row k="Address" v={[data.street_address, data.city, data.state, data.zip_code].filter(Boolean).join(', ')} />
              <Row k="Emergency contact" v={data.emergency_contact_name} />
            </ReviewSection>
            {showHouseholdStep && (
              <ReviewSection title="Household" onEdit={() => setStep(3)}>
                <Row k="Household" v={data.household_name} />
                <Row k="Children" v={`${data.children.length}`} />
              </ReviewSection>
            )}
            {showProgramsStep && (
              <ReviewSection title="Programs" onEdit={() => setStep(4)}>
                <Row k="Programs" v={data.interested_programs.join(', ')} />
              </ReviewSection>
            )}
            <ReviewSection title="Events & volunteering" onEdit={() => setStep(5)}>
              <Row k="Event types" v={data.interested_event_types.join(', ')} />
              <Row k="Willing to volunteer" v={data.willing_to_volunteer ? 'Yes' : 'No'} />
            </ReviewSection>
            <ReviewSection title="Giving" onEdit={() => setStep(6)}>
              <Row k="Interested in donating" v={data.interested_in_donating ? 'Yes' : 'No'} />
            </ReviewSection>
            <ReviewSection title="Communication" onEdit={() => setStep(7)}>
              <Row k="Newsletter" v={data.newsletter_frequency} />
            </ReviewSection>
          </>
        )}

        {/* Dev seed button — fills dummy data for the current step */}
        {step < STEPS.length - 1 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground gap-1.5 opacity-60 hover:opacity-100"
              onClick={() => seedStep(step)}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Fill test data
            </Button>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={back} disabled={step === 0 || submitting}>
            <ChevronLeft className="w-4 h-4 mr-1" />Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} variant="secondary">
              Next<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} variant="secondary" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Creating…</> : <><Check className="w-4 h-4 mr-1" />Create Account</>}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <Card className="p-4 bg-muted/20">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
      </div>
      <div className="space-y-1">{children}</div>
    </Card>
  );
}
function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium break-words">{v || '—'}</span>
    </div>
  );
}
