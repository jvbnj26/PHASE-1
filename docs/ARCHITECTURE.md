# System Architecture — Harmony Hub (JVBNA NJ)

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                        │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐ │
│  │  Public Site  │   │  Admin Panel │   │  Member Portal  │ │
│  │  (no auth)    │   │  (isAdmin)   │   │  (isAuth)       │ │
│  └──────┬───────┘   └──────┬───────┘   └────────┬────────┘ │
│         │                  │                     │          │
│  ┌──────▼──────────────────▼─────────────────────▼────────┐ │
│  │              React Context Layer                        │ │
│  │   AuthContext (Supabase session + role)                 │ │
│  │   SiteContentContext (CMS state — currently localStorage│ │
│  │                        → target: Supabase)             │ │
│  └──────────────────────────┬──────────────────────────────┘ │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────────┐ │
│  │              Supabase Client (@supabase/supabase-js)    │ │
│  └──────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────┘
                              │  HTTPS
┌─────────────────────────────▼───────────────────────────────┐
│                      Supabase Cloud                         │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Auth Service│  │  PostgreSQL  │  │  Storage (planned) │ │
│  │ (sessions,  │  │  + Row Level │  │  (images/files)    │ │
│  │  JWT, email)│  │  Security    │  │                    │ │
│  └─────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Auth Flow

```
User visits /admin
     │
     ▼
AdminLoginPage
     │
     │  email + password
     ▼
AuthContext.login()
     │
     ├─→ supabase.auth.signInWithPassword()
     │        │
     │        ├─ success → session stored in Supabase JS client
     │        │            onAuthStateChange fires
     │        │            refreshAdminStatus() called
     │        │                └─ has_role('admin') RPC → sets isAdmin
     │        │
     │        └─ fail (first time) → signUp(admin@jvbnj.org)
     │                               then retry signIn
     │
     ▼
RequireAdmin (layout route in App.tsx)
     │
     ├─ loading? → render null (prevents flash redirect)
     ├─ !isAuthenticated || !isAdmin → Navigate to /admin
     └─ authorized → Outlet (render admin page)
```

**Current admin credentials**: `admin@jvbnj.org` / `JvbAdmin2026!`
**Role enforcement**: `user_roles` table + `has_role()` RPC + `RequireAdmin` route guard

---

## 3. CMS State — Current vs. Target

### Current (localStorage)
```
SiteContentContext
├─ bannerSlides     → localStorage key: 'jvbna_banners'
├─ welcomeText      → localStorage key: 'jvbna_welcome'
├─ events           → localStorage key: 'jvbna_events'
├─ activities       → localStorage key: 'jvbna_activities'
├─ boardMembers     → localStorage key: 'jvbna_board'
├─ executiveCommittee → localStorage key: 'jvbna_ec'
├─ spiritualMasters → localStorage key: 'jvbna_masters'
├─ volunteerSections → localStorage key: 'jvbna_volunteer'
├─ contactInfo      → localStorage key: 'jvbna_contact'
├─ satelliteCenters → localStorage key: 'jvbna_satellites'
├─ aboutContent     → localStorage key: 'jvbna_about'
├─ donationContent  → localStorage key: 'jvbna_donations'
├─ events2025       → localStorage key: 'jvbna_events2025'
├─ activities2025   → localStorage key: 'jvbna_activities2025'
├─ calendarUrl      → localStorage key: 'jvbna_calendar'
├─ photosUrl        → localStorage key: 'jvbna_photos'
└─ popupConfig      → localStorage key: 'jvbna_popup_config'
```

**Problem**: Edits only persist in the editing browser. No multi-device sync.

### Target (Supabase)
```
Supabase PostgreSQL
├─ site_settings table (key-value JSONB store)
│   ├─ 'banners'          → BannerSlide[]
│   ├─ 'welcome'          → { title, content }
│   ├─ 'activities_list'  → Activity[]
│   ├─ 'board_members'    → BoardMember[]
│   ├─ 'executive_committee' → ExecutiveCommitteeMember[]
│   ├─ 'spiritual_masters' → SpiritualMaster[]
│   ├─ 'volunteer_sections' → VolunteerSection[]
│   ├─ 'contact_info'     → ContactInfo
│   ├─ 'satellite_centers' → SatelliteCenter[]
│   ├─ 'about_content'    → AboutContent
│   ├─ 'donation_content' → DonationContent
│   ├─ 'events_2025_list' → string[]
│   ├─ 'activities_2025_list' → string[]
│   ├─ 'calendar_url'     → string
│   ├─ 'photos_url'       → string
│   └─ 'popup_config'     → PopupConfig
│
└─ events table (full CRUD, separate from settings)
    ├─ id, title, date, description
    ├─ image_url (Supabase Storage URL)
    ├─ video_url
    ├─ type: 'upcoming' | 'ongoing' | 'past'
    ├─ rsvp_link, registration_link
    └─ created_at, updated_at
```

