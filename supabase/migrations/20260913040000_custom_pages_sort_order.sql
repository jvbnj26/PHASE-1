-- Custom pages had no explicit ordering — they always rendered (and appeared in the public
-- nav dropdown, see Header.tsx's customNav) sorted by created_at, with no way for an admin to
-- change that. Adds a per-sibling-group sort position so pages can be reordered in Admin > Pages.
--
-- "Sibling group" = same parent_slug (top-level pages order among themselves; each page's
-- sub-pages order among themselves, independent of their parent's position).

ALTER TABLE public.custom_pages ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Backfill existing rows: preserve current (created_at) order as the initial sort_order,
-- scoped per parent_slug so top-level pages and each parent's sub-pages are numbered
-- independently starting at 0.
WITH ranked AS (
  SELECT id, row_number() OVER (
    PARTITION BY parent_slug ORDER BY created_at ASC
  ) - 1 AS rn
  FROM public.custom_pages
)
UPDATE public.custom_pages cp
SET sort_order = ranked.rn
FROM ranked
WHERE cp.id = ranked.id;

CREATE INDEX IF NOT EXISTS custom_pages_sort_order_idx ON public.custom_pages(parent_slug, sort_order);
