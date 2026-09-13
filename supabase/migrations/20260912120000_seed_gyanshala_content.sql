-- Gyanshala was originally shipped as a hardcoded page (src/pages/GyanshalaPage.tsx) wired
-- directly into App.tsx, bypassing the CMS entirely. That meant it had no admin editor and
-- never appeared in Admin > Pages, so it looked "baked in" and impossible to edit after the
-- site was revamped. Gyanshala is now a built-in page backed by site_settings (same pattern
-- as aboutContent, donationContent, etc.) with its own editor at /admin/gyanshala.
--
-- This seeds the DB with the exact copy the hardcoded page used to render, so publishing this
-- migration doesn't change anything visitors see. `on conflict do nothing` matches the seeding
-- convention in 20260710120000_site_settings.sql — safe to run even if a row already exists.

insert into public.site_settings (key, value) values
('gyanshalaContent', $j${
  "intro": "Gyanshala meets regularly at the JVBNA Center, where children learn Jain philosophy, Preksha Meditation fundamentals, and the values that guide a nonviolent, compassionate life — taught in an age-appropriate, engaging way alongside their peers in the community.",
  "pillars": [
    {
      "title": "Jain Philosophy",
      "description": "Age-appropriate lessons on Jain principles, stories, and scripture that build a lasting foundation of understanding."
    },
    {
      "title": "Science of Living",
      "description": "Practical values — nonviolence, self-restraint, and compassion — taught through discussion and everyday practice."
    },
    {
      "title": "Community & Culture",
      "description": "Festivals, group activities, and mentorship that connect children to the JVBNA community and to each other."
    }
  ],
  "ctaTitle": "Enroll Your Child",
  "ctaText": "Sign up as a member and select Gyanshala during registration, or reach out to the office directly."
}$j$::jsonb)

on conflict (key) do nothing;
