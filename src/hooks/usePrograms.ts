import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Program {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

const DEFAULT_PROGRAMS: Program[] = [
  { id: '1', name: 'Coordinator', description: 'Program and event coordination', active: true },
  { id: '2', name: 'Teacher', description: 'Teaching and instruction in classes', active: true },
  { id: '3', name: 'MC', description: 'Master of Ceremonies for events', active: true },
];

export function usePrograms() {
  const queryClient = useQueryClient();

  const { data: programs = DEFAULT_PROGRAMS, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'programs')
        .maybeSingle();
      if (error) throw error;
      return (data?.value as Program[]) ?? DEFAULT_PROGRAMS;
    },
  });

  const { mutateAsync: savePrograms, isPending: isSaving } = useMutation({
    mutationFn: async (next: Program[]) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'programs', value: next as any, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });

  return { programs, isLoading, savePrograms, isSaving };
}
