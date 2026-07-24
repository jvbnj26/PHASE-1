import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function isoToUTC(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function todayUTC(today: Date): number {
  return Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Computes an event's effective type from its ISO dates and today's date.
 * Falls back to the manually-set `type` when no startDate is provided.
 * All comparisons are UTC-midnight so timezone shifts never cause off-by-one errors.
 */
export function classifyEvent(
  event: { type: 'upcoming' | 'ongoing' | 'past'; startDate?: string; endDate?: string },
  today = new Date()
): 'upcoming' | 'ongoing' | 'past' {
  if (!event.startDate) return event.type;
  const now   = todayUTC(today);
  const start = isoToUTC(event.startDate);
  const end   = event.endDate ? isoToUTC(event.endDate) : start;
  if (now < start) return 'upcoming';
  if (now > end)   return 'past';
  return 'ongoing';
}

/**
 * Picks the event to feature (e.g. in the homepage popup): the one happening
 * today wins outright; otherwise the soonest upcoming event; otherwise the
 * most recently ended event. Events without a startDate are ignored — the
 * free-text `date` display string isn't reliably machine-parseable, so only
 * dated events are eligible for auto-selection.
 */
export function pickFeaturedEvent<T extends { startDate?: string; endDate?: string }>(
  events: T[],
  today = new Date()
): { event: T; status: 'today' | 'upcoming' | 'past' } | undefined {
  const now = todayUTC(today);

  let ongoing: { event: T; endUTC: number } | undefined;
  let upcoming: { event: T; startUTC: number } | undefined;
  let past: { event: T; endUTC: number } | undefined;

  for (const event of events) {
    if (!event.startDate) continue;
    const startUTC = isoToUTC(event.startDate);
    const endUTC = event.endDate ? isoToUTC(event.endDate) : startUTC;

    if (now >= startUTC && now <= endUTC) {
      if (!ongoing || endUTC < ongoing.endUTC) ongoing = { event, endUTC };
    } else if (now < startUTC) {
      if (!upcoming || startUTC < upcoming.startUTC) upcoming = { event, startUTC };
    } else {
      if (!past || endUTC > past.endUTC) past = { event, endUTC };
    }
  }

  if (ongoing) return { event: ongoing.event, status: 'today' };
  if (upcoming) return { event: upcoming.event, status: 'upcoming' };
  if (past) return { event: past.event, status: 'past' };
  return undefined;
}
