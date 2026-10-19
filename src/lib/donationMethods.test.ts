import { describe, it, expect } from 'vitest';
import { donationButtonHref, validateDonationMethods, newDonationMethod } from './donationMethods';
import { defaultDonationContent } from '@/data/siteContent';

describe('donationButtonHref', () => {
  it('keeps web, mail and phone links and adds https to bare domains', () => {
    expect(donationButtonHref('https://www.paypal.com/donate?x=1')).toBe('https://www.paypal.com/donate?x=1');
    expect(donationButtonHref(' paypal.me/jvbna ')).toBe('https://paypal.me/jvbna');
    expect(donationButtonHref('mailto:treasurer@jvbnj.org')).toBe('mailto:treasurer@jvbnj.org');
    expect(donationButtonHref('tel:+17325551234')).toBe('tel:+17325551234');
  });

  it('rejects empty and unsafe links', () => {
    expect(donationButtonHref('')).toBeNull();
    expect(donationButtonHref('javascript:alert(1)')).toBeNull();
  });
});

describe('validateDonationMethods', () => {
  it('accepts the shipped defaults', () => {
    expect(validateDonationMethods(defaultDonationContent.paymentMethods)).toBeNull();
  });

  it('requires a title, and button text whenever a link is set', () => {
    expect(validateDonationMethods([newDonationMethod()])).toMatch(/needs a title/);
    const m = { ...newDonationMethod(), title: 'Zelle', buttonUrl: 'https://zelle.com' };
    expect(validateDonationMethods([m])).toMatch(/no button text/);
    expect(validateDonationMethods([{ ...m, buttonLabel: 'Pay with Zelle' }])).toBeNull();
  });

  it('rejects an invalid button link', () => {
    const m = { ...newDonationMethod(), title: 'X', buttonLabel: 'Go', buttonUrl: 'javascript:void(0)' };
    expect(validateDonationMethods([m])).toMatch(/invalid button link/);
  });
});
