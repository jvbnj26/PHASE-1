import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { HandHeart, Plus, Trash2, Save, X, Heart, GraduationCap, Megaphone } from 'lucide-react';
import { VolunteerSection } from '@/data/siteContent';
import { toast } from 'sonner';

const iconOptions = [
  { value: 'Heart', label: 'Heart', icon: Heart },
  { value: 'GraduationCap', label: 'Graduation Cap', icon: GraduationCap },
  { value: 'Megaphone', label: 'Megaphone', icon: Megaphone },
  { value: 'HandHeart', label: 'Hand Heart', icon: HandHeart },
];

export default function AdminVolunteerPage() {
  const { volunteerSections, setVolunteerSections } = useSiteContent();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<VolunteerSection | null>(null);

  const handleAdd = () => {
    const newSection: VolunteerSection = {
      id: Date.now().toString(),
      title: 'New Section',
      description: 'Section description',
      icon: 'Heart',
    };
    setVolunteerSections([...volunteerSections, newSection]);
    setEditingId(newSection.id);
    setEditForm(newSection);
    toast.success('New volunteer section added');
  };

  const handleEdit = (section: VolunteerSection) => {
    setEditingId(section.id);
    setEditForm({ ...section });
  };

  const handleSave = () => {
    if (editForm) {
      setVolunteerSections(volunteerSections.map(s => s.id === editForm.id ? editForm : s));
      setEditingId(null);
      setEditForm(null);
      toast.success('Volunteer section saved');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    setVolunteerSections(volunteerSections.filter(s => s.id !== id));
    toast.success('Volunteer section deleted');
  };

  const getIcon = (iconName: string) => {
    const option = iconOptions.find(o => o.value === iconName);
    const IconComponent = option?.icon || Heart;
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Volunteer Page</h1>
            <p className="text-muted-foreground mt-2">
              Manage volunteer opportunities and Get Involved sections
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Section
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteerSections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {getIcon(section.icon)}
                    </div>
                    {editingId === section.id ? (
                      <Input
                        value={editForm?.title || ''}
                        onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
                        className="font-semibold max-w-[150px]"
                      />
                    ) : (
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingId === section.id && editForm ? (
                  <>
                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select
                        value={editForm.icon}
                        onValueChange={(value) => setEditForm({ ...editForm, icon: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className="w-4 h-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} className="gap-1 flex-1">
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(section)} className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(section.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
