import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  const toUTC = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const now   = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const start = toUTC(event.startDate);
  const end   = event.endDate ? toUTC(event.endDate) : start;
  if (now < start) return 'upcoming';
  if (now > end)   return 'past';
  return 'ongoing';
}
