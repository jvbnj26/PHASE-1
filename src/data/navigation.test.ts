import { describe, it, expect } from 'vitest';
import {
  orderTopLevelPages,
  builtinPathToSegment,
  RESERVED_PARENT_SLUGS,
  resolveParentPagePath,
  BUILTIN_NAV_ITEMS,
} from './navigation';

const item = (id: string) => ({ id, name: id });

describe('orderTopLevelPages', () => {
  it('sorts items according to the given order', () => {
    const items = [item('a'), item('b'), item('c')];
    const result = orderTopLevelPages(items, ['c', 'a', 'b']);
    expect(result.map((i) => i.id)).toEqual(['c', 'a', 'b']);
  });

  it('appends items missing from pageOrder at the end, preserving their relative order', () => {
    // 'new' (a page created after the last reorder) isn't in pageOrder yet.
    const items = [item('a'), item('new'), item('b')];
    const result = orderTopLevelPages(items, ['b', 'a']);
    expect(result.map((i) => i.id)).toEqual(['b', 'a', 'new']);
  });

  it('is a no-op sort when pageOrder is empty — original relative order is preserved', () => {
    const items = [item('a'), item('b'), item('c')];
    expect(orderTopLevelPages(items, []).map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input array', () => {
    const items = [item('a'), item('b')];
    orderTopLevelPages(items, ['b', 'a']);
    expect(items.map((i) => i.id)).toEqual(['a', 'b']);
  });
});

describe('builtinPathToSegment', () => {
  it('maps the home path to "home", since an empty URL segment is not usable', () => {
    expect(builtinPathToSegment('/')).toBe('home');
  });

  it('strips the leading slash from every other path', () => {
    expect(builtinPathToSegment('/about')).toBe('about');
    expect(builtinPathToSegment('/get-involved')).toBe('get-involved');
  });
});

describe('RESERVED_PARENT_SLUGS', () => {
  it('contains a segment for every built-in nav item, so a custom top-level page can never collide with one', () => {
    for (const item of BUILTIN_NAV_ITEMS) {
      expect(RESERVED_PARENT_SLUGS.has(builtinPathToSegment(item.path))).toBe(true);
    }
  });
});

describe('resolveParentPagePath', () => {
  it('resolves a built-in segment to its real route, not /p/<segment>', () => {
    // A subpage of "About Us" (parent_slug: 'about') has a "Back" link to /about, the real
    // page — NOT /p/about, which serves nothing (custom top-level pages live at /p/:slug,
    // but "about" is reserved and can never be one).
    expect(resolveParentPagePath('about')).toBe('/about');
    expect(resolveParentPagePath('home')).toBe('/');
  });

  it('resolves any other parent_slug as a custom top-level page, at /p/<slug>', () => {
    expect(resolveParentPagePath('newsletter')).toBe('/p/newsletter');
  });
});
