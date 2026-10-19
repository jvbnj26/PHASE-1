import { describe, it, expect } from 'vitest';
import { resolvePageText, linkHref, mapEmbedSrc, resolveSectionOrder } from './pageContent';
import { PAGE_CONTENT, sectionDefs } from '@/data/pageContent';

describe('resolvePageText', () => {
  it('uses the default when there is no override', () => {
    expect(resolvePageText({}, 'donate', 'heroTitle')).toBe('Donations');
  });
  it('uses an override, and an empty override hides the text', () => {
    expect(resolvePageText({ 'donate.heroTitle': 'Give' }, 'donate', 'heroTitle')).toBe('Give');
    expect(resolvePageText({ 'donate.heroTitle': '' }, 'donate', 'heroTitle')).toBe('');
  });
  it('does not leak overrides between pages', () => {
    expect(resolvePageText({ 'about.heroTitle': 'X' }, 'donate', 'heroTitle')).toBe('Donations');
  });
});

describe('linkHref', () => {
  it('keeps site paths and anchors, and checks other links', () => {
    expect(linkHref('/about/leadership')).toBe('/about/leadership');
    expect(linkHref('#how-to-donate')).toBe('#how-to-donate');
    expect(linkHref('mailto:info@jvbnj.org')).toBe('mailto:info@jvbnj.org');
    expect(linkHref('youtube.com/@JVBNANewJersey')).toBe('https://youtube.com/@JVBNANewJersey');
  });
  it('rejects empty and unsafe links', () => {
    expect(linkHref('')).toBeNull();
    expect(linkHref('javascript:alert(1)')).toBeNull();
  });
  it('accepts every default link in the registry', () => {
    for (const page of Object.keys(PAGE_CONTENT) as (keyof typeof PAGE_CONTENT)[]) {
      for (const [, s] of sectionDefs(page)) {
        for (const [key, f] of Object.entries(s.fields)) {
          if (f.kind === 'url') expect(linkHref(f.default), `${page}.${key}`).not.toBeNull();
          if (f.kind === 'map') expect(mapEmbedSrc(f.default), `${page}.${key}`).not.toBeNull();
        }
      }
    }
  });
});

describe('mapEmbedSrc', () => {
  it('accepts embed links and embed code', () => {
    const src = 'https://www.google.com/maps/embed?pb=!1m18!abc';
    expect(mapEmbedSrc(src)).toBe(src);
    expect(mapEmbedSrc(`<iframe src="${src}&amp;x=1" width="600"></iframe>`)).toBe(`${src}&x=1`);
  });
  it('turns an address into an embeddable map', () => {
    expect(mapEmbedSrc('151 Middlesex Avenue, Iselin, NJ 08830')).toBe(
      'https://www.google.com/maps?q=151%20Middlesex%20Avenue%2C%20Iselin%2C%20NJ%2008830&output=embed',
    );
  });
  it('rejects other web pages and empty values', () => {
    expect(mapEmbedSrc('')).toBeNull();
    expect(mapEmbedSrc('https://example.com/map')).toBeNull();
    expect(mapEmbedSrc('https://maps.app.goo.gl/abc')).toBeNull();
  });
});

describe('resolveSectionOrder', () => {
  const builtins = ['a', 'b', 'c'];
  it('defaults to built-in order, then added sections', () => {
    expect(resolveSectionOrder(builtins, ['x'], null)).toEqual(['a', 'b', 'c', 'extra:x']);
  });
  it('keeps a saved order that mixes added and built-in sections', () => {
    const saved = { order: ['extra:x', 'c', 'a', 'b'], hidden: [] };
    expect(resolveSectionOrder(builtins, ['x'], saved)).toEqual(['extra:x', 'c', 'a', 'b']);
  });
  it('drops deleted sections and adds new ones', () => {
    const saved = { order: ['c', 'extra:gone', 'a'], hidden: [] };
    // b is new: placed after its default predecessor a; the new added section goes last.
    expect(resolveSectionOrder(builtins, ['y'], saved)).toEqual(['c', 'a', 'b', 'extra:y']);
  });
  it('puts a new first built-in section at the top', () => {
    expect(resolveSectionOrder(builtins, [], { order: ['c', 'b'], hidden: [] })).toEqual(['a', 'c', 'b']);
  });
});
