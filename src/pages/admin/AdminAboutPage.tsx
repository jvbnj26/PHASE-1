import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { FileText, Save, Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAboutPage() {
  const { aboutContent, setAboutContent } = useSiteContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(aboutContent);

  const handleSave = () => {
    setAboutContent(editForm);
    setIsEditing(false);
    toast.success('About content saved');
  };

  const handleCancel = () => {
    setEditForm(aboutContent);
    setIsEditing(false);
  };

  const handleAddProgramSection = () => {
    setEditForm({
      ...editForm,
      programSections: [
        ...editForm.programSections,
        { title: 'New Section', content: 'Section content...' }
      ]
    });
  };

  const handleRemoveProgramSection = (index: number) => {
    setEditForm({
      ...editForm,
      programSections: editForm.programSections.filter((_, i) => i !== index)
    });
  };

  const handleProgramSectionChange = (index: number, field: 'title' | 'content', value: string) => {
    const updated = [...editForm.programSections];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm({ ...editForm, programSections: updated });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">About Us Page</h1>
            <p className="text-muted-foreground mt-2">
              Manage the About Us page content (Board & EC are in their own section)
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Content
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Introduction Text</Label>
                  <Textarea
                    value={editForm.intro}
                    onChange={(e) => setEditForm({ ...editForm, intro: e.target.value })}
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">Use double line breaks to create paragraphs</p>
                </div>
              ) : (
                <div className="prose prose-sm text-muted-foreground max-w-none">
                  {aboutContent.intro.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle>Mission Statement</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Mission</Label>
                  <Textarea
                    value={editForm.mission}
                    onChange={(e) => setEditForm({ ...editForm, mission: e.target.value })}
                    rows={4}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">{aboutContent.mission}</p>
              )}
            </CardContent>
          </Card>

          {/* Programs Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>Programs Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Programs Introduction Text</Label>
                  <Textarea
                    value={editForm.programs}
                    onChange={(e) => setEditForm({ ...editForm, programs: e.target.value })}
                    rows={2}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">{aboutContent.programs}</p>
              )}
            </CardContent>
          </Card>

          {/* Program Sections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Program Sections</CardTitle>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={handleAddProgramSection} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Section
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isEditing ? editForm : aboutContent).programSections.map((section, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={section.title}
                            onChange={(e) => handleProgramSectionChange(idx, 'title', e.target.value)}
                            placeholder="Section Title"
                            className="font-semibold"
                          />
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleRemoveProgramSection(idx)}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={section.content}
                          onChange={(e) => handleProgramSectionChange(idx, 'content', e.target.value)}
                          rows={4}
                          placeholder="Section content..."
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-foreground mb-2">{section.title}</h4>
                        <p className="text-sm text-muted-foreground">{section.content}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
