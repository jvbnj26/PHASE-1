# Database Reference — Harmony Hub (JVBNA NJ)

Supabase PostgreSQL. All tables are in the `public` schema. Row Level Security (RLS) is enabled.

---

## Tables

### `auth.users` (Supabase managed)
| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | TEXT | Login email |
| raw_user_meta_data | JSONB | `{ name, phone }` set at signup |
| created_at | TIMESTAMPTZ | |

**Trigger**: `on_auth_user_created` → calls `handle_new_user()` → inserts into `profiles`

---

### `profiles`
Basic profile auto-created on auth signup.

| Column | Type | Notes |
|---|---|---|
| id | UUID | = auth.users.id |
| email | TEXT | |
| name | TEXT | nullable |
| phone | TEXT | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**RLS**: Users read/update own row only

---

### `user_roles`
Role assignments for access control.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | References auth.users |
| role | app_role | ENUM: `'admin'` \| `'member'` |
| created_at | TIMESTAMPTZ | |

**RLS**: Admins only
**Function**: `has_role(_user_id UUID, _role app_role) RETURNS boolean`

Only `admin@jvbnj.org` has `admin` role currently. Additional admins are added by inserting a row here.

---

### `member_profiles`
Full member record — the core table.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | nullable — links to auth.users if they have an account |
| first_name | TEXT | |
| last_name | TEXT | |
| preferred_name | TEXT | |
| date_of_birth | DATE | |
| age_group | TEXT | Child/Teen/Adult/Senior |
| gender | TEXT | |
| marital_status | TEXT | |
| occupation | TEXT | |
| employer_or_school | TEXT | |
| language_preference | TEXT | |
| member_type | TEXT | Member/Parent/Student/Volunteer/Donor/Visitor |
| organization_role | TEXT | General Member, Board Member, President, etc. |
| membership_status | TEXT | New/Active/Visitor/Prospect |
| profile_picture_url | TEXT | base64 now → Supabase Storage URL target |
| join_date | DATE | |
| how_heard_about_us | TEXT | |
| referred_by | TEXT | |
| primary_email | TEXT | |
| secondary_email | TEXT | |
| primary_phone | TEXT | |
| secondary_phone | TEXT | |
| preferred_contact_method | TEXT | Email/SMS/Phone/WhatsApp |
| street_address | TEXT | |
| city | TEXT | |
| state | TEXT | |
| zip_code | TEXT | |
| country | TEXT | |
| emergency_contact_name | TEXT | |
| emergency_contact_phone | TEXT | |
| emergency_contact_relationship | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**RLS**: Users can read/update own row; admins can read/update all rows (policy TBD)
**CSV**: All columns exported/imported via admin CSV tool

---

### `households`
Family/household grouping.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| household_name | TEXT | e.g. "Shah Household" |
| primary_contact_user_id | UUID | Which member is the primary contact |
| street_address, city, state, zip_code, country | TEXT | Shared address |
| created_at, updated_at | TIMESTAMPTZ | |

---

### `household_members`
Links users to households (many-to-many).

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| household_id | UUID | → households.id |
| user_id | UUID | → auth.users.id |
| relationship_to_household | TEXT | Father/Mother/Spouse/Child/etc. |
| is_primary_contact | BOOLEAN | |
| created_at, updated_at | TIMESTAMPTZ | |

---

### `student_profiles`
Children/students linked to a parent member.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| parent_user_id | UUID | → auth.users.id (required) |
| household_id | UUID | → households.id (optional) |
| first_name, last_name | TEXT | |
| date_of_birth | DATE | |
| school_grade | TEXT | |
| religious_class_grade | TEXT | Gyanshala class level |
| allergies_medical_notes | TEXT | |
| emergency_contact_name, emergency_contact_phone | TEXT | |
| authorized_pickup_people | TEXT | Comma-separated names |
| photo_video_permission | BOOLEAN | |
| field_trip_permission | BOOLEAN | |
| parent_notes | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

---

### `program_enrollments`
Gyanshala/class enrollment preferences.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | → auth.users.id |
| student_id | UUID | → student_profiles.id (optional) |
| interested_programs | TEXT[] | Program names |
| current_class_group | TEXT | |
| previous_religious_education | TEXT | |
| preferred_program_time | TEXT | |
| attendance_expectation | TEXT | |
| accommodations | TEXT | Special needs |
| parent_volunteer_interest | BOOLEAN | |
| program_notes | TEXT | |
| created_at, updated_at | TIMESTAMPTZ | |

---

### `event_preferences`
Event interests and volunteer preferences.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | |
| interested_event_types | TEXT[] | Worship/service, Sunday school, etc. |
| meal_preference | TEXT | Vegetarian/Vegan/etc. |
| food_allergies | TEXT | |
| willing_to_volunteer | BOOLEAN | |
| volunteer_areas | TEXT[] | Setup/Cleanup/Teaching/Food/etc. |
| availability | TEXT[] | Weekdays/Weekends/Mornings/etc. |
| skills_talents | TEXT | |
| certifications | TEXT[] | CPR/First Aid/Teaching/etc. |
| created_at, updated_at | TIMESTAMPTZ | |

---

### `donation_preferences`
Giving interest and preferences (NOT actual transactions).

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | |
| interested_in_donating | BOOLEAN | |
| preferred_donation_type | TEXT | One-time/Recurring/Not sure |
| preferred_giving_category | TEXT[] | General fund/Building fund/etc. |
| tax_receipt_needed | BOOLEAN | |
| donation_receipt_email | TEXT | |
| employer_matching_interest | BOOLEAN | |
| anonymous_donation_preference | BOOLEAN | |
| created_at, updated_at | TIMESTAMPTZ | |

