import { useSiteContent } from '@/contexts/SiteContentContext';
import { findField, type ContentPage, type FieldKey } from '@/data/pageContent';
import { resolvePageText, isFieldEmpty } from '@/lib/pageContent';

/**
 * Editable fixed text for a built-in page (see src/data/pageContent.ts).
 * `t(field)` is the text to show; `has(field)` is false when the admin emptied it (= hide it).
 */
export function usePageText<P extends ContentPage>(page: P) {
  const { pageText } = useSiteContent();
  const t = (field: FieldKey<P>) => resolvePageText(pageText, page, field);
  const has = (field: FieldKey<P>) => !isFieldEmpty(t(field), findField(page, field)?.kind);
  return { t, has };
}
