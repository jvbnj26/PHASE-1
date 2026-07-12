// RFC-4180 CSV helper with UTF-8 BOM for Excel/Sheets compatibility.

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s: string;
  if (Array.isArray(value)) s = value.join('; ');
  else if (typeof value === 'object') s = JSON.stringify(value);
  else s = String(value);
  if (/[",\n\r]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function rowsToCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T | string; header: string }[],
): string {
  const header = columns.map((c) => escapeCell(c.header)).join(',');
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCell((row as Record<string, unknown>)[c.key as string])).join(','),
    )
    .join('\r\n');
  return '\uFEFF' + header + '\r\n' + body + '\r\n';
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '';
  try {
    return new Date(d).toISOString().replace('T', ' ').slice(0, 19);
  } catch {
    return String(d);
  }
}

// Minimal RFC-4180-ish CSV parser. Returns row objects keyed by header.
export function parseCsv(text: string): Record<string, string>[] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { cur.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        cur.push(field); field = '';
        if (cur.length > 1 || cur[0] !== '') rows.push(cur);
        cur = [];
      } else field += c;
    }
  }
  if (field !== '' || cur.length) { cur.push(field); rows.push(cur); }
  if (!rows.length) return [];
  const headers = rows.shift()!.map((h) => h.trim());
  return rows
    .filter((r) => r.some((v) => v !== ''))
    .map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (r[i] ?? '').trim(); });
      return obj;
    });
}
