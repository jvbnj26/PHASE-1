import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILTIN_PAGES } from '@/pages/admin/AdminPagesPage';

// Regression guard for the Gyanshala bug: it shipped as a hardcoded <Route> in App.tsx with
// no admin editor and no entry in BUILTIN_PAGES, so it was live on the site but invisible and
// unmutable in Admin > Pages ("baked in"). Every public page must be reachable and editable
// through one of two paths — see the comment above <Routes> in App.tsx:
//   1. The custom pages CMS (Admin > Pages > Create new page) — served from /p/:slug.
//   2. A "built-in" page with its own admin editor, registered in BUILTIN_PAGES.
//
// This test statically parses the public routes out of App.tsx and fails if any of them is
// neither a BUILTIN_PAGES entry nor an explicitly exempted utility/sub-route below. Adding a
// new hardcoded page route therefore forces a deliberate choice: register it as a real page, or
// justify the exemption here — it can no longer slip through unregistered.
const EXEMPT_ROUTES = new Set([
  // Auth / account utility routes — not content pages.
  '/auth',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/signup',
  '/member',
  // Alias of the already-registered "Volunteer / Get Involved" page.
  '/get-involved',
  // Parametrized sub-views of the already-registered "Events" page.
  '/events/:type',
  '/events/:id/rsvp',
  // The custom-pages CMS itself — pages here are DB-backed and always mutable by design.
  '/p/:slug',
  '/p/:parent/:slug',
  // Blog is its own dedicated subsystem with its own admin editor (/admin/blog) and sidebar
  // nav entry, analogous to Events — not a single "page" to register here.
  '/blog',
  '/blog/:slug',
  // React Router catch-all.
  '*',
]);

function readAppTsx(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return fs.readFileSync(path.join(here, 'App.tsx'), 'utf8');
}

describe('every public page route is registered as an editable page', () => {
  it('has a BUILTIN_PAGES entry (or an explicit exemption) for each public route in App.tsx', () => {
    const appSrc = readAppTsx();

    // Only the public routes are in scope — admin routes have their own editors by definition.
    const [publicSection] = appSrc.split('Admin Routes');
    expect(publicSection, 'expected to find the "Admin Routes" marker in App.tsx').toBeTruthy();

    const routePaths = [...publicSection.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
    expect(routePaths.length).toBeGreaterThan(0);

    const registeredPaths = new Set(BUILTIN_PAGES.map((p) => p.path));
    const unregistered = routePaths.filter((p) => !EXEMPT_ROUTES.has(p) && !registeredPaths.has(p));

    expect(
      unregistered,
      `Route(s) with no editor and no BUILTIN_PAGES entry: ${unregistered.join(', ')}.\n` +
        `Every new page must either:\n` +
        `  1. Be created through the custom pages CMS (Admin > Pages > Create new page), or\n` +
        `  2. Get a dedicated admin editor and be added to BUILTIN_PAGES in AdminPagesPage.tsx.\n` +
        `If this is intentionally a non-page utility route, add it to EXEMPT_ROUTES in this test\n` +
        `instead — that keeps the omission deliberate and documented rather than silent.`,
    ).toEqual([]);
  });

  it('every BUILTIN_PAGES entry points at an admin route App.tsx actually registers', () => {
    const appSrc = readAppTsx();
    for (const page of BUILTIN_PAGES) {
      expect(
        appSrc.includes(`path="${page.admin}"`),
        `BUILTIN_PAGES entry "${page.title}" points at admin route ${page.admin}, which App.tsx doesn't register.`,
      ).toBe(true);
    }
  });
});
