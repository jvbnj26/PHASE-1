import { describe, it, expect } from 'vitest';
import { getImageSrc, imageMap } from './imageMap';

describe('getImageSrc', () => {
  it('resolves a known legacy key to its bundled asset', () => {
    expect(getImageSrc('banner-mahapragya')).toBe(imageMap['banner-mahapragya']);
  });

  it('passes through a real URL unchanged', () => {
    expect(getImageSrc('https://example.com/photo.png')).toBe('https://example.com/photo.png');
  });

  it('passes through a base64 data URL unchanged', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    expect(getImageSrc(dataUrl)).toBe(dataUrl);
  });

  it('falls back to the placeholder for null, undefined, or empty string', () => {
    expect(getImageSrc(null)).toBe('/placeholder.svg');
    expect(getImageSrc(undefined)).toBe('/placeholder.svg');
    expect(getImageSrc('')).toBe('/placeholder.svg');
  });
});
