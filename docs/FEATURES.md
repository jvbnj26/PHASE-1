# Feature Inventory — Harmony Hub (JVBNA NJ)

Status: ✅ Implemented | ⚠️ Partial | 🔲 Planned | ❌ Not started

---

## Public Website Features

### Homepage (`/`)
- ✅ Hero banner carousel (auto-rotate, manual nav, slide indicators)
- ✅ Welcome section with spiritual masters photos
- ✅ Upcoming events list (date-parsed, sorted, linked to events page)
- ✅ Activities list (ongoing, linked to activities page)
- ✅ CTA section (Join, Events, Donate buttons)
- ✅ Homepage popup/announcement modal (admin-configurable)
- ⚠️ Banner images: hardcoded asset imports — needs Supabase Storage URLs

### About (`/about`)
- ✅ Mission statement and intro
- ✅ Program sections (Nonviolence, Health Education, Preksha Meditation)
- ⚠️ Content from SiteContentContext (localStorage) — needs Supabase

### Leadership (`/about/leadership`)
- ✅ Board of Directors list
- ✅ Executive Committee list with roles
- ⚠️ Data from SiteContentContext (localStorage) — needs Supabase

### Events (`/events`, `/events/:type`)
- ✅ Tabbed view: Upcoming / Ongoing / Past
- ✅ Event cards with image, date, description
- ✅ Video support (auto-play loop) on event cards
- ✅ RSVP link + Registration link buttons per event
- ⚠️ Data from SiteContentContext (localStorage) — needs Supabase `events` table
- ❌ Live RSVP via member account (rsvps table exists but no UI wired)

### Activities (`/activities`)
- ✅ Activity cards with description, dates, zoom links
- ⚠️ Data from SiteContentContext (localStorage) — needs Supabase

### Calendar (`/calendar`)
- ✅ Google Calendar embed (configurable URL via admin settings)
- ⚠️ Default URL is placeholder — needs real Google Calendar ID set in settings

### Photos (`/photos`)
- ✅ Link/embed to Google Photos album (configurable URL via admin settings)
- ⚠️ Default URL is placeholder — needs real Google Photos URL

### Spiritual Guidance (`/spiritual-guidance`)
- ✅ Samaniji profiles and descriptions
- ⚠️ Data from SiteContentContext (localStorage) — needs Supabase

### Volunteer (`/volunteer`, `/get-involved`)
- ✅ Volunteer sections (volunteering, outreach/teach, advocate)
- ⚠️ Data from SiteContentContext (localStorage) — needs Supabase

### Donate (`/donate`)
- ✅ Donation intro and pledge info
- ✅ Payment methods displayed (check, ACH, PayPal instructions)
- ✅ Tax exemption note
- ❌ Live payment processing (Stripe integration planned)
- ⚠️ Content from SiteContentContext (localStorage) — needs Supabase

### Contact (`/contact`)
- ✅ Mailing address + events venue address
- ✅ Hours of operation
- ✅ Phone and email links
- ✅ Satellite centers (Ladnun India, Orlando FL, Houston TX)
- ⚠️ Data from SiteContentContext (localStorage) — needs Supabase

### Custom Pages (`/p/:slug`, `/p/:parent/:slug`)
- ✅ Render blocks from Supabase `custom_pages` table
- ✅ All layout types: text, image, text-image-right, text-image-left, image-full
- ✅ Only shows published pages; draft/archived → 404
- ⚠️ Block images stored as base64 in JSONB — needs Supabase Storage

---

## Auth & Member Portal Features

### Sign In / Sign Up (`/auth`, `/login`)
- ✅ Email/password sign in
- ✅ Link to full signup wizard
- ⚠️ No member dashboard yet after sign in — redirects to homepage

### Member Signup Wizard (`/signup`)
- ✅ 10-step wizard with progress bar
- ✅ Step 0: Account (email, password, phone, contact method, terms)
- ✅ Step 1: About You (name, DOB, age group, gender, member type, org role)
- ✅ Step 2: Contact & Address + emergency contact
- ✅ Step 3: Household & Family (conditional: if parent or has_household)
  - ✅ Children/students sub-forms (unlimited, each with medical notes, permissions)
- ✅ Step 4: Program enrollment (conditional: if children or wants_programs)
- ✅ Step 5: Events & community (event interests, meal pref, volunteer areas)
- ✅ Step 6: Giving preferences (donation type, categories, tax receipt)
- ✅ Step 7: Communication preferences (announcements, reminders, WhatsApp, newsletter)
- ✅ Step 8: Consent & privacy (email/SMS/photo, parent guardian, data accuracy)
- ✅ Step 9: Review & submit
- ✅ Conditional step skipping (household/programs steps only shown if relevant)
- ✅ Profile picture upload (base64, max 2MB)
- ✅ Zod validation per-step + full schema on submit
- ✅ Writes to 8 Supabase tables on submit

### Member Dashboard (planned)
- ❌ No dedicated member-facing dashboard route exists
- ❌ Members can't view/edit their own profile after signup
- ❌ Members can't view their RSVPs
- ❌ Members can't update communication preferences post-signup
- 🔲 Planned: `/member/profile`, `/member/rsvps`, `/member/settings`

### Event RSVPs
- ✅ `rsvps` table in Supabase with RLS (per-user)
- ❌ No RSVP button on public EventsPage
- ❌ No RSVP management UI for members
- 🔲 Planned: RSVP button on event cards (auth-gated), list in member dashboard

---

## Admin CMS Features

