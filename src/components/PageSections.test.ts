import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECTION_PAGES } from '@/data/siteContent';
import { PAGE_CONTENT, sectionDefs, type ContentPage } from '@/data/pageContent';

const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel: string) => fs.readFileSync(path.join(srcDir, rel), 'utf8');

// Where each page's editable text is shown, and where admins edit it.
const FILES: Record<ContentPage, { publicFiles: string[]; adminFile: string }> = {
  home: { publicFiles: ['pages/HomePage.tsx'], adminFile: 'pages/admin/AdminHomePage.tsx' },
  about: { publicFiles: ['pages/AboutPage.tsx'], adminFile: 'pages/admin/AdminAboutPage.tsx' },
  donate: { publicFiles: ['pages/DonatePage.tsx'], adminFile: 'pages/admin/AdminDonationsPage.tsx' },
  activities: { publicFiles: ['pages/ActivitiesPage.tsx'], adminFile: 'pages/admin/AdminActivitiesPage.tsx' },
  gyanshala: { publicFiles: ['pages/GyanshalaPage.tsx'], adminFile: 'pages/admin/AdminGyanshalaPage.tsx' },
  'spiritual-guidance': { publicFiles: ['pages/SpiritualGuidancePage.tsx'], adminFile: 'pages/admin/AdminSpiritualGuidancePage.tsx' },
  volunteer: { publicFiles: ['pages/VolunteerPage.tsx'], adminFile: 'pages/admin/AdminVolunteerPage.tsx' },
  contact: { publicFiles: ['pages/ContactPage.tsx'], adminFile: 'pages/admin/AdminContactPage.tsx' },
  events: { publicFiles: ['pages/EventsPage.tsx'], adminFile: 'pages/admin/AdminEventsPage.tsx' },
  photos: { publicFiles: ['pages/PhotosPage.tsx'], adminFile: 'pages/admin/AdminPhotosPage.tsx' },
  calendar: { publicFiles: ['pages/CalendarPage.tsx'], adminFile: 'pages/admin/AdminSettingsPage.tsx' },
  leadership: { publicFiles: ['pages/LeadershipPage.tsx'], adminFile: 'pages/admin/AdminBoardPage.tsx' },
  blog: { publicFiles: ['pages/BlogPage.tsx'], adminFile: 'pages/admin/AdminBlogPage.tsx' },
  site: {
    publicFiles: ['components/layout/Header.tsx', 'components/layout/Footer.tsx', 'components/SocialLinks.tsx'],
    adminFile: 'pages/admin/AdminSettingsPage.tsx',
  },
};

describe('section order and Additional Sections are wired into every listed page', () => {
  for (const id of Object.keys(SECTION_PAGES) as (keyof typeof SECTION_PAGES)[]) {
    it(`${id}: public page orders its sections and admin page edits order + sections`, () => {
      const { publicFiles, adminFile } = FILES[id];
      expect(read(publicFiles[0])).toContain(`<OrderedSections\n`.trim());
      expect(read(publicFiles[0])).toMatch(new RegExp(`pageId="${id}"`));
      expect(read(adminFile)).toContain(`<PageLayoutCard pageId="${id}" />`);
      expect(read(adminFile)).toContain(`<PageSectionsCard pageId="${id}" />`);
    });
  }
});

describe('every editable text field is shown on its page and editable in admin', () => {
  for (const page of Object.keys(PAGE_CONTENT) as ContentPage[]) {
    const { publicFiles, adminFile } = FILES[page];
    const publicSrc = publicFiles.map(read).join('\n');
    const adminSrc = read(adminFile);
    for (const [sectionId, section] of sectionDefs(page)) {
      const keys = Object.keys(section.fields);
      if (keys.length === 0) continue;
      it(`${page}.${sectionId}`, () => {
        for (const key of keys) expect(publicSrc, `${page}.${key} is never displayed`).toContain(`'${key}'`);
        expect(adminSrc).toMatch(new RegExp(`page="${page}"\\s+section="${sectionId}"`));
      });
    }
  }
});
