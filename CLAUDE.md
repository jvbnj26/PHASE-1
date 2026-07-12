# CLAUDE.md — Harmony Hub (JVBNA NJ Membership Portal & Website)

## 1. Spirit & Purpose

This app is the **digital home and membership portal for Jain Vishwa Bharati of North America – New Jersey (JVBNA NJ)**, a Jain spiritual center based in Iselin/South Plainfield, NJ, founded in 2003 under the blessings of Acharya Mahapragya-ji and currently guided by Acharya Mahashraman.

**It serves two interlocking purposes:**

**A. Public-Facing Website** — A clean, professional, uplifting website that serves as the community's digital presence. It presents information about the organization, spiritual guidance, events, activities, volunteering, donations, and contact info. The tone is warm, welcoming, and spiritually uplifting. Everything should look like a world-class religious/spiritual organization's website.

**B. Membership Portal** — Community members sign up with a full 10-step wizard capturing detailed profile data (personal info, household/family, children, program enrollments, event preferences, giving preferences, communication settings, consents). Admins can view, search, filter, edit, and export all member records. This is the organization's living knowledge base of who their community is.

**C. Admin CMS** — Non-technical staff can log in and update every part of the website: banner images, welcome text, events, activities, board members, contact info, spiritual guidance content, volunteer sections, donation content, custom pages. They can add/delete/draft pages, replace images, reorder sections, and control what's live vs. in draft.

**The guiding spirit**: This is an enterprise-grade platform for a deeply meaningful spiritual community. Every design decision must reflect dignity, clarity, and uplift. Clean over clever. Readable over flashy. The admin tools must empower non-technical volunteers without ever feeling overwhelming.

---

## 2. What Is JVBNA?

**Jain Vishwa Bharati of North America** is one of three US satellite organizations of Jain Vishwa Bharati (JVB), headquartered in Ladnun, Rajasthan, India. JVB was founded in 1970 by Acharya Shri Tulsi and Acharya Shri Mahapragya. The NJ center:

- Is guided year-round by resident **Samanijis** (Jain ascetics — female monastics) assigned from India
- Focuses on **Preksha Meditation, yoga, pranayam** and Jain philosophy
- Runs **Gyanshala** (religious school for children), Youth Toastmasters, Swadhyay (scripture study), community service, and cultural events
- Hosts the **Paryushan Mahaparva** (Jain holy period) and other significant annual events
- Maintains two locations: Iselin NJ (mailing / administrative) and South Plainfield NJ (CPPM — Center for Peace and Preksha Meditation, 155 Front St)
- Admin email: `info@jvbnj.org` | `samaniji@jvbnj.org`
- Admin account in the app: `admin@jvbnj.org` / `JvbAdmin2026!`

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router v6 |
| State/Data | TanStack Query v5 |
| Database/Auth | Supabase (PostgreSQL + Auth + RLS) |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v3 |
| Form validation | Zod v3 |
| Notifications | Sonner |
| Testing | Vitest + Testing Library |

**Run dev server**: `npm run dev`
**Run tests**: `npm run test`
**Build**: `npm run build`

---

## 4. Design System

**Brand palette:**
- **Primary** — Saffron Orange `hsl(18 100% 50%)` — spiritual warmth
- **Secondary** — Forest Green `hsl(120 35% 25%)` — peace, nature
- **Accent** — Golden Yellow `hsl(45 100% 51%)` — highlights
- Background — Pure white `hsl(0 0% 100%)`

**Typography:**
- **Headings** — `font-serif` → Merriweather (dignified, traditional)
- **Body** — `font-sans` → Open Sans (clean, readable)

**Key rules for UI:**
- Always clean and uncluttered. Content breathes.
- Images must use `object-cover` with explicit aspect ratios. Never let images distort or overflow.
- Enforce image constraints: banners (16:9 or full-width), portraits (3:4 or square), cards (4:3).
- Image layout options for content blocks: `text`, `image`, `text-image-right`, `text-image-left`, `image-full`.
- Admin UI uses a dark sidebar (foreground color) with orange active state.
- Public pages use `PublicLayout` (header + footer). Admin pages use `AdminLayout` (sidebar nav).
- `container-custom` class for page-width content containers.
- `admin-card` class for admin panel cards.
- `fade-in` animation on page entry.

