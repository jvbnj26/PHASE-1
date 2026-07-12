import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, Trash2, Save, GripVertical, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { usePrograms, Program } from '@/hooks/usePrograms';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function AdminProgramsPage() {
  const { programs, isLoading, savePrograms, isSaving } = usePrograms();
  const [draft, setDraft] = useState<Program[] | null>(null);

  const working = draft ?? programs;

  const update = (id: string, patch: Partial<Program>) =>
    setDraft(working.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const add = () =>
    setDraft([
      ...working,
      { id: generateId(), name: '', description: '', active: true },
    ]);

  const remove = (id: string) => setDraft(working.filter((p) => p.id !== id));

  const handleSave = async () => {
    const toSave = working.filter((p) => p.name.trim().length > 0);
    if (toSave.length === 0) {
      toast.error('Add at least one program before saving');
      return;
    }
    try {
      await savePrograms(toSave);
      setDraft(null);
      toast.success('Programs saved');
    } catch {
      toast.error('Failed to save programs');
    }
  };

  const isDirty = draft !== null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Programs</h1>
            <p className="text-muted-foreground mt-2">
              Manage the programs and roles members can select during signup.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={add} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Program
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Program List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading…</p>
            ) : working.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No programs yet. Click "Add Program" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {working.map((prog) => (
                  <div
                    key={prog.id}
                    className="flex items-start gap-3 p-4 border rounded-lg bg-card"
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-2 shrink-0" />

                    <div className="flex-1 grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Program name</Label>
                        <Input
                          value={prog.name}
                          onChange={(e) => update(prog.id, { name: e.target.value })}
                          placeholder="e.g. Coordinator"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                        <Input
                          value={prog.description}
                          onChange={(e) => update(prog.id, { description: e.target.value })}
                          placeholder="Brief description"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => update(prog.id, { active: !prog.active })}
                        title={prog.active ? 'Hide from signup' : 'Show in signup'}
                        className="gap-1.5 text-xs"
                      >
                        {prog.active ? (
                          <><Eye className="w-4 h-4 text-secondary" /> Active</>
                        ) : (
                          <><EyeOff className="w-4 h-4 text-muted-foreground" /> Hidden</>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(prog.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How this works</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Active programs appear as checkboxes in Step 5 (Program Enrollment) of the member signup wizard.</li>
                <li>Hidden programs are preserved in records but won't appear for new signups.</li>
                <li>Deleting a program does not affect existing member records that selected it.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
