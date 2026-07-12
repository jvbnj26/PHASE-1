## Membership Portal Signup Flow + Admin CRM

Build a multi-step member signup wizard, a normalized database schema, and an admin CRM with detail view, edit, and CSV exports — layered onto the existing JVBNA site without breaking current auth or admin pages.

### 1. Database schema (single migration)
Create 12 tables in `public`, all with RLS + GRANTs:
- `user_roles` (+ `app_role` enum: `admin`, `member`) and `has_role()` security-definer function — required for admin-only access without recursive RLS.
- `member_profiles`, `households`, `household_members`, `student_profiles`, `program_enrollments`, `event_preferences`, `donation_preferences`, `communication_preferences`, `consents`, `admin_notes`, `audit_logs`.
- Each table keyed to `auth.users(id)` where relevant; no `users` table (Supabase auth owns it; we mirror needed fields in `member_profiles`).
- RLS: members can read/write only their own rows + their linked household/students; admins (via `has_role`) can read/write all.
- `audit_logs` insert-only for members; admins read all.
- Triggers: `updated_at` auto-update; existing `handle_new_user` continues to create the `profiles` row (kept for backward compat).
- Seed: grant the existing demo admin (`admin@jvbnj.org`) the `admin` role on first login via a one-off insert (documented; user runs after signing up that email).

### 2. Multi-step signup wizard (`/signup` route, replaces simple form)
New component `MemberSignupWizard.tsx` with:
- Progress bar + step indicator (10 steps).
- Per-step Zod validation; "Next" disabled until valid.
- Dynamic branching:
  - Steps 4 (household/children) only if `member_type === 'Parent'` or user toggles "I have children".
  - Step 5 (program enrollment) only if interested in programs OR has children.
  - Step 6 volunteer subfields only if `willing_to_volunteer === true`.
  - Step 7 donation subfields only if `interested_in_donating === true`.
  - SMS-related fields require phone; donation receipt email required if tax receipt selected.
- Dynamic child/student repeater in Step 4.
- Step 10 review page with per-section "Edit" jump-back.
- On submit: `supabase.auth.signUp` → on session, insert into all relevant tables in a single batched call (sequential awaits, rolled-up error handling) → success screen → redirect home logged-in.
- Form state persisted to `sessionStorage` so refresh doesn't wipe progress.

Keep existing simple `/auth` login page untouched. Wire "Sign Up" button in header + EventPopup RSVP redirect to `/signup` instead of `/auth?tab=signup`.

### 3. Admin CRM (`/admin/members`)
New pages under existing `AdminLayout`:
- `AdminMembersPage.tsx` — searchable/filterable table (name, email, phone, member_type, membership_status, age_group, volunteer interest, donation interest). Columns: name, email, phone, type, status, joined, actions.
- `AdminMemberDetailPage.tsx` — tabbed view: Profile · Household · Students · Programs · Events · Donations · Communications · Consents · Admin Notes · Audit Log. Each tab has inline edit (admin-only writes go through RLS).
- Add internal admin notes with visibility flag.
- "Download CSV" button with dropdown: Full members · Households · Students · Volunteer interest · Donation preferences · Communication preferences. CSV built client-side with proper RFC-4180 escaping, UTF-8 BOM, ISO date formatting, no password/sensitive fields.

Add "Members" link to `AdminLayout` sidebar.

### 4. Security
- Roles in dedicated `user_roles` table (never on profile).
- `has_role()` SECURITY DEFINER used in every admin RLS policy.
- Admin route guard checks `has_role(uid, 'admin')` via RPC, not client-only flag.
- No card / CVV / bank fields anywhere.
- Audit log entry written on admin edits to member profiles.

### 5. Files to add/change

**New:**
- `src/components/signup/MemberSignupWizard.tsx` (+ small per-step components or inline sections)
- `src/lib/signupSchema.ts` (Zod schemas per step + types)
- `src/lib/csvExport.ts` (RFC-4180 helper)
- `src/pages/SignupPage.tsx`
- `src/pages/admin/AdminMembersPage.tsx`
- `src/pages/admin/AdminMemberDetailPage.tsx`
- One Supabase migration

**Modified:**
- `src/App.tsx` — add `/signup`, `/admin/members`, `/admin/members/:id` routes
- `src/contexts/AuthContext.tsx` — add `isAdmin` check via `has_role` RPC (keep legacy demo)
- `src/components/admin/AdminLayout.tsx` — add Members nav item + admin role gate
- `src/components/layout/Header.tsx` — Sign Up button → `/signup`
- `src/components/EventPopup.tsx` — RSVP unauthenticated → `/signup`

### 6. Technical notes
- All inserts on submit run client-side under the new user's session, so RLS `auth.uid() = user_id` policies cover them.
- Children stored in `student_profiles` linked to `parent_user_id` + `household_id`; no auth users created for children.
- `audit_logs` populated only by admin edit flows in the dashboard (not by signup).
- CSV uses semicolons-safe quoting; downloads via `Blob` + object URL.
- Site content editing, events admin, and existing public pages are not touched.

### Out of scope (for this pass)
- Email verification UI flow (Supabase default emails still fire).
- Self-serve member portal beyond what already exists (members editing their own profile in a dedicated page — can add later if you want).
- Payment integration (donation form only captures intent/preferences).