---

## 5. Architecture & Data Flow

### 5.1 Authentication

- Supabase Auth (email/password)
- Roles stored in `public.user_roles` table (`admin` | `member`)
- `has_role` RPC function for permission checks
- `AuthContext` exposes: `user`, `session`, `isAuthenticated`, `isAdmin`, `loading`
- Admin login: `admin@jvbnj.org` / `JvbAdmin2026!` (bootstraps admin account on first use)
- Regular member signup via 10-step `MemberSignupWizard`

### 5.2 Site Content (CMS State) — CRITICAL ARCHITECTURAL GAP

**Current state**: `SiteContentContext` persists all CMS content (banners, welcome text, events, activities, board members, spiritual masters, volunteer sections, contact info, about content, donation content, events2025 list, activities2025 list, calendar URL, photos URL, popup config) in **browser localStorage**.

**Why this is a problem**: Changes only persist in the browser that made them. Multi-admin collaboration is impossible. Content resets on new devices. Images stored as base64 data URLs in localStorage.

**Target state**: All CMS content should live in Supabase — either as rows in dedicated tables, or as a `site_settings` JSONB key-value store. Images should go to Supabase Storage, not base64 in localStorage.

**Until migration**: When building features, be aware that `useSiteContent()` reads/writes localStorage, not the DB.

### 5.3 Custom Pages (already in Supabase)

Custom pages (`/p/:slug` and `/p/:parent/:slug`) are stored in `public.custom_pages` with:
- `title`, `slug`, `parent_slug` — page identity and URL
- `blocks: Json` — array of `PageBlock` objects (layout + heading + body + imageUrl)
- `status: 'draft' | 'published' | 'archived'`

Block layout options: `text`, `image`, `text-image-right`, `text-image-left`, `image-full`

**Note**: Block images are currently stored as base64 data URLs inside the JSONB column. This works but will become a DB size issue at scale. Target: Supabase Storage URLs.

### 5.4 Member Data (fully in Supabase)

The signup wizard writes to 8 tables atomically:
1. `member_profiles` — core identity, contact, address, role, status
2. `households` — household/family unit
3. `household_members` — links user to household
4. `student_profiles` — children (linked to parent user and household)
5. `program_enrollments` — Gyanshala/class enrollment
6. `event_preferences` — event interests, volunteer availability, skills
7. `donation_preferences` — giving interest and preferences
8. `communication_preferences` — notification opt-ins
9. `consents` — consent records with timestamps

Admin features on member detail:
- Edit profile fields (role, status, contact info, photo)
- View household, students, programs, event prefs, donation prefs, comm prefs, consents
- Add internal admin notes
- Full audit log (writes to `audit_logs` on every admin update)

### 5.5 Row Level Security (RLS)

- `profiles`: users can only read/update their own row
- `rsvps`: users can only see/create/delete their own RSVPs
- `member_profiles`, `households`, etc.: members can insert their own; admins need service role or RLS bypass policies for reads across all members
- Admin reads of member data currently work because Supabase anon key is used client-side — RLS policies on member tables need to be verified to ensure admins can read all rows

---

## 6. Directory Structure

