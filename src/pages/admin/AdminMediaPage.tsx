import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Upload, ExternalLink } from 'lucide-react';

export default function AdminMediaPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage images and media files
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Image Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                To upload and manage images, enable Lovable Cloud for file storage.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Currently, images can be added by providing URLs in the respective admin sections.
              </p>
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Learn About Cloud Storage
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">Current Image Sources</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Banner Images:</strong> Managed in Home Page settings</li>
                <li>• <strong>Spiritual Masters:</strong> Managed in Spiritual Guidance settings</li>
                <li>• <strong>Event Flyers:</strong> Managed in Events settings</li>
                <li>• <strong>Board Member Photos:</strong> Can be added via Board & EC settings</li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-primary mb-2">Tips for Images</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use image hosting services like Imgur, Cloudinary, or Google Drive</li>
                <li>• Ensure images are publicly accessible via URL</li>
                <li>• Recommended aspect ratios: 16:9 for banners, 4:5 for portraits</li>
                <li>• Optimize images for web (under 500KB recommended)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
