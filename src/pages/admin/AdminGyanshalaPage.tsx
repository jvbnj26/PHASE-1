import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { BookOpen, Save, Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminGyanshalaPage() {
  const { gyanshalaContent, setGyanshalaContent } = useSiteContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(gyanshalaContent);

  const handleSave = () => {
    setGyanshalaContent(editForm);
    setIsEditing(false);
    toast.success('Gyanshala content saved');
  };

  const handleCancel = () => {
    setEditForm(gyanshalaContent);
    setIsEditing(false);
  };

  const handleAddPillar = () => {
    setEditForm({
      ...editForm,
      pillars: [...editForm.pillars, { title: 'New Pillar', description: 'Pillar description...' }],
    });
  };

  const handleRemovePillar = (index: number) => {
    setEditForm({
      ...editForm,
      pillars: editForm.pillars.filter((_, i) => i !== index),
    });
  };

  const handlePillarChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...editForm.pillars];
    updated[index] = { ...updated[index], [field]: value };
    setEditForm({ ...editForm, pillars: updated });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Gyanshala Page</h1>
            <p className="text-muted-foreground mt-2">
              Manage the Gyanshala page content. Coordinators are pulled automatically from Board &amp; EC Members
              whose role includes "Gyanshala" — edit those in <span className="font-medium">Board &amp; EC Members</span>.
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => { setEditForm(gyanshalaContent); setIsEditing(true); }} className="gap-2">
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
                <BookOpen className="w-5 h-5 text-primary" />
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
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">Use double line breaks to create paragraphs</p>
                </div>
              ) : (
                <div className="prose prose-sm text-muted-foreground max-w-none">
                  {gyanshalaContent.intro.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pillars */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pillars</CardTitle>
                {isEditing && (
                  <Button size="sm" variant="outline" onClick={handleAddPillar} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Pillar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(isEditing ? editForm : gyanshalaContent).pillars.map((pillar, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={pillar.title}
                            onChange={(e) => handlePillarChange(idx, 'title', e.target.value)}
                            placeholder="Pillar Title"
                            className="font-semibold"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemovePillar(idx)}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={pillar.description}
                          onChange={(e) => handlePillarChange(idx, 'description', e.target.value)}
                          rows={3}
                          placeholder="Pillar description..."
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-foreground mb-2">{pillar.title}</h4>
                        <p className="text-sm text-muted-foreground">{pillar.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Call-to-Action</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Heading</Label>
                    <Input
                      value={editForm.ctaTitle}
                      onChange={(e) => setEditForm({ ...editForm, ctaTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Text</Label>
                    <Textarea
                      value={editForm.ctaText}
                      onChange={(e) => setEditForm({ ...editForm, ctaText: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{gyanshalaContent.ctaTitle}</h4>
                  <p className="text-sm text-muted-foreground">{gyanshalaContent.ctaText}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
