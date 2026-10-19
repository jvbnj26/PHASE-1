import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { HandHeart, Plus, Trash2, Save, X, Heart, GraduationCap, Megaphone } from 'lucide-react';
import { VolunteerSection } from '@/data/siteContent';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import RichText from '@/components/RichText';
import { toRichHtml } from '@/lib/richText';
import PageSectionsCard from '@/components/admin/PageSectionsCard';
import ReorderButtons from '@/components/admin/ReorderButtons';
import { moveItem } from '@/lib/reorder';
import { PageTextCard } from '@/components/admin/PageTextFields';
import PageLayoutCard from '@/components/admin/PageLayoutCard';

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

        <PageLayoutCard pageId="volunteer" />
        <PageTextCard page="volunteer" section="hero" description="The colored title banner at the top of the page." />
        <PageTextCard
          page="volunteer"
          section="opportunities"
          title="Volunteer Opportunities — card link"
          description="The link shown at the bottom of every opportunity card. The opportunities themselves are below."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volunteerSections.map((section, index) => (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ReorderButtons
                      index={index}
                      count={volunteerSections.length}
                      label="card"
                      onMove={(dir) => setVolunteerSections(moveItem(volunteerSections, index, dir))}
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
                      <RichTextEditor
                        value={toRichHtml(editForm.description)}
                        onChange={(html) => setEditForm((f) => (f ? { ...f, description: html } : f))}
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
                    <RichText value={section.description} className="text-sm text-muted-foreground" />
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

        <PageTextCard page="volunteer" section="cta" title="Call-to-Action & Social (bottom of page)" description="Social media links themselves are in Settings." />

        <PageSectionsCard pageId="volunteer" />
      </div>
    </AdminLayout>
  );
}
