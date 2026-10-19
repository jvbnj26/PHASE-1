import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTION_PAGES } from '@/data/siteContent';

// Every page listed in SECTION_PAGES must render its sections publicly AND offer the editor in
// its admin page — otherwise admins could add sections that never show, or a page silently
// loses the feature.
const WIRING: Record<keyof typeof SECTION_PAGES, { publicFile: string; adminFile: string }> = {
  home: { publicFile: 'pages/HomePage.tsx', adminFile: 'pages/admin/AdminHomePage.tsx' },
  about: { publicFile: 'pages/AboutPage.tsx', adminFile: 'pages/admin/AdminAboutPage.tsx' },
  donate: { publicFile: 'pages/DonatePage.tsx', adminFile: 'pages/admin/AdminDonationsPage.tsx' },
  activities: { publicFile: 'pages/ActivitiesPage.tsx', adminFile: 'pages/admin/AdminActivitiesPage.tsx' },
  gyanshala: { publicFile: 'pages/GyanshalaPage.tsx', adminFile: 'pages/admin/AdminGyanshalaPage.tsx' },
  'spiritual-guidance': { publicFile: 'pages/SpiritualGuidancePage.tsx', adminFile: 'pages/admin/AdminSpiritualGuidancePage.tsx' },
  volunteer: { publicFile: 'pages/VolunteerPage.tsx', adminFile: 'pages/admin/AdminVolunteerPage.tsx' },
  contact: { publicFile: 'pages/ContactPage.tsx', adminFile: 'pages/admin/AdminContactPage.tsx' },
};

const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => fs.readFileSync(path.join(srcDir, rel), 'utf8');

describe('additional sections are wired into every listed page', () => {
  for (const id of Object.keys(SECTION_PAGES) as (keyof typeof SECTION_PAGES)[]) {
    it(`${id}: public page renders them and admin page edits them`, () => {
      const { publicFile, adminFile } = WIRING[id];
      expect(read(publicFile)).toContain(`<PageSections pageId="${id}" />`);
      expect(read(adminFile)).toContain(`<PageSectionsCard pageId="${id}" />`);
    });
  }
});
