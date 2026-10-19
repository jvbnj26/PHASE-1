import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Megaphone, Plus, Trash2, Save, X } from 'lucide-react';
import { Activity } from '@/data/siteContent';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import RichText from '@/components/RichText';
import { toRichHtml } from '@/lib/richText';
import PageSectionsCard from '@/components/admin/PageSectionsCard';
import ReorderButtons from '@/components/admin/ReorderButtons';
import { moveItem } from '@/lib/reorder';
import { PageTextCard } from '@/components/admin/PageTextFields';
import PageLayoutCard from '@/components/admin/PageLayoutCard';

export default function AdminActivitiesPage() {
  const { activities, setActivities } = useSiteContent();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Activity | null>(null);

  const handleAdd = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      title: 'New Activity',
      description: 'Activity description',
      items: [],
      dates: '',
      zoomLink: '',
    };
    setActivities([...activities, newActivity]);
    setEditingId(newActivity.id);
    setEditForm(newActivity);
    toast.success('New activity added');
  };

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setEditForm({ ...activity });
  };

  const handleSave = () => {
    if (editForm) {
      setActivities(activities.map(a => a.id === editForm.id ? editForm : a));
      setEditingId(null);
      setEditForm(null);
      toast.success('Activity saved');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    toast.success('Activity deleted');
  };

  const handleItemsChange = (value: string) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        items: value.split('\n').filter(item => item.trim() !== '')
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Activities</h1>
            <p className="text-muted-foreground mt-2">
              Manage ongoing and upcoming activities
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        </div>

        <PageLayoutCard pageId="activities" />
        <PageTextCard page="activities" section="hero" description="The colored title banner at the top of the page." />
        <PageTextCard page="activities" section="intro" title="Who It's For (two boxes under the banner)" />
        <PageTextCard
          page="activities"
          section="ongoing"
          title="Ongoing Activities — section text"
          description="The heading above the activity cards, and labels used on every card. The activities themselves are below."
        />

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <Card key={activity.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ReorderButtons
                      index={index}
                      count={activities.length}
                      label="activity"
                      onMove={(dir) => setActivities(moveItem(activities, index, dir))}
                    />
                    <Megaphone className="w-5 h-5 text-primary" />
                    {editingId === activity.id ? (
                      <Input
                        value={editForm?.title || ''}
                        onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
                        className="font-semibold"
                      />
                    ) : (
                      <CardTitle className="text-lg">{activity.title}</CardTitle>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === activity.id ? (
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
                        <Button size="sm" variant="outline" onClick={() => handleEdit(activity)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(activity.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              {editingId === activity.id && editForm && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <RichTextEditor
                      value={toRichHtml(editForm.description)}
                      onChange={(html) => setEditForm((f) => (f ? { ...f, description: html } : f))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sub-items (one per line)</Label>
                    <Textarea
                      value={editForm.items.join('\n')}
                      onChange={(e) => handleItemsChange(e.target.value)}
                      rows={4}
                      placeholder="e.g.&#10;Preksha Meditation&#10;Yoga&#10;Pranayam"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dates (optional)</Label>
                      <Input
                        value={editForm.dates || ''}
                        onChange={(e) => setEditForm({ ...editForm, dates: e.target.value })}
                        placeholder="e.g. Every Saturday 10am"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zoom Link (optional)</Label>
                      <Input
                        value={editForm.zoomLink || ''}
                        onChange={(e) => setEditForm({ ...editForm, zoomLink: e.target.value })}
                        placeholder="https://zoom.us/..."
                      />
                    </div>
                  </div>
                </CardContent>
              )}
              {editingId !== activity.id && (
                <CardContent>
                  <RichText value={activity.description} className="text-muted-foreground text-sm" />
                  {activity.items.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 ml-2">
                      {activity.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {activity.dates && (
                    <p className="text-xs text-primary mt-2">Dates: {activity.dates}</p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <PageTextCard page="activities" section="calendar" title="Calendar Banner (bottom of page)" />

        <PageSectionsCard pageId="activities" />
      </div>
    </AdminLayout>
  );
}
