import { useRef } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  onUploaded: (dataUrl: string) => void;
  label?: string;
  iconOnly?: boolean;
  disabled?: boolean;
}

/**
 * Universal image uploader for the admin UI.
 * Reads a picked file as a base64 data URL and hands it back via `onUploaded`.
 * Parent is responsible for persisting the URL to state/DB.
 */
export function ImageUploadButton({ onUploaded, label = 'Upload image', iconOnly, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  const handlePick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is larger than 5MB — please choose a smaller file');
      return;
    }
    busyRef.current = true;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      onUploaded(dataUrl);
      toast.success('Image uploaded — remember to Save to persist changes');
    } catch (err: any) {
      toast.error('Could not read image: ' + (err?.message || 'unknown error'));
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {iconOnly ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handlePick}
          disabled={disabled}
          title={label}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handlePick}
          disabled={disabled}
          className="gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          {label}
        </Button>
      )}
    </>
  );
}
