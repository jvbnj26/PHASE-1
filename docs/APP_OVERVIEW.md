# Harmony Hub — Complete App Reference

A working reference for the JVBNA NJ website/membership portal, compiled from a full read of the live codebase (not just `docs/*.md`, some of which are stale) plus decisions and history mined from past Claude Code sessions on this project. Where those two sources disagree, this doc says so explicitly and trusts the code.

---

## 1. What this is

Three apps in one codebase:
- **Public website** for Jain Vishwa Bharati of North America – New Jersey (JVBNA NJ), a Jain spiritual center in Iselin/South Plainfield, NJ.
- **Member portal** — 9-step signup wizard, self-service dashboard, event RSVPs.
- **Admin CMS** — non-technical staff edit every part of the site without touching code.

Stack: React 18 + TypeScript, Vite 5, React Router v6, TanStack Query v5, Supabase (Postgres + Auth + RLS + Storage), shadcn/ui, Tailwind CSS v3, Zod v3.

---

## 2. Architecture reality check (code-verified, not doc-verified)

`docs/ARCHITECTURE.md` and `docs/FEATURES.md` describe an earlier state of the app. As of the current code:

| Area | Docs say | Code actually does |
|---|---|---|
| CMS content (banners, about, board, contact, etc.) | "localStorage, not yet migrated" | Lives in Supabase `site_settings` (key → JSONB), loaded once on mount via `SiteContentContext`, upserted on every admin save |
| Events | "still in `site_settings` blob" | Real `events` table, UUID PKs, own RLS policies, indexed on `start_date` |
| Event images | "base64" | Real Supabase Storage bucket `event-images`, public-read / admin-write policies |
| Everything else's images (banners, board photos, page blocks, profile pictures) | "base64, needs migration" | **Still true** — base64 data URLs embedded in JSONB/columns |
| RSVPs | "table exists but no UI wired" | Fully wired: one-click toggle *or* a full custom form builder per event (see §4.3) |
| Member dashboard | "doesn't exist" | Exists at `/member`, 4 functional tabs |
| Blog | not mentioned | Full `posts` table + admin editor + public `/blog`, migrated from the org's old WordPress site (129 posts, text-only import; images deferred to manual admin re-upload) |
| Programs step in signup wizard | Step 4, conditional | **Removed entirely** — current wizard is 9 steps, no Programs step (see §5 discrepancy note) |

---

## 3. Public site, page by page