```
src/
├── App.tsx                    # Router — all routes defined here
├── main.tsx                   # Entry point
├── index.css                  # Design system CSS variables + global styles
├── assets/                    # Static image assets (bundled)
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx    # Admin sidebar + layout wrapper
│   │   └── ImageUploadButton.tsx
│   ├── layout/
│   │   ├── PublicLayout.tsx   # Header + Footer wrapper for public pages
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PageHero.tsx       # Reusable hero banner for inner pages
│   ├── signup/
│   │   └── MemberSignupWizard.tsx  # 10-step member registration wizard
│   ├── ui/                    # shadcn/ui component library (do not modify)
│   ├── EventPopup.tsx         # Homepage event popup modal
│   ├── JVBLogo.tsx
│   └── NavLink.tsx
├── contexts/
│   ├── AuthContext.tsx         # Supabase auth state + isAdmin check
│   └── SiteContentContext.tsx  # CMS state (currently localStorage)
├── data/
│   └── siteContent.ts          # Default content + TypeScript interfaces for all CMS entities
├── hooks/
│   ├── useCustomPages.ts       # Custom pages CRUD (Supabase)
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── integrations/supabase/
│   ├── client.ts               # Supabase client instance
│   └── types.ts                # Auto-generated DB types
├── lib/
│   ├── csvExport.ts            # CSV download/upload utilities for member export
│   ├── signupSchema.ts         # Zod schema + enums for signup wizard
│   └── utils.ts                # cn() utility
└── pages/
    ├── HomePage.tsx
    ├── AboutPage.tsx
    ├── LeadershipPage.tsx
    ├── EventsPage.tsx
    ├── ActivitiesPage.tsx
    ├── CalendarPage.tsx
    ├── PhotosPage.tsx
    ├── SpiritualGuidancePage.tsx
    ├── VolunteerPage.tsx
    ├── DonatePage.tsx
    ├── ContactPage.tsx
    ├── AuthPage.tsx             # Sign in / sign up toggle
    ├── SignupPage.tsx           # Wraps MemberSignupWizard
    ├── CustomPageView.tsx       # Renders custom pages from DB
    ├── NotFound.tsx
    └── admin/
        ├── AdminLoginPage.tsx
        ├── AdminDashboard.tsx       # Overview + Members DB panel
        ├── AdminHomePage.tsx        # Edit banners, welcome text, popup
        ├── AdminAboutPage.tsx
        ├── AdminEventsPage.tsx
        ├── AdminActivitiesPage.tsx
        ├── AdminSpiritualGuidancePage.tsx
        ├── AdminVolunteerPage.tsx
        ├── AdminDonationsPage.tsx
        ├── AdminContactPage.tsx
        ├── AdminBoardPage.tsx       # Board + Executive Committee
        ├── AdminMediaPage.tsx       # Media library
        ├── AdminSettingsPage.tsx    # Calendar URL, photos URL, popup config
        ├── AdminMembersPage.tsx     # Members table + CSV export/import
        ├── AdminMemberDetailPage.tsx # Full member record with tabs + audit
        └── AdminPagesPage.tsx       # Custom pages CMS
```

---

## 7. Public Routes

| Route | Page | Notes |
|---|---|---|
| `/` | HomePage | Hero carousel, welcome, events/activities, CTA |
| `/about` | AboutPage | Mission, programs, history |
| `/about/leadership` | LeadershipPage | Board + EC members |
| `/events` | EventsPage | Upcoming / ongoing / past events |
| `/events/:type` | EventsPage | Filter by type |
| `/activities` | ActivitiesPage | Regular activities |
| `/calendar` | CalendarPage | Embedded Google Calendar |
| `/photos` | PhotosPage | Link to Google Photos album |
| `/spiritual-guidance` | SpiritualGuidancePage | Samaniji info, teachings |
| `/volunteer` | VolunteerPage | Volunteer opportunities |
| `/get-involved` | VolunteerPage | Alias |
| `/donate` | DonatePage | Donation info + methods |
| `/contact` | ContactPage | Addresses, hours, satellite centers |
| `/auth` or `/login` | AuthPage | Sign in / create account |
| `/signup` | SignupPage | Full 10-step member wizard |
| `/p/:slug` | CustomPageView | Admin-created custom page |
| `/p/:parent/:slug` | CustomPageView | Admin-created subpage |

---

## 8. Admin Routes

All require `isAuthenticated`. Dashboard and member detail also check `isAdmin`.

| Route | Purpose |
|---|---|
| `/admin` | Login page |
| `/admin/dashboard` | Overview stats, quick actions, members DB |
| `/admin/pages` | Custom pages CMS (create/edit/publish/draft/archive) |
| `/admin/home` | Edit homepage: banners, welcome text, popup config |
| `/admin/about` | Edit About page content |
| `/admin/events` | Add/edit/delete events (upcoming/ongoing/past) |
| `/admin/activities` | Edit activities list |
| `/admin/spiritual-guidance` | Edit spiritual guidance content |
| `/admin/volunteer` | Edit volunteer sections |
| `/admin/donations` | Edit donation page content |
| `/admin/contact` | Edit contact info and satellite centers |
| `/admin/board` | Edit board members and executive committee |
| `/admin/media` | Media library (images) |
| `/admin/settings` | Google Calendar URL, Google Photos URL, popup toggle |
| `/admin/members/:id` | Member detail: profile, household, students, programs, events, donations, comms, consents, notes, audit log |

