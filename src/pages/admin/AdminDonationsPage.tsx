import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Heart, Save, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDonationsPage() {
  const { donationContent, setDonationContent } = useSiteContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(donationContent);

  const handleSave = () => {
    setDonationContent(editForm);
    setIsEditing(false);
    toast.success('Donation content saved');
  };

  const handleCancel = () => {
    setEditForm(donationContent);
    setIsEditing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Donations Page</h1>
            <p className="text-muted-foreground mt-2">
              Manage donation information and payment methods
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
                <Heart className="w-5 h-5 text-primary" />
                Introduction Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Introduction (shown at top of page)</Label>
                  <Textarea
                    value={editForm.intro}
                    onChange={(e) => setEditForm({ ...editForm, intro: e.target.value })}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">Use double line breaks to create paragraphs</p>
                </div>
              ) : (
                <div className="prose prose-sm text-muted-foreground">
                  {donationContent.intro.split('\n\n').map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pledge Info */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Fund Raising Pledge Info</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Pledge Information</Label>
                  <Textarea
                    value={editForm.pledgeInfo}
                    onChange={(e) => setEditForm({ ...editForm, pledgeInfo: e.target.value })}
                    rows={4}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">{donationContent.pledgeInfo}</p>
              )}
            </CardContent>
          </Card>

          {/* Tax Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Exemption Notice</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Tax Information</Label>
                  <Textarea
                    value={editForm.taxInfo}
                    onChange={(e) => setEditForm({ ...editForm, taxInfo: e.target.value })}
                    rows={2}
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">{donationContent.taxInfo}</p>
              )}
            </CardContent>
          </Card>

          {/* Donation Methods - Read Only Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {donationContent.donationMethods.map((method, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">{method.title}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    {method.details && (
                      <p className="text-xs text-muted-foreground mt-2">{method.details}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Note: Donation method cards are styled automatically. To add payment integrations, enable Lovable Cloud.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
