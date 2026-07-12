import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { BookOpen, Plus, Trash2, Save, X, ImageIcon } from 'lucide-react';
import { ImageUploadButton } from '@/components/admin/ImageUploadButton';
import { SpiritualMaster } from '@/data/siteContent';
import { toast } from 'sonner';

export default function AdminSpiritualGuidancePage() {
  const { spiritualMasters, setSpiritualMasters } = useSiteContent();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SpiritualMaster | null>(null);

  const handleAdd = () => {
    const newMaster: SpiritualMaster = {
      id: Date.now().toString(),
      name: 'New Samani',
      imageUrl: '/placeholder.svg',
      description: 'Description of the spiritual master',
    };
    setSpiritualMasters([...spiritualMasters, newMaster]);
    setEditingId(newMaster.id);
    setEditForm(newMaster);
    toast.success('New spiritual master added');
  };

  const handleEdit = (master: SpiritualMaster) => {
    setEditingId(master.id);
    setEditForm({ ...master });
  };

  const handleSave = () => {
    if (editForm) {
      setSpiritualMasters(spiritualMasters.map(m => m.id === editForm.id ? editForm : m));
      setEditingId(null);
      setEditForm(null);
      toast.success('Spiritual master saved');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    setSpiritualMasters(spiritualMasters.filter(m => m.id !== id));
    toast.success('Spiritual master removed');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Spiritual Guidance</h1>
            <p className="text-muted-foreground mt-2">
              Manage spiritual masters and Samanijis
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Spiritual Master
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {spiritualMasters.map((master) => (
            <Card key={master.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {editingId === master.id ? (
                      <Input
                        value={editForm?.name || ''}
                        onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                        className="font-semibold"
                      />
                    ) : (
                      <CardTitle className="text-lg">{master.name}</CardTitle>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === master.id ? (
                      <>
                        <Button size="sm" onClick={handleSave} className="gap-1">
                          <Save className="w-4 h-4" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(master)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(master.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === master.id && editForm ? (
                  <>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={editForm.imageUrl}
                          onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                          placeholder="Image URL, key, or upload"
                        />
                        <ImageUploadButton
                          iconOnly
                          label="Upload image"
                          onUploaded={(url) => setEditForm({ ...editForm, imageUrl: url })}
                        />
                      </div>
                      {editForm.imageUrl && (editForm.imageUrl.startsWith('http') || editForm.imageUrl.startsWith('/') || editForm.imageUrl.startsWith('data:')) && (
                        <img src={editForm.imageUrl} alt="" className="mt-2 h-28 rounded border object-cover" />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload an image file, paste a URL, or use an image key like "samani-samatva-pragya".
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden max-w-[200px]">
                      <img
                        src={master.imageUrl.startsWith('http') || master.imageUrl.startsWith('/') ? master.imageUrl : '/placeholder.svg'}
                        alt={master.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{master.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
