import { describe, it, expect } from 'vitest';
import { rowsToCsv, parseCsv, formatDate } from './csvExport';

describe('rowsToCsv', () => {
  it('quotes cells containing commas, quotes, or newlines', () => {
    const csv = rowsToCsv(
      [{ name: 'Doe, Jane', note: 'Says "hi"\nagain' }],
      [{ key: 'name', header: 'Name' }, { key: 'note', header: 'Note' }],
    );
    expect(csv).toContain('"Doe, Jane"');
    expect(csv).toContain('"Says ""hi""\nagain"');
  });

  it('joins arrays with semicolons and stringifies objects', () => {
    const csv = rowsToCsv(
      [{ tags: ['a', 'b'], meta: { x: 1 } }],
      [{ key: 'tags', header: 'Tags' }, { key: 'meta', header: 'Meta' }],
    );
    expect(csv).toContain('a; b');
    expect(csv).toContain('"{""x"":1}"');
  });

  it('renders null/undefined as empty cells', () => {
    const csv = rowsToCsv(
      [{ a: null, b: undefined }],
      [{ key: 'a', header: 'A' }, { key: 'b', header: 'B' }],
    );
    const lines = csv.split('\r\n');
    expect(lines[1]).toBe(',');
  });

  it('starts with a UTF-8 BOM for Excel compatibility', () => {
    const csv = rowsToCsv([], [{ key: 'a', header: 'A' }]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
});

describe('parseCsv', () => {
  it('round-trips a simple table', () => {
    const csv = rowsToCsv(
      [{ name: 'Jane', city: 'Iselin' }, { name: 'Raj', city: 'Edison' }],
      [{ key: 'name', header: 'Name' }, { key: 'city', header: 'City' }],
    );
    const parsed = parseCsv(csv);
    expect(parsed).toEqual([
      { Name: 'Jane', City: 'Iselin' },
      { Name: 'Raj', City: 'Edison' },
    ]);
  });

  it('handles quoted fields with embedded commas and escaped quotes', () => {
    const csv = 'Name,Note\n"Doe, Jane","Says ""hi"""\r\n';
    const parsed = parseCsv(csv);
    expect(parsed).toEqual([{ Name: 'Doe, Jane', Note: 'Says "hi"' }]);
  });

  it('strips a leading BOM', () => {
    const parsed = parseCsv('﻿Name\nJane\n');
    expect(parsed).toEqual([{ Name: 'Jane' }]);
  });

  it('skips fully blank rows', () => {
    const parsed = parseCsv('Name,City\nJane,Iselin\n\nRaj,Edison\n');
    expect(parsed).toEqual([
      { Name: 'Jane', City: 'Iselin' },
      { Name: 'Raj', City: 'Edison' },
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseCsv('')).toEqual([]);
  });
});

describe('formatDate', () => {
  it('formats an ISO string to "YYYY-MM-DD HH:MM:SS"', () => {
    expect(formatDate('2026-03-05T14:30:00.000Z')).toBe('2026-03-05 14:30:00');
  });

  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('falls back to the raw string for unparseable input', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});
