import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { toImageSize } from './imageSize';
import { PageBlockView } from '@/components/PageBlocks';
import DonationMethodCard from '@/components/DonationMethodCard';
import { newDonationMethod } from '@/lib/donationMethods';

describe('toImageSize', () => {
  it('accepts known sizes and falls back otherwise', () => {
    expect(toImageSize('sm', 'lg')).toBe('sm');
    expect(toImageSize('huge', 'lg')).toBe('lg');
    expect(toImageSize(undefined, 'md')).toBe('md');
  });
});

describe('added-section image sizes', () => {
  const block = { id: 'b', layout: 'image' as const, imageUrl: 'https://x/y.png' };
  it('keeps the original width when no size is chosen', () => {
    const { container } = render(<PageBlockView b={block} />);
    expect(container.firstElementChild?.className).toBe('my-8 max-w-3xl mx-auto');
    const full = render(<PageBlockView b={{ ...block, layout: 'image-full' }} />);
    expect(full.container.firstElementChild?.className).toBe('my-8');
  });
  it('applies a chosen size', () => {
    const { container } = render(<PageBlockView b={{ ...block, imageSize: 'sm' }} />);
    expect(container.firstElementChild?.className).toBe('my-8 max-w-sm mx-auto');
    const side = render(<PageBlockView b={{ ...block, layout: 'text-image-right', body: '<p>Hi</p>', imageSize: 'md' }} />);
    expect(side.container.querySelector('img')?.parentElement?.className).toBe('max-w-sm mx-auto');
  });
});

describe('donation card image size', () => {
  const method = { ...newDonationMethod(), title: 'QR', imageUrl: 'https://x/qr.png' };
  it('defaults to the original height limit, and applies a chosen size', () => {
    expect(render(<DonationMethodCard method={method} />).container.querySelector('img')?.className).toContain('max-h-56');
    expect(render(<DonationMethodCard method={{ ...method, imageSize: 'sm' }} />).container.querySelector('img')?.className).toContain('max-h-24');
  });
});
