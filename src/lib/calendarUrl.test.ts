import { describe, it, expect } from 'vitest';
import { cleanCalendarUrl, toCalendarEmbedUrl } from './calendarUrl';

const ID = 'c_0c7a177d76b7ddf070356566423c4bbb8be57635b4129b5375fb3521fc936fe7@group.calendar.google.com';
const URL = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(ID)}&ctz=America%2FNew_York`;

describe('cleanCalendarUrl', () => {
  it('leaves a bare URL unchanged', () => {
    expect(cleanCalendarUrl(URL)).toBe(URL);
    expect(cleanCalendarUrl(`  ${URL}  `)).toBe(URL);
  });

  it('extracts the src from a full iframe embed snippet', () => {
    expect(cleanCalendarUrl(`<iframe src="${URL}" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe>`)).toBe(URL);
  });

  it('strips a quoted URL followed by leftover iframe attributes', () => {
    expect(cleanCalendarUrl(`"${URL}" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"`)).toBe(URL);
  });
});

describe('toCalendarEmbedUrl', () => {
  it('builds the embed URL from an account email or a shared calendar ID', () => {
    expect(toCalendarEmbedUrl(' socialmedia@jvbnj.org ')).toBe(
      'https://calendar.google.com/calendar/embed?src=socialmedia%40jvbnj.org&ctz=America%2FNew_York',
    );
    expect(toCalendarEmbedUrl(ID)).toBe(URL);
  });

  it('accepts the embed URL, full embed code, or the broken fragment that took the calendar down', () => {
    expect(toCalendarEmbedUrl(URL)).toBe(URL);
    expect(toCalendarEmbedUrl(`<iframe src="${URL}" style="border: 0" width="800"></iframe>`)).toBe(URL);
    expect(toCalendarEmbedUrl(`"${URL}" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"`)).toBe(URL);
  });

  it('converts the public iCal link to the embed URL', () => {
    expect(toCalendarEmbedUrl(`https://calendar.google.com/calendar/ical/${encodeURIComponent(ID)}/public/basic.ics`)).toBe(URL);
  });

  it('rejects anything that is not a Google Calendar', () => {
    expect(toCalendarEmbedUrl('')).toBeNull();
    expect(toCalendarEmbedUrl('not a calendar')).toBeNull();
    expect(toCalendarEmbedUrl('https://example.com/calendar/embed?src=x')).toBeNull();
    expect(toCalendarEmbedUrl('https://calendar.google.com/calendar/embed')).toBeNull();
    expect(toCalendarEmbedUrl('https://calendar.google.com/calendar/u/0/r')).toBeNull();
  });
});