- **Home** — auto-rotating banner carousel, welcome text + spiritual masters, a homepage popup that auto-features one event (today's → soonest upcoming → most recent past, or an admin pin) with inline RSVP, parsed events/activities preview panels, CTA row.
- **About / Leadership** — mission, program cards, Board of Directors + Executive Committee rosters. Static/informational.
- **Events** (`/events/upcoming|ongoing|past`) — auto-classified by date (not manually tagged), media carousel per card, RSVP action that branches by auth state and by whether the event has a custom form.
- **Activities** — ongoing activity cards with Zoom links, dates, sub-items.
- **Calendar / Photos** — Google Calendar iframe embed; Photos is just an outbound link to a Google Photos album (no on-site gallery).
- **Spiritual Guidance** — Samaniji profiles, explanation of the "Samani" monastic role.
- **Volunteer / Get Involved** — three pillar cards, all funnel to `/contact` — **there is no in-app volunteer signup form**, just an email/contact redirect.
- **Donate** — rich informational page (donor tiers, check/ACH/PayPal instructions), shows the donor category you picked at signup if logged in. **The "Donate Now" button has no handler at all** — not even a mailto fallback. Live payments are unimplemented.
- **Contact** — two physical addresses with embedded maps, satellite centers (Ladnun India, Orlando, Houston).
- **Blog** (`/blog`, `/blog/:slug`) — paginated post grid, sanitized HTML rendering (DOMPurify), admin drafts previewable only by admins (404 for everyone else).
- **Custom Pages** (`/p/:slug`) — admin-authored pages built from ordered content blocks (text/image/text+image variants), auto-injected into the header nav when published.
- **Auth** — Sign In is a real form; the Sign Up tab is just a landing card that routes into the full wizard (no lightweight signup path exists). Full forgot/reset password loop is implemented and does not leak whether an email is registered.

---

## 4. Member-facing systems

### 4.1 Signup wizard (`/signup`)
**9 steps** (not 10 as `CLAUDE.md`/`docs/FEATURES.md` describe): Account → About You → Contact & Address → Household & Family (conditional) → Events & Community → Giving → Communication → Consent → Review.

Notably **absent from the adult-facing fields**, despite appearing in `CLAUDE.md`'s step reference: date of birth, marital status, occupation, employer, and any dedicated Program Enrollment step. (Children added under Household still get their own `date_of_birth` field.) This matches a past explicit user request to trim the wizard — see §6.

Every step except Review has a **"Fill test data" button** (flask icon) that seeds realistic dummy values — it is visible to all users in production, not gated behind a dev flag.

### 4.2 Member Dashboard (`/member`)
Four tabs: My RSVPs, Upcoming Events, My Profile (identity fields read-only/admin-managed, contact fields self-editable), Communication (read-only display; changes require emailing the office — no self-service edit yet).

### 4.3 RSVP system
Two parallel, **mutually exclusive** paths per event — enforced at the **database trigger level**, not just the UI, specifically so the either/or rule holds no matter how a row gets written (UI, script, direct SQL):
- **Plain RSVP** — one-click toggle, no form.
- **Custom RSVP form** — Google-Forms-style builder at `/admin/events/:id/rsvp-form` (7 question types, required flags, draft/publish), filled out at `/events/:id/rsvp` with edit-in-place and cancel.

RSVP is available on **all** event types including past ones — this was a deliberate change from an earlier version that only allowed RSVP on upcoming events.

---

## 5. Admin CMS

Dark-sidebar console at `/admin/*`, gated by `RequireAdmin` (checks `isAdmin` via `has_role` RPC, not just login state). Covers: Dashboard (members DB + quick links), Pages Manager, Home/About/Events/Activities/Spiritual Guidance/Volunteer/Donations/Contact/Board editors, Programs editor, Blog editor, Members database (search/filter/CSV import-export/seed/delete-all, 10-tab member detail with audit log), Settings (Calendar/Photos URLs, popup config). Media Library is still a placeholder/tips page, not a real asset browser.

Admin credentials: `admin@jvbnj.org` / `JvbAdmin2026!` — bootstraps the real backend admin account on first login attempt. Discoverable admin access is intentional while this project is in demo.

---

## 6. History: decisions, fixes, and context not visible in the code

Mined from past session transcripts on this project (not from the current live session, not from `docs/*.md`).

### Business / infrastructure facts
- Deployed on **Vercel** (project `jvbna-website-phase1`, GitHub repo `jvbnj26/PHASE-1`, auto-deploy on push to `main`). First deploy went straight to Vercel *production* (not preview) specifically so a stable URL existed to register in Supabase's Auth redirect allow-list.
- Live Supabase project (real remote project, not a sandbox) — schema changes touch real data.
- Org's working ops inbox: `jvbtoasties@gmail.com`.
- The old site being replaced/migrated from was a WordPress site (`jvbnewjersey.org`) — source of the 129 imported blog posts.

### Decisions & rationale
- Events were deliberately migrated off the `site_settings` blob into a real table **specifically to give the RSVP form builder a stable FK target** — sequenced as two explicit stages (table migration, then form builder) with a pause for review between them, per the user's request to de-risk.
- WordPress blog import reused the existing admin-auth pattern rather than standing up new auth; images were deliberately excluded from the automated import and left for manual admin re-upload.
- TipTap was chosen as the rich-text editor specifically so new posts match the shape of the migrated WordPress HTML.

### Explicit user preferences enforced in current code
- RSVP made available on all events (including past), not just upcoming — explicit user call.
- Homepage popup event image always shows a static thumbnail, never autoplaying video — explicit user call.
- RSVP link vs. custom form mutual exclusivity — explicit user requirement, enforced at the DB layer.
- Signup wizard trimmed: date of birth, marital status, occupation, employer, and the entire Program Enrollment step were requested removed. **Current code confirms this was applied** — those fields/step are genuinely absent from `signupSchema.ts` and `MemberSignupWizard.tsx` today, even though `CLAUDE.md` and `docs/FEATURES.md` still describe the old 10-step version with those fields. Treat the docs as stale here, not the code.
- Production-touching Supabase migrations are expected to be run directly (service-role key) with output shown before proceeding, not left for the user to run manually by hand.

### Bugs found and fixed (root causes worth remembering)
- **Popup "featured event" picking the wrong event**: two causes — (1) code was calling `Date.parse()` on a free-text display string that never parses, silently falling back to array order instead of chronological order; (2) a race where `SiteContentContext` seeds a hardcoded fallback list synchronously and the popup's 800ms reveal timer fired before the real Supabase fetch resolved. Fixed by gating the popup's event selection on `contentLoaded` (see `EventPopup.tsx`).
- **Blank white screen in production**: `.env` values were quote-wrapped (`VITE_SUPABASE_URL="..."`) and the script that copied them into Vercel env vars captured the literal quote characters, breaking the Supabase client at module-init.
- Vercel needed an explicit SPA rewrite (serve `index.html` for all client routes) — without it, deep links like `/forgot-password` 404'd on refresh/direct visit.
- Supabase Auth's "Site URL" setting was stuck on a stale default (`http://127.0.0.1:3000`), causing password-reset emails to link nowhere useful — this is an **infra config setting in the Supabase dashboard**, not something fixable in code.
- `CustomPageView.tsx` used to hardcode `.eq('status', 'published')` in its query, so clicking "View" on a freshly-saved draft 404'd even for admins — fixed with an admin-only draft-preview bypass at the app layer (the current code's `if (page.status !== 'published' && !isAdmin) return <NotFound />` pattern, also now used identically for blog posts).
- `@tailwindcss/typography` was installed but never registered in `tailwind.config.ts`, silently no-opping every `prose` class — worth checking if any future typography-class styling looks unstyled.
- Tiptap v3 dropped the default export from `@tiptap/extension-text-style`, which caused a silent blank page (no error overlay because HMR overlay was disabled) — a latent upstream-breaking-change bug, not something introduced by app code.

