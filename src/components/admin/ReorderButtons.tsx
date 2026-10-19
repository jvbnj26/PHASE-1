import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';

/** Up / down arrows for moving an item within an admin list. */
export default function ReorderButtons({
  index,
  count,
  onMove,
  label = 'item',
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  label?: string;
}) {
  return (
    <div className="flex shrink-0">
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}>
        <ArrowUp className="w-4 h-4" />
      </Button>
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move ${label} down`}>
        <ArrowDown className="w-4 h-4" />
      </Button>
    </div>
  );
}
