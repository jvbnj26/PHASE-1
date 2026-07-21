import { z } from 'zod';

export const AGE_GROUPS = ['Teen', 'Youth', 'Adult'] as const;
export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
export const MEMBER_TYPES = ['Member', 'Parent', 'Student', 'Volunteer', 'Donor', 'Visitor'] as const;
export const CONTACT_METHODS = ['Email', 'SMS', 'Phone', 'WhatsApp'] as const;
export const NEWSLETTER_FREQ = ['Weekly', 'Monthly', 'Only important updates', 'None'] as const;
export const EVENT_TYPES = [
  'Worship/service', 'Sunday school', 'Youth events', 'Volunteer events',
  'Fundraisers', 'Community meals', 'Cultural events', 'Study groups',
] as const;
export const VOLUNTEER_AREAS = [
  'Setup', 'Cleanup', 'Teaching', 'Food', 'Parking', 'Registration',
  'Music', 'Fundraising', 'Technology', 'Photography', 'Other',
] as const;
export const AVAILABILITY = ['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'] as const;
export const RELATIONSHIPS = ['Father', 'Mother', 'Child', 'Spouse', 'Grandparent', 'Guardian', 'Other'] as const;
export const ORGANIZATION_ROLES = [
  'General Member',
  'Board Member',
  'Executive Committee',
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Sunday School Teacher',
  'Youth Coordinator',
  'Event Coordinator',
  'Volunteer Lead',
  'Volunteer',
  'Donor',
  'Visitor',
] as const;
export const DONOR_CATEGORIES = ['Danveer', 'Punyamitra', 'Hitaishi', 'Sadharmik Vatsalya', 'Tithi'] as const;

export const childSchema = z.object({
  first_name: z.string().trim().min(1, 'Required').max(80),
  last_name: z.string().trim().min(1, 'Required').max(80),
  date_of_birth: z.string().optional(),
  school_grade: z.string().max(40).optional(),
  religious_class_grade: z.string().max(40).optional(),
  allergies_medical_notes: z.string().max(1000).optional(),
  emergency_contact_name: z.string().max(120).optional(),
  emergency_contact_phone: z.string().max(40).optional(),
  authorized_pickup_people: z.string().max(500).optional(),
  photo_video_permission: z.boolean().default(false),
  field_trip_permission: z.boolean().default(false),
  parent_notes: z.string().max(1000).optional(),
});

export type ChildInput = z.infer<typeof childSchema>;