**Migration plan** (PLANNED — not yet implemented):
1. Create `site_settings` table with `(key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ)`
2. Create `events` table (proper CRUD entity, not CMS setting)
3. Seed from current `siteContent.ts` defaults
4. Replace `usePersistentState` in SiteContentContext with Supabase reads/writes
5. Update all admin editors to call Supabase instead of context setters
6. Keep localStorage as offline fallback/cache

---

## 4. Image Storage — Current vs. Target

### Current
- Admin uploads → FileReader → base64 data URL
- Stored in: localStorage (via SiteContentContext) or Supabase JSONB (custom_pages blocks)
- **Problems**: localStorage size limits (~5MB), JSONB bloat, can't be CDN-served, no reuse

### Target (Supabase Storage)
```
Supabase Storage Buckets:
├─ public/site-images/    → banners, spiritual masters, general CMS images (public read)
├─ public/event-images/   → event flyers (public read)
├─ private/member-photos/ → member profile pictures (auth required)
└─ public/page-blocks/    → custom page block images (public read)
```

**Upload flow (target)**:
```
Admin picks file
     │
     ├─ validate: image/*, max 2MB (banners: 1200px+ wide, portraits: square/3:4)
     │
     ▼
supabase.storage.from('site-images').upload(path, file)
     │
     ▼
Get public URL → store in DB (site_settings value or events.image_url)
     │
     ▼
Public site reads URL → served via Supabase CDN
```

**Media Library** (`/admin/media`) will become a real UI: browse all uploaded files, copy URLs, delete unused assets, previews.

---

## 5. Member Data Flow

### Signup
```
/signup → MemberSignupWizard (10 steps)
     │
     ▼ (on final submit)
supabase.auth.signUp()  →  creates auth.users row + triggers handle_new_user()
     │                     which inserts into profiles table
     │
     ├─ INSERT member_profiles
     ├─ INSERT households (if applicable)
     ├─ INSERT household_members (if applicable)
     ├─ INSERT student_profiles[] (if children)
     ├─ INSERT program_enrollments (if applicable)
     ├─ INSERT event_preferences
     ├─ INSERT donation_preferences
     ├─ INSERT communication_preferences
     └─ INSERT consents
```

### Admin Member Management
```
/admin/dashboard → AdminMembersPage panel
     │
     ├─ SELECT * FROM member_profiles (with search/filter)
     ├─ Download CSV (all columns)
     ├─ Upload CSV (replace all — destructive, confirmed)
     └─ Seed dummy data (12 realistic NJ-based records)

/admin/members/:userId → AdminMemberDetailPage
     │
     ├─ Tab: Profile    → editable fields, saves with audit log
     ├─ Tab: Household  → household + relationship
     ├─ Tab: Students   → children with medical/permission info
     ├─ Tab: Programs   → class enrollment
     ├─ Tab: Events     → event interests + volunteer prefs
     ├─ Tab: Donations  → giving preferences
     ├─ Tab: Communication → notification opt-ins
     ├─ Tab: Consents   → consent history with timestamps
     ├─ Tab: Admin Notes → internal notes (not visible to member)
     └─ Tab: Audit Log  → full change history
```

---

## 6. Custom Pages (CMS) Flow

```
Admin creates page at /admin/pages
     │
     ├─ Enter title → auto-generates slug
     ├─ Choose parent (top-level or sub-page)
     ├─ Save as draft OR publish
     │
     ▼
Stored in: custom_pages (Supabase)
  { id, slug, parent_slug, title, blocks: PageBlock[], status, created_at }

PageBlock = {
  id: uuid
  layout: 'text' | 'image' | 'text-image-right' | 'text-image-left' | 'image-full'
  heading?: string
  body?: string
  imageUrl?: string   // currently base64 → target: Supabase Storage URL
  imageAlt?: string
}

Public URL:
  /p/:slug           → top-level page
  /p/:parent/:slug   → sub-page

Status:
  draft    → admin-only, not visible at public URL
  published → publicly accessible
  archived  → hidden from public and from default admin list
```

---

## 7. Payments (Planned — Stripe)