---

## 9. Database Schema

### Core Auth Tables (Supabase managed)
- `auth.users` — Supabase auth (id, email, metadata)

### Application Tables

| Table | Purpose |
|---|---|
| `profiles` | Basic profile auto-created on signup (name, email, phone) |
| `user_roles` | Role assignments: `admin` or `member` |
| `member_profiles` | Full member record (identity, contact, address, org role, status) |
| `households` | Family/household unit (name, address) |
| `household_members` | Many-to-many: user ↔ household with relationship + primary contact flag |
| `student_profiles` | Children linked to parent_user_id and household_id |
| `program_enrollments` | Gyanshala/class enrollment preferences |
| `event_preferences` | Event interests, meal pref, volunteer availability + skills |
| `donation_preferences` | Giving interest, type, categories, tax receipt, anonymous pref |
| `communication_preferences` | Notification opt-ins (general, events, donations, volunteers, emergency, WhatsApp, newsletter freq) |
| `consents` | GDPR-style consent records (email, SMS, photo/video, parent consent, terms/privacy timestamps) |
| `rsvps` | Event RSVPs (user_id, event_id, event_title) |
| `custom_pages` | CMS pages (slug, parent_slug, title, blocks JSON, status) |
| `admin_notes` | Internal admin notes on members (with follow_up_date, visibility) |
| `audit_logs` | Change history (action, user_id, changed_by, old_value, new_value) |

### Key DB Functions
- `has_role(_user_id, _role)` → boolean — used in AuthContext and RLS policies

---

## 10. Member Signup Wizard — Step Reference

| Step | Name | Key Fields |
|---|---|---|
| 0 | Account | email, password, phone, contact method, terms/privacy |
| 1 | About You | name, DOB, age group, gender, member type, org role, membership status, how heard |
| 2 | Contact & Address | secondary email/phone, address, emergency contact |
| 3 | Household & Family | household name, relationship, spouse, children (conditional on member_type=Parent or has_household) |
| 4 | Program Enrollment | programs, class group, time preference (conditional on children or wants_program_enrollment) |
| 5 | Events & Community | interested event types, meal pref, food allergies, volunteer interest + areas/availability/skills |
| 6 | Giving Preferences | donation interest, type, categories, tax receipt, employer match, anonymous |
| 7 | Communication | announcements, event/donation/volunteer reminders, emergency alerts, newsletter freq, WhatsApp |
| 8 | Consent & Privacy | email/SMS/photo consent, parent guardian consent, data accuracy confirmation |
| 9 | Review & Submit | Summary of all steps with edit links, final submit |

**Member types**: Member, Parent, Student, Volunteer, Donor, Visitor
**Membership statuses**: New, Active, Visitor, Prospect
**Organization roles**: General Member, Board Member, Executive Committee, Trustee, President, Vice President, Secretary, Treasurer, Sunday School Teacher, Youth Coordinator, Event Coordinator, Volunteer Lead, Volunteer, Donor, Visitor

---

## 11. Content Management — How It Works Today

### Built-in Pages (managed via dedicated admin editors)
These pages have their own admin routes and edit forms. Content is currently in `SiteContentContext` (localStorage). Target: migrate to Supabase.

### Custom Pages (in Supabase)
Created via `/admin/pages`. Each page has:
- A URL slug (top-level: `/p/slug`, sub-page: `/p/parent/slug`)
- Multiple content **blocks** that can be reordered
- Each block: layout choice + optional heading + body text + optional image
- Status: draft (hidden from public), published, archived

**Block layouts:**
- `text` — text only (heading + body, no image)
- `image` — standalone image, contained width
- `image-full` — full-width hero/banner image
- `text-image-right` — text left, image right
- `text-image-left` — image left, text right

---

## 12. Planned Work (Prioritized)

See `docs/ROADMAP.md` for the full prioritized list. Summary:

### Done
- **Admin route security**: `RequireAdmin` layout component wraps all `/admin/*` routes. Only `isAdmin=true` users can access. Only `admin@jvbnj.org` / `JvbAdmin2026!` is the current admin account.

