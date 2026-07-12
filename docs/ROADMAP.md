# Development Roadmap — Harmony Hub (JVBNA NJ)

Priority order for making this app enterprise-ready. Each item includes rationale.

---

## Phase 0 — Security & Stability (Do First)

These are things that could cause data loss, security vulnerabilities, or broken user experiences if left unfixed.

### ✅ P0-1: Admin route security (DONE)
- Added `RequireAdmin` layout component wrapping all `/admin/*` routes
- Only users with `isAdmin=true` (role in DB) can access admin pages
- Non-admin authenticated users get redirected to `/admin` (login)

### P0-2: Harden RLS policies
- `member_profiles`: add policy for admin role to SELECT all rows
- `households`, `household_members`, `student_profiles`, `program_enrollments`, `event_preferences`, `donation_preferences`, `communication_preferences`, `consents`: same pattern
- `admin_notes`, `audit_logs`: admin-only (no member access ever)
- `custom_pages`: published pages public readable; admin can read/write all statuses
- **How**: New migration file adding `has_role('admin', auth.uid())` policies

### P0-3: Global error boundary
- Wrap app in a React ErrorBoundary
- Catch unexpected render errors, show a clean fallback UI
- Log errors (console + optionally Supabase `error_logs` table)

---

## Phase 1 — CMS Migration to Supabase (Highest Impact)

This is the biggest architectural work. Without it, admin edits don't persist cross-device.

### P1-1: Create `site_settings` table
```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
```
- Seed with all defaults from `siteContent.ts`
- RLS: public can SELECT; admins can INSERT/UPDATE
- One row per logical setting key

### P1-2: Create `events` table
- Full CRUD entity (not a CMS setting key)
- Columns: `id, title, date_text, date_parsed, description, image_url, video_url, type, rsvp_link, registration_link, featured, created_at, updated_at`
- Seed from current `defaultEvents`
- RLS: public can SELECT; admins can INSERT/UPDATE/DELETE

### P1-3: Update SiteContentContext
- Replace `usePersistentState` (localStorage) with Supabase reads
- Use TanStack Query for all reads (caching, refetch, loading states)
- On admin save: `upsert` to `site_settings`; on read: `select` from `site_settings`
- Keep localStorage as optimistic cache (write-through)

### P1-4: Update all admin editors
- Remove context setter calls, replace with Supabase upserts
- Show loading/saving states
- Success/error toasts already in place

---

## Phase 2 — Supabase Storage for Images

### P2-1: Create storage buckets
```
site-images (public)   → banners, spiritual masters, CMS general
event-images (public)  → event flyers
page-blocks (public)   → custom page block images
member-photos (private) → member profile pictures (auth required)
```

### P2-2: Build image upload utility
- `src/lib/uploadImage.ts`: handles file → Supabase Storage → public URL
- Validate: file type (image/*), size (≤2MB), minimum dimensions (banners: 1200px wide)
- Return public URL for storage in DB

### P2-3: Replace base64 uploads
- Admin banner image upload → Supabase Storage → URL in site_settings
- Admin event image upload → Supabase Storage → URL in events table
- Custom page block image upload → Supabase Storage → URL in custom_pages.blocks
- Member profile picture → Supabase Storage (private bucket) → presigned URL for display

### P2-4: Media Library (`/admin/media`)
- Real UI: browse all files in Supabase Storage buckets
- Upload new image, get URL to paste anywhere
- Delete unused images
- Thumbnail previews, file size, upload date

---

## Phase 3 — Member Portal (Member-Facing Features)

### P3-1: Member dashboard (`/member`)
- Protected route: `isAuthenticated` required
- Show: member's own profile summary, upcoming events, their RSVPs
- Quick links: edit profile, communication preferences, RSVP to events

### P3-2: Self-service profile editing (`/member/profile`)
- Members can edit their own: contact info, address, emergency contact
- Members cannot change: member_type, organization_role, membership_status (admin-only)
- Writes to `member_profiles` with RLS (user can update own row)

### P3-3: RSVP system
- RSVP button on event cards (auth-gated: redirect to /auth if not logged in)
- Calls `INSERT INTO rsvps (user_id, event_id, event_title)`
- Un-RSVP button (DELETE from rsvps)
- Members can see their RSVPs in `/member/dashboard`
- Admin can see RSVP counts per event on EventsPage admin

### P3-4: Communication preferences self-service (`/member/settings`)
- Members can update their own `communication_preferences`
- Newsletter unsubscribe link support

---

## Phase 4 — Stripe Integration

### P4-1: Supabase Edge Function for checkout
- `supabase/functions/create-checkout/index.ts`
- Accepts: amount, category, member_id, receipt_email
- Creates Stripe Checkout session
- Returns: checkout URL
- Uses `STRIPE_SECRET_KEY` from Edge Function env (never in frontend)

### P4-2: `donations` table
```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  category TEXT,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  status TEXT DEFAULT 'pending',
  receipt_email TEXT,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### P4-3: Stripe webhook handler
- `supabase/functions/stripe-webhook/index.ts`
- Handles `payment_intent.succeeded` → update donation status
- Handles `checkout.session.completed` → confirm donation
- Uses `STRIPE_WEBHOOK_SECRET` to verify signature

### P4-4: Update DonatePage UI
- Add donation form (amount picker, category selector, tax receipt email)
- "Donate Now" button → calls Edge Function → redirects to Stripe Checkout
- Success page: thank you + receipt confirmation
- Admin donations page: view all donations, filter by status/category/date

---

## Phase 5 — Email Notifications

### P5-1: Pick email provider
- Options: Resend (recommended), SendGrid, Supabase built-in SMTP
- Integrate via Supabase Edge Functions (keep credentials server-side)

### P5-2: Transactional emails
- New member signup → welcome email
- Event RSVP → confirmation email
- Donation → receipt email (PDF attachment if possible)
- Admin creates new event → announcement email to opted-in members

### P5-3: Bulk communication
- Admin-triggered announcement to all members matching filter criteria
- Respects `do_not_contact` flag and `communication_preferences` opt-ins
- Newsletter: periodic digest of events + activities

---

## Phase 6 — Performance & Polish

### P6-1: Route-based code splitting
- Wrap all page imports in `React.lazy()` + `Suspense`
- Reduces initial bundle size significantly (many pages loaded eagerly now)

### P6-2: Server-side member search
- Current: all member_profiles loaded into memory, filtered client-side
- Target: Supabase `ilike` / `fts` queries for search; server-side pagination
- Needed once members > ~200 records

### P6-3: Dynamic dashboard stats
- Replace hardcoded "6 events, 5 activities" with live Supabase `count()` queries
- Show: total members, active members, upcoming events, this month's events

### P6-4: Mobile-responsive admin
- Admin sidebar collapses on mobile (hamburger menu)
- Admin tables scroll horizontally on small screens
- Member wizard is already mobile-optimized; admin needs similar treatment

### P6-5: Dark mode support
- CSS variables are already set up for theming
- Add dark mode variant to all color tokens
- Respect system preference with `next-themes`

---

## Deferred / Low Priority

- Multi-language support (English + Gujarati + Hindi)
- Public event calendar integration (2-way sync with Google Calendar)
- Member-to-member directory (opt-in only, privacy considerations)
- QR code check-in at events
- WhatsApp group automation
- Mobile app (React Native or PWA)
