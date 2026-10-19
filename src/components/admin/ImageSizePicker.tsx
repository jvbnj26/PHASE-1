import { DEFAULT_SIZE_LABELS, IMAGE_SIZES, type ImageSize } from '@/lib/imageSize';

/** Small / Medium / Large / Full width buttons for an image's display size. */
export default function ImageSizePicker({
  value,
  onChange,
  labels = DEFAULT_SIZE_LABELS,
  id,
}: {
  value: ImageSize;
  onChange: (size: ImageSize) => void;
  labels?: Record<ImageSize, string>;
  id?: string;
}) {
  return (
    <div id={id} role="radiogroup" aria-label="Image size" className="inline-flex flex-wrap rounded-md border bg-background p-0.5">
      {IMAGE_SIZES.map((size) => (
        <button
          key={size}
          type="button"
          role="radio"
          aria-checked={value === size}
          onClick={() => onChange(size)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            value === size ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {labels[size]}
        </button>
      ))}
    </div>
  );
}
