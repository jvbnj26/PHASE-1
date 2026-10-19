/** A copy of `items` with the item at `index` moved one place up (-1) or down (+1); unchanged at the ends. */
export function moveItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const j = index + dir;
  if (index < 0 || index >= items.length || j < 0 || j >= items.length) return items;
  const next = [...items];
  [next[index], next[j]] = [next[j], next[index]];
  return next;
}
