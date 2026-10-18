// Admins often paste Google's whole embed snippet (or a fragment of it, e.g.
// `"https://...embed?src=..." style="border: 0" width="800"`) instead of the bare URL. Used
// verbatim as an iframe src, that renders nothing — so pull out just the URL.
export function cleanCalendarUrl(raw: string): string {
  const input = raw.trim();
  const srcAttr = input.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcAttr && /^https?:\/\//i.test(srcAttr[1])) return srcAttr[1];
  const bare = input.match(/https?:\/\/[^\s"'<>]+/i);
  return bare ? bare[0] : input;
}

const EMBED_BASE = 'https://calendar.google.com/calendar/embed';
const DEFAULT_TZ = 'America/New_York';

export function embedUrlForCalendarId(calendarId: string): string {
  return `${EMBED_BASE}?src=${encodeURIComponent(calendarId)}&ctz=${encodeURIComponent(DEFAULT_TZ)}`;
}

// A Google calendar ID is either an account email (socialmedia@jvbnj.org) or a shared
// calendar's ID (c_…@group.calendar.google.com) — both are email-shaped.
const CALENDAR_ID = /^[^\s@"'<>]+@[^\s@"'<>]+\.[^\s@"'<>]+$/;

// Turns whatever an admin pastes — a calendar email/ID, the embed URL, the full embed code (or a
// fragment of it), or the public iCal link — into a working embed URL. Returns null for anything
// that isn't recognizably a Google Calendar, so a bad value is rejected instead of saved.
export function toCalendarEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;
  if (CALENDAR_ID.test(input)) return embedUrlForCalendarId(input);

  let url: URL;
  try {
    url = new URL(cleanCalendarUrl(input));
  } catch {
    return null;
  }
  if (url.hostname !== 'calendar.google.com') return null;

  if (url.pathname.startsWith('/calendar/embed') && url.searchParams.get('src')) {
    url.protocol = 'https:';
    return url.toString();
  }

  // https://calendar.google.com/calendar/ical/<calendar id>/public/basic.ics
  const ical = url.pathname.match(/^\/calendar\/ical\/([^/]+)\/public\//);
  if (ical) {
    const id = decodeURIComponent(ical[1]);
    if (CALENDAR_ID.test(id)) return embedUrlForCalendarId(id);
  }
  return null;
}