### Phase 0 — Security (Immediate)
- Harden RLS policies on member tables (admins need cross-user read access)
- Add global React error boundary

### Phase 1 — CMS to Supabase (Highest impact)
- Create `site_settings` table + `events` table in Supabase
- Migrate `SiteContentContext` from localStorage to Supabase reads/writes
- This is CONFIRMED as next major task

### Phase 2 — Supabase Storage for images
- Create storage buckets (site-images, event-images, page-blocks, member-photos)
- Replace all base64 uploads with Supabase Storage URLs
- Build real Media Library admin UI
- This is CONFIRMED as part of the CMS migration work

### Phase 3 — Member portal
- Member dashboard, self-service profile editing, RSVP system

### Phase 4 — Stripe (Donation payments)
- Supabase Edge Function for Stripe Checkout
- `donations` table
- Webhook handler
- DonatePage updated for live payments
- Architecture is designed and ready; implementation deferred

### Phase 5 — Email notifications
- Resend or SendGrid via Supabase Edge Functions
- Transactional + bulk communication

### Phase 6 — Performance & polish
- Route-level code splitting, server-side member search, dynamic stats, mobile admin

---

## 13. Extended Documentation

| Doc | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` | Full system design, auth flow, CMS current vs. target, image storage, state management, security checklist |
| `docs/FEATURES.md` | Complete feature inventory with status (✅ implemented / ⚠️ partial / ❌ not started / 🔲 planned) |
| `docs/ROADMAP.md` | Phased development plan with rationale (Phase 0–6) |
| `docs/DATABASE.md` | Full schema reference: every table, column, type, RLS, and planned tables |

---

## 14. Developer Guidelines

### Code Principles
- **No comments** unless the WHY is non-obvious (hidden constraint, subtle invariant, a specific bug workaround)
- **No premature abstractions** — build what the task requires, not what might be needed
- **No error handling for scenarios that can't happen** — trust Supabase/React guarantees
- **No backwards-compat hacks** — just change the code

### When Building Admin Features
- Always check `isAdmin` from `useAuth()`, not just `isAuthenticated`
- Write audit log entries (`audit_logs` table) for any admin mutation to member data
- Validate images: enforce max 2MB, accept `image/*`, display as preview before saving
- For image layouts: enforce `object-cover` with explicit height/aspect ratio. Never let images stretch or distort.

### When Building Public-Facing UI
- Use `PublicLayout` wrapper
- Use `font-serif` for all `h1`/`h2`/`h3` headings
- Maintain white/orange/green palette — no arbitrary colors
- CTAs should use `Button` with `variant="secondary"` on dark/colored backgrounds, `variant="outline"` on white
- All pages must be mobile-first and responsive

### When Working with Supabase
- Import client from `@/integrations/supabase/client`
- Use typed queries via the generated `Database` types in `@/integrations/supabase/types`
- Check RLS policies before assuming reads will work
- Use `.maybeSingle()` instead of `.single()` when a row might not exist

### Image Constraints for the CMS
- Banners: 16:9 wide, minimum 1200px wide. Full-bleed.
- Profile photos: square or 3:4 portrait, minimum 200×200px.
- Content block images: 4:3 or 16:9 depending on layout. Never portrait images in landscape slots.
- Always preview images before saving to catch bad aspect ratios.
- Never accept images over 2MB (enforced in wizard; enforce everywhere).

### Payments (when implementing)
- Will use Stripe. Donation page currently shows check/ACH/PayPal instructions.
- Keep payment collection completely separate from profile data — never store card numbers or bank details in the app database.

---

## 14. Environment Variables

Located in `.env` (not committed):
```
VITE_SUPABASE_URL=<supabase project URL>
VITE_SUPABASE_ANON_KEY=<supabase anon key>
```

Supabase config in `supabase/config.toml`.

---

## 15. Supabase Migrations

Located in `supabase/migrations/`. Run with `supabase db push` or via Supabase dashboard. Migrations are numbered by timestamp. Always create new migrations rather than editing existing ones.

Key migrations:
- `20260627181825` — profiles, rsvps tables + handle_new_user trigger
- `20260627181841` — security: revoke handle_new_user from public
- Later migrations — member_profiles, households, user_roles, has_role function, all related tables
- `20260706012032` — adds status column to custom_pages (draft/published/archived)