**Current state**: Donation page shows payment methods (check, ACH, PayPal) with manual instructions. No live processing.

**Target architecture when Stripe is added**:
```
/donate → DonatePage
     │
     ├─ Member selects donation amount + category
     ├─ Redirects to Stripe Checkout (server-side session creation)
     │     └─ via Supabase Edge Function: POST /functions/v1/create-checkout
     │
     ▼
Stripe Checkout (hosted page)
     │
     ├─ success → /donate?success=true (record transaction)
     └─ cancel  → /donate (back to form)
```

**Stripe integration points to prepare**:
- `VITE_STRIPE_PUBLISHABLE_KEY` env var (placeholder)
- `STRIPE_SECRET_KEY` in Supabase Edge Function env (never in frontend)
- `donations` table to record transactions (amount, category, member_id, stripe_payment_id, receipt_email)
- Webhook handler Edge Function for `payment_intent.succeeded`

**Note**: Never store card numbers, bank details, or Stripe secret key in frontend code or the database. All Stripe calls go through Edge Functions.

---

## 8. State Management Strategy

| Data Type | Current Location | Target Location |
|---|---|---|
| Auth session | Supabase JS client (in-memory + localStorage) | Same (Supabase handles) |
| Admin role | Memory (AuthContext) | Same |
| CMS content | `localStorage` | Supabase `site_settings` table |
| Events (full CRUD) | `localStorage` via SiteContentContext | Supabase `events` table |
| Custom pages | Supabase `custom_pages` | Same |
| Member profiles | Supabase `member_profiles` | Same |
| Server data (Supabase queries) | TanStack Query cache | Same |
| UI state | React `useState` | Same |

**React Query** is installed but not yet used for CMS data. When CMS migrates to Supabase, use TanStack Query for all Supabase reads to get caching, refetch, loading states.

---

## 9. Route Security Model

```
Public routes    → No auth required
                   /, /about, /events, /activities, /calendar, etc.

Auth routes      → Supabase session required (isAuthenticated)
                   /auth, /signup — actually public but aware of auth state

Member routes    → isAuthenticated (planned: member dashboard)
                   (not yet implemented)

Admin routes     → isAuthenticated AND isAdmin
                   Enforced by RequireAdmin layout component in App.tsx
                   All /admin/* routes except /admin (login page)
```

**RequireAdmin** (`src/components/admin/RequireAdmin.tsx`):
- Waits for `loading` to resolve before redirecting (avoids flash)
- Redirects to `/admin` (login) if not authenticated or not admin
- Uses `<Outlet />` for authorized users — wraps all admin sub-routes

---

## 10. Error Handling Strategy

| Layer | Approach |
|---|---|
| Supabase queries | Check `.error` on every query; surface via `toast.error()` |
| Form validation | Zod + per-step validation in wizard; field-level error display |
| Auth errors | Returned from signIn/signUp as `{ error: string }` |
| Image upload | Check file type + size client-side before sending |
| Not found | `NotFound` page with navigation back |
| Admin mutations | Show toast on success and error; reload data on success |
| Audit logging | Admin profile changes write to `audit_logs` table |

**No global error boundary** is currently implemented — planned for enterprise readiness.

---

## 11. Performance Considerations

- **SPA**: Single bundle, all routes lazy-load (currently not, should be implemented)
- **Images**: Must be properly sized; base64 in DB/localStorage is a known bottleneck to fix
- **Member table**: Client-side search/filter works up to ~500 members; beyond that needs server-side pagination + search
- **Supabase queries**: All are direct `select *` — add column whitelisting and pagination as data grows
- **TanStack Query**: Install strategy — wrap all Supabase reads in `useQuery` with appropriate `staleTime`

---

## 12. Security Checklist

- [x] Auth via Supabase (industry-standard JWT sessions)
- [x] Admin role checked via DB (`user_roles` table + `has_role` RPC)
- [x] Admin routes protected by `RequireAdmin` layout guard (implemented)
- [x] RLS enabled on `profiles`, `rsvps`
- [ ] RLS on `member_profiles` — needs policy for admins to read all rows
- [ ] RLS on all member-related tables (households, consents, etc.) — needs admin read policy
- [ ] Input sanitization for admin-controlled content displayed on public site
- [ ] Image upload: server-side validation (currently client-side only)
- [ ] Rate limiting on auth endpoints (Supabase handles, but verify config)
- [ ] No secrets in frontend code — Stripe secret key must go in Edge Functions
- [ ] Audit logging on all admin mutations to member data (implemented for profile updates)
