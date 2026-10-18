import { describe, it, expect } from 'vitest';
import { validatePhotoAlbums, normalizeAlbums } from './photoAlbums';
import { defaultPhotoAlbums } from '@/data/siteContent';

const album = (name: string, url: string) => ({ id: name || 'x', name, url });

describe('validatePhotoAlbums', () => {
  it('accepts an empty list and valid albums', () => {
    expect(validatePhotoAlbums([])).toBeNull();
    expect(validatePhotoAlbums([album('Paryushan', 'https://photos.app.goo.gl/abc')])).toBeNull();
  });

  it('accepts the shipped default albums', () => {
    expect(validatePhotoAlbums(defaultPhotoAlbums)).toBeNull();
  });

  it('rejects a missing name or link', () => {
    expect(validatePhotoAlbums([album('', 'https://x.com')])).toMatch(/Album 1 needs a name/);
    expect(validatePhotoAlbums([album('A', 'https://x.com'), album('B', '')])).toMatch(/Album 2 .* needs a link/);
  });

  it('rejects non-URLs and non-http schemes', () => {
    expect(validatePhotoAlbums([album('A', 'photos.app.goo.gl/abc')])).toMatch(/invalid link/);
    expect(validatePhotoAlbums([album('A', 'javascript:alert(1)')])).toMatch(/must start with https/);
  });
});

describe('normalizeAlbums', () => {
  it('trims whitespace so blank-looking entries fail validation', () => {
    const out = normalizeAlbums([album('  Blood Drive ', ' https://x.com  '), album('   ', 'https://y.com')]);
    expect(out[0]).toMatchObject({ name: 'Blood Drive', url: 'https://x.com' });
    expect(validatePhotoAlbums(out)).toMatch(/Album 2 needs a name/);
  });

  it('keeps an uploaded image and drops an empty one', () => {
    const [withImg, without] = normalizeAlbums([
      { id: '1', name: 'A', url: 'https://x.com', imageUrl: 'https://cdn/x.jpg' },
      { id: '2', name: 'B', url: 'https://y.com', imageUrl: '' },
    ]);
    expect(withImg.imageUrl).toBe('https://cdn/x.jpg');
    expect(without).not.toHaveProperty('imageUrl');
  });
});
