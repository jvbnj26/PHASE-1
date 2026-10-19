// Site-content text fields used to be plain text (paragraphs separated by blank lines) and are
// now edited with the rich-text editor, which saves HTML. Both shapes can be in the database, so
// everything that displays or edits one of these fields goes through toRichHtml().

const HTML_START = /^\s*<(p|h[1-6]|ul|ol|li|blockquote|div|br|strong|b|em|i|u|s|span|a|mark)[\s>/]/i;

export function isRichHtml(value: string): boolean {
  return HTML_START.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Legacy plain text → HTML, matching how each page used to display it:
// - default: blank lines separate paragraphs, single line breaks are kept inside a paragraph.
// - splitLines: every line is its own paragraph (the Donations pledge box did this). Blank lines
//   are kept as empty paragraphs so the spacing between groups of lines stays the same.
export function plainTextToHtml(text: string, { splitLines = false } = {}): string {
  const normalized = text.replace(/\r\n?/g, '\n').trim();
  if (!normalized) return '';
  if (splitLines) {
    return normalized.split('\n').map((line) => `<p>${escapeHtml(line.trim())}</p>`).join('');
  }
  return normalized
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p>${escapeHtml(b).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function toRichHtml(value: string | undefined | null, opts?: { splitLines?: boolean }): string {
  if (!value) return '';
  return isRichHtml(value) ? value : plainTextToHtml(value, opts);
}

// The editor saves "<p></p>" when a box is cleared — treat that as empty so optional sections hide.
export function isRichTextEmpty(value: string | undefined | null): boolean {
  if (!value) return true;
  return toRichHtml(value).replace(/<br\s*\/?>/gi, '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === '';
}
