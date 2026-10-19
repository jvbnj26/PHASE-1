import { describe, it, expect } from 'vitest';
import { isRichHtml, plainTextToHtml, toRichHtml, isRichTextEmpty } from './richText';
import { defaultAboutContent, defaultDonationContent, defaultWelcomeText } from '@/data/siteContent';

describe('toRichHtml', () => {
  it('passes editor HTML through unchanged', () => {
    const html = '<h3>Hi</h3><p><strong>Bold</strong> text</p>';
    expect(isRichHtml(html)).toBe(true);
    expect(toRichHtml(html)).toBe(html);
  });

  it('turns legacy plain text into paragraphs split on blank lines', () => {
    expect(toRichHtml('First para\nsame para\n\nSecond para')).toBe('<p>First para<br>same para</p><p>Second para</p>');
  });

  it('splits every line into its own paragraph when asked (pledge box)', () => {
    expect(toRichHtml('Line one\nLine two', { splitLines: true })).toBe('<p>Line one</p><p>Line two</p>');
    expect(toRichHtml('Group A\n\nGroup B', { splitLines: true })).toBe('<p>Group A</p><p></p><p>Group B</p>');
  });

  it('escapes HTML-looking characters in plain text instead of rendering them', () => {
    expect(isRichHtml('5 < 6 & "quotes"')).toBe(false);
    expect(plainTextToHtml('5 < 6 & "quotes"')).toBe('<p>5 &lt; 6 &amp; &quot;quotes&quot;</p>');
    expect(plainTextToHtml('<3 our volunteers')).toBe('<p>&lt;3 our volunteers</p>');
  });

  it('handles empty values', () => {
    expect(toRichHtml('')).toBe('');
    expect(toRichHtml(undefined)).toBe('');
    expect(plainTextToHtml('   \n\n  ')).toBe('');
  });

  it('converts the shipped default content without losing text', () => {
    for (const text of [defaultWelcomeText.content, defaultAboutContent.intro, defaultDonationContent.intro]) {
      const html = toRichHtml(text);
      expect(html.startsWith('<p>')).toBe(true);
      const back = html
        .replace(/<[^>]+>/g, '')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      expect(back.replace(/\s+/g, '')).toBe(text.replace(/\s+/g, ''));
    }
  });
});

describe('isRichTextEmpty', () => {
  it('treats a cleared editor as empty', () => {
    expect(isRichTextEmpty('<p></p>')).toBe(true);
    expect(isRichTextEmpty('<p><br></p>')).toBe(true);
    expect(isRichTextEmpty('')).toBe(true);
    expect(isRichTextEmpty(null)).toBe(true);
  });

  it('treats real content as non-empty', () => {
    expect(isRichTextEmpty('<p>Hello</p>')).toBe(false);
    expect(isRichTextEmpty('plain text')).toBe(false);
  });
});