**Note**: This is preference data, not transaction data. Actual donations will go in a `donations` table (Stripe integration, Phase 4).

---

### `communication_preferences`
Notification opt-ins/opt-outs.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | |
| general_announcements | BOOLEAN | |
| event_reminders | BOOLEAN | |
| donation_reminders | BOOLEAN | |
| volunteer_requests | BOOLEAN | |
| emergency_alerts | BOOLEAN | |
| newsletter_frequency | TEXT | Weekly/Monthly/Only important/None |
| preferred_language | TEXT | For communication language |
| whatsapp_group_interest | BOOLEAN | |
| do_not_contact | BOOLEAN | Overrides all other preferences |
| created_at, updated_at | TIMESTAMPTZ | |

**Important**: Always check `do_not_contact` before sending any communication. It overrides all other flags.

---

### `consents`
GDPR-style consent records with timestamps. One row per consent event per user.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | |
| email_consent | BOOLEAN | |
| sms_consent | BOOLEAN | |
| photo_video_consent | BOOLEAN | |
| parent_guardian_consent | BOOLEAN | For children data |
| data_accuracy_confirmation | BOOLEAN | User confirmed data is correct |
| terms_accepted_at | TIMESTAMPTZ | |
| privacy_accepted_at | TIMESTAMPTZ | |
| consent_ip_address | TEXT | Captured at signup |
| consent_source | TEXT | `'signup_wizard'` or other source |
| created_at, updated_at | TIMESTAMPTZ | |

**Note**: Never delete consent records. They're the legal trail. Each re-consent creates a new row.

---

### `rsvps`
Event RSVPs per member.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | |
| event_id | TEXT | Currently matches event IDs from SiteContent (will be events.id once migrated) |
| event_title | TEXT | Denormalized for display without event lookup |
| created_at | TIMESTAMPTZ | |

**Unique**: `(user_id, event_id)` — one RSVP per user per event
**RLS**: Users can read/create/delete own RSVPs

---

### `custom_pages`
Admin-created CMS pages with block-based content.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| slug | TEXT | URL-safe identifier |
| parent_slug | TEXT | nullable — set for sub-pages |
| title | TEXT | |
| blocks | JSONB | Array of PageBlock objects |
| status | TEXT | `'draft'` \| `'published'` \| `'archived'` |
| created_by | UUID | Which admin created it |
| created_at, updated_at | TIMESTAMPTZ | |

**PageBlock** (JSONB structure):
```typescript
{
  id: string           // UUID
  layout: 'text' | 'image' | 'text-image-right' | 'text-image-left' | 'image-full'
  heading?: string
  body?: string
  imageUrl?: string    // base64 now → Supabase Storage URL target
  imageAlt?: string
}
```

**URLs**: `/p/:slug` (top-level), `/p/:parent_slug/:slug` (sub-page)
**Index**: `custom_pages_status_idx ON (status)` for filtering by status

---

### `admin_notes`
Internal notes on members, visible only to admins.

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | The member being noted |
| note | TEXT | |
| created_by_admin_id | UUID | Which admin wrote it |
| follow_up_date | DATE | Optional reminder date |
| follow_up_needed | BOOLEAN | |
| visibility | TEXT | nullable (for future: 'private', 'team') |
| created_at, updated_at | TIMESTAMPTZ | |

**RLS**: Admins only — members must never see their admin notes.

---

### `audit_logs`
Change history for member data (written by admin actions).

| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | The member whose data changed |
| action | TEXT | e.g. `'admin_update_profile'` |
| changed_by | UUID | Admin who made the change |
| old_value | JSONB | State before change |
| new_value | JSONB | State after change |
| created_at | TIMESTAMPTZ | |

**Note**: Never delete audit logs. Never update them. Insert-only.

---

## Planned Tables (Not Yet Created)

### `site_settings` (Phase 1)
```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
```
Replaces localStorage for all CMS content.

### `events` (Phase 1)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date_text TEXT,                   -- Display date string ("September 20th, 2025")
  date_parsed DATE,                 -- For sorting/filtering
  description TEXT,
  image_url TEXT,                   -- Supabase Storage URL
  video_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('upcoming', 'ongoing', 'past')),
  rsvp_link TEXT,
  registration_link TEXT,
  featured BOOLEAN DEFAULT false,   -- For homepage popup
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `donations` (Phase 4 — Stripe)
```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  category TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','refunded','failed')),
  receipt_email TEXT,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Database Functions

### `has_role(_user_id UUID, _role app_role) RETURNS boolean`
```sql
-- Returns true if the user has the specified role
SELECT has_role('user-uuid-here', 'admin');
```
Used in:
- `AuthContext.refreshAdminStatus()` — checks if logged-in user is admin
- RLS policies — `has_role(auth.uid(), 'admin')` for admin-only access

---

## Enums

### `app_role`
```sql
CREATE TYPE app_role AS ENUM ('admin', 'member');
```

---

## Indexes

| Table | Index | Column(s) |
|---|---|---|
| `custom_pages` | `custom_pages_status_idx` | `status` |
| `rsvps` | `unique (user_id, event_id)` | constraint |
| `member_profiles` | (none yet — add for search) | `last_name`, `primary_email` |
| `audit_logs` | (none yet) | `user_id`, `created_at` |

**Recommended indexes to add** (before member count grows):
```sql
CREATE INDEX member_profiles_name_idx ON member_profiles (last_name, first_name);
CREATE INDEX member_profiles_email_idx ON member_profiles (primary_email);
CREATE INDEX member_profiles_status_idx ON member_profiles (membership_status);
CREATE INDEX audit_logs_user_created_idx ON audit_logs (user_id, created_at DESC);
```
