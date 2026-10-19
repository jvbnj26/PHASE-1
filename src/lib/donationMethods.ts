import { CreditCard, Building2, Globe, Smartphone, QrCode, Heart, type LucideIcon } from 'lucide-react';
import type { DonationMethod, DonationMethodIcon } from '@/data/siteContent';

export const DONATION_METHOD_ICONS: Record<DonationMethodIcon, { label: string; Icon: LucideIcon }> = {
  check: { label: 'Check / card', Icon: CreditCard },
  bank: { label: 'Bank', Icon: Building2 },
  globe: { label: 'International', Icon: Globe },
  mobile: { label: 'Mobile pay (Zelle, Venmo…)', Icon: Smartphone },
  qr: { label: 'QR code', Icon: QrCode },
  heart: { label: 'Other', Icon: Heart },
};

export function newDonationMethod(): DonationMethod {
  return {
    id: crypto.randomUUID(),
    icon: 'heart',
    title: '',
    description: '',
    details: '',
    buttonLabel: '',
    buttonUrl: '',
    imageUrl: '',
    recommended: false,
  };
}

// Normalizes a button link: bare domains get https://, and anything that isn't a web, mail or
// phone link is dropped so a typo can't produce a broken or unsafe button.
export function donationButtonHref(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  if (/^(mailto:|tel:)/i.test(url)) return url;
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(withScheme);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function validateDonationMethods(methods: DonationMethod[]): string | null {
  for (let i = 0; i < methods.length; i++) {
    const m = methods[i];
    const label = `Donation method ${i + 1}`;
    if (!m.title.trim()) return `${label} needs a title.`;
    if (m.buttonUrl.trim() && !donationButtonHref(m.buttonUrl)) return `${label} ("${m.title}") has an invalid button link.`;
    if (m.buttonUrl.trim() && !m.buttonLabel.trim()) return `${label} ("${m.title}") has a button link but no button text.`;
  }
  return null;
}
