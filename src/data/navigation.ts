// Single source of truth for the site's top-level public navigation structure.
// Used by both Header.tsx (renders it) and AdminPagesPage.tsx (lets admins reorder it,
// interleaved with top-level custom pages, via the "Site Navigation Order" list).

export interface NavSubItem {
  name: string;
  path: string;
}

export interface NavItem {
  name: string;
  path: string;
  submenu?: NavSubItem[];
  /** Admin editor route for this built-in page — shown in Admin > Pages, not used by Header. */
  admin: string;
}

export const BUILTIN_NAV_ITEMS: NavItem[] = [
  { name: 'HOME', path: '/', admin: '/admin/home' },
  {
    name: 'ABOUT US',
    path: '/about',
    admin: '/admin/about',
    submenu: [
      { name: 'About JVBNA', path: '/about' },
      { name: 'Leadership', path: '/about/leadership' },
    ],
  },
  {
    name: 'EVENTS',
    path: '/events',
    admin: '/admin/events',
    submenu: [
      { name: 'Upcoming Events', path: '/events/upcoming' },
      { name: 'Ongoing Events', path: '/events/ongoing' },
      { name: 'Past Events', path: '/events/past' },
    ],
  },
  {
    name: 'ACTIVITIES',
    path: '/activities',
    admin: '/admin/activities',
    submenu: [
      { name: 'All Activities', path: '/activities' },
      { name: 'Gyanshala', path: '/activities/gyanshala' },
    ],
  },
  { name: 'BLOG', path: '/blog', admin: '/admin/blog' },
  { name: 'CALENDAR', path: '/calendar', admin: '/admin/settings' },
  { name: 'PHOTOS', path: '/photos', admin: '/admin/settings' },
  { name: 'SPIRITUAL GUIDANCE', path: '/spiritual-guidance', admin: '/admin/spiritual-guidance' },
  {
    name: 'GET INVOLVED',
    path: '/get-involved',
    admin: '/admin/volunteer',
    submenu: [
      { name: 'Volunteer', path: '/volunteer' },
      { name: 'Donate', path: '/donate' },
    ],
  },
  { name: 'CONTACT US', path: '/contact', admin: '/admin/contact' },
];

/**
 * Converts a built-in top-level page's path to the plain identifier used for BOTH:
 *   - `custom_pages.parent_slug`, when a custom page is created as a subpage of a built-in
 *     page (e.g. a subpage of "About Us" gets parent_slug 'about'), and
 *   - the `:parent` URL segment such a subpage is served at: /p/about/newsletter.
 * '/' -> 'home' (an empty URL segment isn't usable); every other path just drops its
 * leading slash. Custom top-level pages are barred from taking any of these slugs (see
 * RESERVED_PARENT_SLUGS in AdminPagesPage.tsx) so a parent_slug value is never ambiguous
 * between "a built-in page" and "some custom page that happens to share its slug".
 */
export function builtinPathToSegment(path: string): string {
  return path === '/' ? 'home' : path.replace(/^\//, '');
}

/** The reverse of builtinPathToSegment, for every built-in page at once — used to validate
 *  new top-level custom page slugs and to resolve a subpage's parent_slug back to a real URL. */
export const RESERVED_PARENT_SLUGS = new Set(BUILTIN_NAV_ITEMS.map((item) => builtinPathToSegment(item.path)));

/**
 * Resolves a custom page's `parent_slug` to the URL its parent actually lives at — used for
 * "← Back" links. A built-in parent (e.g. 'about') lives at its real route (/about), not at
 * /p/about (that path serves nothing — /p/ is only for custom top-level pages).
 */
export function resolveParentPagePath(parentSlug: string): string {
  const builtin = BUILTIN_NAV_ITEMS.find((item) => builtinPathToSegment(item.path) === parentSlug);
  return builtin ? builtin.path : `/p/${parentSlug}`;
}

/**
 * Orders a mixed list of top-level pages (built-in + custom) by `pageOrder` — an array of
 * stable ids persisted in site_settings and edited from Admin > Pages ("Site Navigation
 * Order"). Ids not found in `pageOrder` (e.g. a custom page created after the last reorder)
 * are appended at the end, preserving their original relative order — so a brand-new page
 * always shows up somewhere sane instead of vanishing from the list or jumping to the front.
 */
export function orderTopLevelPages<T extends { id: string }>(items: T[], pageOrder: string[]): T[] {
  const positionOf = new Map(pageOrder.map((id, i) => [id, i]));
  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const ai = positionOf.get(a.item.id) ?? Number.MAX_SAFE_INTEGER;
      const bi = positionOf.get(b.item.id) ?? Number.MAX_SAFE_INTEGER;
      return ai !== bi ? ai - bi : a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
}
