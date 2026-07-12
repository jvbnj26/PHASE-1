-- Seed default programs into site_settings
insert into public.site_settings (key, value)
values (
  'programs',
  '[
    {"id":"1","name":"Coordinator","description":"Program and event coordination","active":true},
    {"id":"2","name":"Teacher","description":"Teaching and instruction in classes","active":true},
    {"id":"3","name":"MC","description":"Master of Ceremonies for events","active":true}
  ]'::jsonb
)
on conflict (key) do nothing;
