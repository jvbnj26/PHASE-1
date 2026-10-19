import { supabase } from '@/integrations/supabase/client';

export const MAX_SITE_IMAGE_BYTES = 5 * 1024 * 1024;

// Uploads an admin-picked image to the existing public `event-images` bucket (admin-only writes)
// under `folder/`, and returns its public URL. Only the URL is stored in site_settings — which
// every visitor loads on every page — so images never bloat that payload.
export async function uploadSiteImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
  if (file.size > MAX_SITE_IMAGE_BYTES) throw new Error('Images must be under 5MB.');
  const ext = file.name.includes('.') ? file.name.split('.').pop() : (file.type.split('/')[1] || 'bin');
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('event-images').upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('event-images').getPublicUrl(path);
  return data.publicUrl;
}
