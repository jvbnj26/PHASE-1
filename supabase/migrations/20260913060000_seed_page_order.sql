-- Seeds the initial top-level nav order so it exists in the DB from day one, matching the
-- hardcoded order Header.tsx used before this feature (see src/data/navigation.ts /
-- defaultPageOrder in siteContent.ts). Reordering in Admin > Pages > Site Navigation Order
-- overwrites this row; nothing changes for visitors until an admin actually reorders.

insert into public.site_settings (key, value) values
('pageOrder', $j$[
  "/", "/about", "/events", "/activities", "/blog",
  "/calendar", "/photos", "/spiritual-guidance", "/get-involved", "/contact"
]$j$::jsonb)

on conflict (key) do nothing;
