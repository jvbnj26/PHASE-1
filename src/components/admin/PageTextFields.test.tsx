import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PageTextFields from './PageTextFields';
import PageLayoutCard from './PageLayoutCard';

const ctx = {
  pageText: {} as Record<string, string>,
  setPageText: vi.fn(),
  pageLayout: {} as Record<string, { order: string[]; hidden: string[] }>,
  setPageLayout: vi.fn(),
  pageSections: {} as Record<string, unknown[]>,
};
vi.mock('@/contexts/SiteContentContext', () => ({ useSiteContent: () => ctx }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  ctx.pageText = {};
  ctx.pageLayout = {};
  ctx.pageSections = {};
  ctx.setPageText.mockReset();
  ctx.setPageLayout.mockReset();
});

describe('PageTextFields', () => {
  it('shows current text and saves an edited heading, a hidden label, and untouched fields as defaults', () => {
    ctx.pageText = { 'donate.introHeading': 'Old heading' };
    render(<PageTextFields page="donate" section="intro" />);
    expect(screen.getByText('Old heading')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit text/i }));
    fireEvent.change(screen.getByLabelText('Heading'), { target: { value: 'New heading' } });
    fireEvent.change(screen.getByLabelText('Small label above the heading'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /save text/i }));

    expect(ctx.setPageText).toHaveBeenCalledWith({
      'donate.introHeading': 'New heading',
      'donate.introEyebrow': '',
    });
  });

  it('stores nothing when a field is reset to the original wording', () => {
    ctx.pageText = { 'donate.introHeading': 'Old heading' };
    render(<PageTextFields page="donate" section="intro" />);
    fireEvent.click(screen.getByRole('button', { name: /edit text/i }));
    fireEvent.click(screen.getByRole('button', { name: /reset to original/i }));
    fireEvent.click(screen.getByRole('button', { name: /save text/i }));
    expect(ctx.setPageText).toHaveBeenCalledWith({ 'donate.introHeading': null, 'donate.introEyebrow': null });
  });

  it('refuses to save an invalid link', () => {
    render(<PageTextFields page="about" section="leadership" />);
    fireEvent.click(screen.getByRole('button', { name: /edit text/i }));
    fireEvent.change(screen.getByLabelText('Button link'), { target: { value: 'javascript:alert(1)' } });
    fireEvent.click(screen.getByRole('button', { name: /save text/i }));
    expect(ctx.setPageText).not.toHaveBeenCalled();
  });
});

describe('PageLayoutCard', () => {
  it('lists built-in and added sections, and saves a new order and hidden sections', () => {
    ctx.pageSections = { about: [{ id: 'x1', layout: 'text', body: '<p>My added section</p>', imageUrl: '' }] };
    render(<PageLayoutCard pageId="about" />);
    const rows = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(rows[0]).toContain('Introduction');
    expect(rows[4]).toContain('My added section');

    // Move the added section up one (above Leadership) and hide Mission.
    fireEvent.click(screen.getAllByRole('button', { name: 'Move up' })[4]);
    fireEvent.click(screen.getByRole('switch', { name: 'Show Mission' }));
    fireEvent.click(screen.getByRole('button', { name: /save order/i }));

    expect(ctx.setPageLayout).toHaveBeenCalledWith('about', {
      order: ['intro', 'mission', 'programs', 'extra:x1', 'leadership'],
      hidden: ['mission'],
    });
  });
});
