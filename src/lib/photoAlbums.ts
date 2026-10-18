import type { PhotoAlbum } from '@/data/siteContent';

// Returns a human-readable error for the first invalid album, or null if every album has a
// name and an http(s) link. Inputs are expected to be trimmed already (see normalizeAlbums).
export function validatePhotoAlbums(albums: PhotoAlbum[]): string | null {
  for (let i = 0; i < albums.length; i++) {
    const { name, url } = albums[i];
    const label = `Album ${i + 1}`;
    if (!name) return `${label} needs a name.`;
    if (!url) return `${label} ("${name}") needs a link.`;
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return `${label} ("${name}") has an invalid link — paste the full shareable URL, starting with https://`;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return `${label} ("${name}") link must start with https://`;
    }
  }
  return null;
}

export function normalizeAlbums(albums: PhotoAlbum[]): PhotoAlbum[] {
  return albums.map(({ imageUrl, ...a }) => ({
    ...a,
    name: a.name.trim(),
    url: a.url.trim(),
    ...(imageUrl ? { imageUrl } : {}),
  }));
}