### Dashboard (`/admin/dashboard`)
- ✅ Quick action cards to main admin sections
- ✅ Members database panel (search, filter, export, seed dummy, delete all)
- ⚠️ Stats panel (6 events, 5 activities, 27 EC, 4 banners) — hardcoded, not dynamic

### Pages Manager (`/admin/pages`)
- ✅ Lists all built-in pages with links to their admin editors
- ✅ Create custom page (title, parent slug, auto-generated slug)
- ✅ Save as draft or publish immediately
- ✅ Edit page: title, blocks, layout per block
- ✅ Block controls: add, remove, reorder (up/down)
- ✅ Block image upload (base64 currently — target: Supabase Storage)
- ✅ Status lifecycle: draft → published → archived (or back to draft)
- ✅ Delete page (with confirmation)
- ✅ View live page link

### Home Page Editor (`/admin/home`)
- ✅ Banner slides: add, remove, reorder, upload image, set title/subtitle
- ✅ Welcome text: title + body
- ✅ Events 2025 list: text entries with add/remove
- ✅ Activities 2025 list: text entries with add/remove
- ✅ Homepage popup: enable/disable, pick event or auto-select
- ⚠️ Saves to localStorage — needs Supabase

### Events Editor (`/admin/events`)
- ✅ Add / edit / delete events
- ✅ Set event type (upcoming/ongoing/past)
- ✅ Upload event flyer image
- ✅ Optional video URL
- ✅ RSVP link + registration link fields
- ✅ Toggle popup feature per event
- ⚠️ Saves to localStorage — needs Supabase `events` table

### Activities Editor (`/admin/activities`)
- ✅ Add / edit / delete activities
- ✅ Sub-items per activity
- ✅ Dates and Zoom link fields
- ⚠️ Saves to localStorage — needs Supabase

### Board & EC Editor (`/admin/board`)
- ✅ Board of Directors: add / remove / reorder members
- ✅ Executive Committee: add / remove / reorder with role
- ⚠️ Saves to localStorage — needs Supabase

### About Editor (`/admin/about`)
- ✅ Intro, mission, programs text editing
- ✅ Program sections (add/edit/delete)
- ⚠️ Saves to localStorage — needs Supabase

### Spiritual Guidance Editor (`/admin/spiritual-guidance`)
- ✅ Spiritual masters: name, image, description
- ⚠️ Saves to localStorage — needs Supabase

### Volunteer Editor (`/admin/volunteer`)
- ✅ Volunteer sections: title, description, icon
- ⚠️ Saves to localStorage — needs Supabase

### Donations Editor (`/admin/donations`)
- ✅ Intro text, pledge info
- ✅ Payment methods (title, description, details)
- ✅ Tax info text
- ⚠️ Saves to localStorage — needs Supabase

### Contact Editor (`/admin/contact`)
- ✅ Mailing address + events address fields
- ✅ Phone numbers, emails, hours
- ✅ Satellite centers: add / edit / remove
- ⚠️ Saves to localStorage — needs Supabase

### Media Library (`/admin/media`)
- ⚠️ Currently a placeholder — shows tips about using image URLs
- 🔲 Planned: Supabase Storage browser (upload, copy URL, delete, preview)

### Members Database (`/admin/dashboard` + `/admin/members/:id`)
- ✅ Search by name, email, phone, city
- ✅ Filter by member type and membership status
- ✅ View all member columns in table
- ✅ Export to CSV (all columns, formatted dates)
- ✅ Upload CSV to replace all members (with confirmation)
- ✅ Seed 12 dummy NJ-based members (for testing)
- ✅ Delete all members (with confirmation)
- ✅ Member detail page (10 tabs: profile, household, students, programs, events, donations, comm, consents, notes, audit)
- ✅ Admin can edit profile fields, change role/status
- ✅ Admin notes (internal, not visible to member)
- ✅ Audit log (tracks all admin profile changes with before/after values)
- ❌ Member profile picture stored as base64 — needs Supabase Storage
- ❌ No search/filter in member detail's related records

### Settings (`/admin/settings`)
- ✅ Google Calendar embed URL
- ✅ Google Photos album URL
- ✅ Homepage popup configuration (enable/disable, pick event)
- ⚠️ Saves to localStorage — needs Supabase

---

## Infrastructure Features

### Row Level Security
- ✅ `profiles`: users can read/update own row only
- ✅ `rsvps`: users can read/create/delete own RSVPs only
- 🔲 `member_profiles`: members read own; admins read all
- 🔲 `households`, `household_members`: similar pattern
- 🔲 `student_profiles`, `program_enrollments`, etc.: parent reads own; admins all
- 🔲 `admin_notes`: admins only (never visible to members)
- 🔲 `audit_logs`: admins only
- 🔲 `custom_pages`: public read published only; admins read/write all

### Audit Trail
- ✅ `audit_logs` table: action, user_id, changed_by, old_value, new_value
- ✅ Admin profile updates write to audit_logs
- ❌ Admin CMS updates not yet logged (events, activities, etc.)
- 🔲 Planned: log all admin mutations with before/after

### CSV Import/Export
- ✅ Export: all member_profiles columns as CSV
- ✅ Import: validate, clean, confirm, replace
- ✅ Handles date fields (ISO format) and timestamp fields (excluded on import)
- ❌ Merge mode (append without replacing) not implemented

### Email Notifications
- ❌ Not implemented
- 🔲 Planned: Supabase Edge Function triggered on events (signup, RSVP, reminders)
- 🔲 Email service to be determined (Resend, SendGrid, or Supabase built-in)