export const formSchema = z
  .object({
    // Step 1 — Account
    email: z.string().trim().email('Invalid email').max(255),
    password: z.string().min(8, 'At least 8 characters').max(72),
    confirm_password: z.string(),
    primary_phone: z.string().trim().max(40).optional().or(z.literal('')),
    preferred_contact_method: z.enum(CONTACT_METHODS),
    email_opt_in: z.boolean().default(true),
    sms_opt_in: z.boolean().default(false),
    terms_accepted: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
    privacy_accepted: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),

    // Step 2 — About You
    first_name: z.string().trim().min(1).max(80),
    last_name: z.string().trim().min(1).max(80),
    preferred_name: z.string().max(80).optional(),
    age_group: z.enum(AGE_GROUPS),
    school_name: z.string().max(160).optional(),
    gender: z.enum(GENDERS),
    member_type: z.enum(MEMBER_TYPES),
    organization_role: z.enum(ORGANIZATION_ROLES).default('General Member'),
    donor_category: z.enum(DONOR_CATEGORIES).optional(),
    profile_picture_url: z.string().max(2_000_000).optional().or(z.literal('')),
    how_heard_about_us: z.string().max(200).optional(),
    referred_by: z.string().max(120).optional(),

    // Step 3 — Contact & address
    secondary_email: z.string().email().optional().or(z.literal('')),
    secondary_phone: z.string().max(40).optional(),
    street_address: z.string().trim().min(1, 'Required').max(200),
    city: z.string().trim().min(1, 'Required').max(80),
    state: z.string().trim().min(1, 'Required').max(80),
    zip_code: z.string().trim().min(1, 'Required').max(20),
    country: z.string().max(80).optional(),
    emergency_contact_name: z.string().max(120).optional(),
    emergency_contact_phone: z.string().max(40).optional(),
    emergency_contact_relationship: z.string().max(60).optional(),

    // Step 4 — Household & family (conditional)
    has_household: z.boolean().default(false),
    household_name: z.string().max(120).optional(),
    is_primary_household_contact: z.boolean().default(true),
    relationship_to_household: z.enum(RELATIONSHIPS).optional(),
    spouse_partner_name: z.string().max(120).optional(),
    children: z.array(childSchema).default([]),
    interested_in_gyanshala: z.boolean().default(false),

    // Step 5 — Events & community
    interested_event_types: z.array(z.enum(EVENT_TYPES)).default([]),
    willing_to_volunteer: z.boolean().default(false),
    volunteer_areas: z.array(z.enum(VOLUNTEER_AREAS)).default([]),
    availability: z.array(z.enum(AVAILABILITY)).default([]),

    // Step 6 — Giving
    donation_receipt_email: z.string().email().optional().or(z.literal('')),

    // Step 7 — Communication
    general_announcements: z.boolean().default(true),
    event_reminders: z.boolean().default(true),
    donation_reminders: z.boolean().default(false),
    volunteer_requests: z.boolean().default(false),
    newsletter_frequency: z.enum(NEWSLETTER_FREQ).default('Monthly'),
    preferred_language_comm: z.string().max(40).optional(),
    whatsapp_group_interest: z.boolean().default(false),
    do_not_contact: z.boolean().default(false),

    // Step 8 — Consent & privacy
    parent_guardian_consent: z.boolean().default(false),
    photo_video_consent: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
    sms_consent: z.boolean().default(false),
    email_consent: z.boolean().default(true),
    data_accuracy_confirmation: z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })
  .refine((d) => !d.sms_opt_in || (d.primary_phone && d.primary_phone.length > 5), {
    path: ['primary_phone'],
    message: 'Phone required for SMS opt-in',
  })
  .refine((d) => d.children.length === 0 || d.parent_guardian_consent, {
    path: ['parent_guardian_consent'],
    message: 'Required when adding children',
  });

export type SignupForm = z.infer<typeof formSchema>;

export const defaultValues: SignupForm = {
  email: '', password: '', confirm_password: '',
  primary_phone: '', preferred_contact_method: 'Email',
  email_opt_in: true, sms_opt_in: false,
  terms_accepted: true as any, privacy_accepted: true as any,
  first_name: '', last_name: '', preferred_name: '',
  age_group: 'Adult', school_name: '', gender: 'Prefer not to say',
  member_type: 'Member',
  organization_role: 'General Member', donor_category: undefined,
  profile_picture_url: '',
  how_heard_about_us: '', referred_by: '',
  secondary_email: '', secondary_phone: '',
  street_address: '', city: '', state: '', zip_code: '', country: 'USA',
  emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relationship: '',
  has_household: false, household_name: '', is_primary_household_contact: true,
  relationship_to_household: undefined, spouse_partner_name: 'NA', children: [],
  interested_in_gyanshala: false,
  interested_event_types: [],
  willing_to_volunteer: false,
  volunteer_areas: [], availability: [],
  donation_receipt_email: '',
  general_announcements: true, event_reminders: true,
  donation_reminders: false, volunteer_requests: false,
  newsletter_frequency: 'Monthly', preferred_language_comm: 'English',
  whatsapp_group_interest: false, do_not_contact: false,
  parent_guardian_consent: false, photo_video_consent: true as any,
  sms_consent: false, email_consent: true,
  data_accuracy_confirmation: true as any,
} as SignupForm;
