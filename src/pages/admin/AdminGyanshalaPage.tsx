import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { BookOpen, Save, Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import RichText from '@/components/RichText';
import { toRichHtml } from '@/lib/richText';
import PageSectionsCard from '@/components/admin/PageSectionsCard';

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
    setEditForm((f) => {
      const updated = [...f.pillars];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, pillars: updated };
    });
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
                  <RichTextEditor
                    value={toRichHtml(editForm.intro)}
                    onChange={(html) => setEditForm((f) => ({ ...f, intro: html }))}
                  />
                </div>
              ) : (
                <RichText value={gyanshalaContent.intro} className="text-sm text-muted-foreground" />
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
                        <RichTextEditor
                          value={toRichHtml(pillar.description)}
                          onChange={(html) => handlePillarChange(idx, 'description', html)}
                          placeholder="Pillar description..."
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-foreground mb-2">{pillar.title}</h4>
                        <RichText value={pillar.description} className="text-sm text-muted-foreground" />
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
                    <RichTextEditor
                      value={toRichHtml(editForm.ctaText)}
                      onChange={(html) => setEditForm((f) => ({ ...f, ctaText: html }))}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{gyanshalaContent.ctaTitle}</h4>
                  <RichText value={gyanshalaContent.ctaText} className="text-sm text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <PageSectionsCard pageId="gyanshala" />
      </div>
    </AdminLayout>
  );
}
