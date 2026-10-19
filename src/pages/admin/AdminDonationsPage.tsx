import { useRef, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { Heart, Save, Edit2, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import donorCategoriesImg from '@/assets/donor-categories.png';
import { uploadSiteImage } from '@/lib/siteImages';
import DonationMethodsEditor from '@/components/admin/DonationMethodsEditor';
import DonationMethodCard from '@/components/DonationMethodCard';
import { validateDonationMethods } from '@/lib/donationMethods';
import RichTextEditor from '@/components/admin/RichTextEditor';
import RichText from '@/components/RichText';
import { toRichHtml } from '@/lib/richText';
import PageSectionsCard from '@/components/admin/PageSectionsCard';
import PageTextFields, { PageTextCard } from '@/components/admin/PageTextFields';
import PageLayoutCard from '@/components/admin/PageLayoutCard';

export default function AdminDonationsPage() {
  const { donationContent, setDonationContent } = useSiteContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(donationContent);

  const donorImageInput = useRef<HTMLInputElement>(null);
  const [uploadingDonorImage, setUploadingDonorImage] = useState(false);

  const handleDonorImage = async (file: File | undefined) => {
    if (!file) return;
    setUploadingDonorImage(true);
    try {
      const url = await uploadSiteImage(file, 'page-images');
      setEditForm((f) => ({ ...f, donorCategoriesImage: url }));
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploadingDonorImage(false);
    }
  };

  const [uploadingMethodImage, setUploadingMethodImage] = useState(false);

  const handleSave = () => {
    const error = validateDonationMethods(editForm.paymentMethods);
    if (error) {
      toast.error(error);
      return;
    }
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
              Manage donation text, the donor categories image, and payment methods
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => { setEditForm(donationContent); setIsEditing(true); }} className="gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Content
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={uploadingDonorImage || uploadingMethodImage} className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        <PageLayoutCard pageId="donate" />
        <PageTextCard page="donate" section="hero" description="The colored title banner at the top of the page." />

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
              <PageTextFields page="donate" section="intro" className="mb-4" />
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Introduction (shown at top of page)</Label>
                  <RichTextEditor
                    value={toRichHtml(editForm.intro)}
                    onChange={(html) => setEditForm((f) => ({ ...f, intro: html }))}
                  />
                </div>
              ) : (
                <RichText value={donationContent.intro} className="text-sm text-muted-foreground" />
              )}
            </CardContent>
          </Card>

          {/* Pledge Info */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Fund Raising Pledge Info</CardTitle>
            </CardHeader>
            <CardContent>
              <PageTextFields page="donate" section="pledge" className="mb-4" />
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Pledge Information</Label>
                  <RichTextEditor
                    value={toRichHtml(editForm.pledgeInfo, { splitLines: true })}
                    onChange={(html) => setEditForm((f) => ({ ...f, pledgeInfo: html }))}
                  />
                </div>
              ) : (
                <RichText value={donationContent.pledgeInfo} splitLines className="text-muted-foreground [--rt-gap:0.5rem]" />
              )}
            </CardContent>
          </Card>

          {/* Donor Categories image */}
          <Card>
            <CardHeader>
              <CardTitle>Donor Categories Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PageTextFields page="donate" section="categories" className="mb-4" />
              <img
                src={(isEditing ? editForm : donationContent).donorCategoriesImage || donorCategoriesImg}
                alt="Donor categories"
                className="w-full max-w-2xl rounded-lg border object-contain bg-white"
              />
              {isEditing && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={donorImageInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { handleDonorImage(e.target.files?.[0]); e.target.value = ''; }}
                  />
                  <Button variant="outline" onClick={() => donorImageInput.current?.click()} disabled={uploadingDonorImage} className="gap-2">
                    {uploadingDonorImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                    {uploadingDonorImage ? 'Uploading…' : 'Replace image'}
                  </Button>
                  {editForm.donorCategoriesImage && (
                    <Button variant="ghost" onClick={() => setEditForm((f) => ({ ...f, donorCategoriesImage: '' }))}>
                      Use original image
                    </Button>
                  )}
                  <p className="w-full text-xs text-muted-foreground">Shown in the "Donor Categories" section of the Donate page. Up to 5MB. Click Save Changes to publish.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Exemption Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <PageTextFields page="donate" section="tax" className="mb-4" />
              {isEditing ? (
                <div className="space-y-2">
                  <Label>Tax Information</Label>
                  <RichTextEditor
                    value={toRichHtml(editForm.taxInfo)}
                    onChange={(html) => setEditForm((f) => ({ ...f, taxInfo: html }))}
                  />
                </div>
              ) : (
                <RichText value={donationContent.taxInfo} className="text-muted-foreground" />
              )}
            </CardContent>
          </Card>

          {/* How to Donate cards */}
          <Card>
            <CardHeader>
              <CardTitle>How to Donate — Donation Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <PageTextFields page="donate" section="methods" className="mb-4" />
              {isEditing ? (
                <DonationMethodsEditor
                  methods={editForm.paymentMethods}
                  onChange={(paymentMethods) => setEditForm((f) => ({ ...f, paymentMethods }))}
                  onUploadingChange={setUploadingMethodImage}
                />
              ) : (
                <div className="flex flex-wrap gap-4">
                  {donationContent.paymentMethods.map((method, idx, all) => (
                    <div key={method.id} className="w-full md:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)] flex">
                      <DonationMethodCard
                        method={method}
                        accent={all.slice(0, idx).filter((m) => !m.recommended).length % 2 === 1}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <PageTextCard page="donate" section="cta" title="Make a Difference (bottom banner)" />

        <PageSectionsCard pageId="donate" />
      </div>
    </AdminLayout>
  );
}