### Known issues flagged in past sessions (verify current status before assuming still true)
- An RLS write-access gap and the signup wizard's silent partial-failure handling were both flagged as open after an events bugfix session, with no confirmation found that either was resolved afterward.

---

## 7. Known gaps (confirmed by direct code reading, current as of this doc)

- **Donate button is non-functional** — no live payment processing, and the CTA itself has no click handler.
- **Volunteer "signup" is a redirect to Contact**, not an in-app form.
- **Media Library admin page is a stub** — no real asset browser exists yet.
- **Communication preferences are view-only** for members post-signup; changes require emailing the office.
- Image storage is base64-in-Postgres everywhere **except** event flyers, which use real Supabase Storage.
- No global React error boundary.
- The signup wizard's "Fill test data" button ships live to real end users, not just internal/dev builds.

---

## 8. Open discrepancy to flag to the user

`CLAUDE.md` (§10, Member Signup Wizard step reference) and `docs/FEATURES.md` both describe a **10-step** wizard including a conditional **Program Enrollment** step and adult-level `date_of_birth`/marital/occupation/employer fields. The live code (`src/lib/signupSchema.ts`, `src/components/signup/MemberSignupWizard.tsx`) has **9 steps**, no Program Enrollment step, and none of those adult fields. Past session history confirms this was an intentional trim the user requested. Recommend updating `CLAUDE.md` and `docs/FEATURES.md` to match — they'll otherwise keep misleading future sessions (including me) about what the wizard actually collects.
