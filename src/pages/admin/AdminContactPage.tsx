import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { MapPin, Save, Edit2, Plus, Trash2, Building2, Globe } from 'lucide-react';
import { SatelliteCenter } from '@/data/siteContent';
import { toast } from 'sonner';

export default function AdminContactPage() {
  const { contactInfo, setContactInfo, satelliteCenters, setSatelliteCenters } = useSiteContent();
  const [isEditingMain, setIsEditingMain] = useState(false);
  const [mainForm, setMainForm] = useState(contactInfo);
  const [editingCenterId, setEditingCenterId] = useState<string | null>(null);
  const [centerForm, setCenterForm] = useState<SatelliteCenter | null>(null);

  const handleSaveMain = () => {
    setContactInfo(mainForm);
    setIsEditingMain(false);
    toast.success('Contact information saved');
  };

  const handleCancelMain = () => {
    setMainForm(contactInfo);
    setIsEditingMain(false);
  };

  const handleAddCenter = () => {
    const newCenter: SatelliteCenter = {
      id: Date.now().toString(),
      city: 'City',
      state: 'State',
      name: 'Center Name',
      street: 'Street Address',
      phone: 'Phone Number',
      email: ['email@example.com'],
      website: 'www.example.com',
    };
    setSatelliteCenters([...satelliteCenters, newCenter]);
    setEditingCenterId(newCenter.id);
    setCenterForm(newCenter);
    toast.success('New satellite center added');
  };

  const handleEditCenter = (center: SatelliteCenter) => {
    setEditingCenterId(center.id);
    setCenterForm({ ...center });
  };

  const handleSaveCenter = () => {
    if (centerForm) {
      setSatelliteCenters(satelliteCenters.map(c => c.id === centerForm.id ? centerForm : c));
      setEditingCenterId(null);
      setCenterForm(null);
      toast.success('Satellite center saved');
    }
  };

  const handleDeleteCenter = (id: string) => {
    setSatelliteCenters(satelliteCenters.filter(c => c.id !== id));
    toast.success('Satellite center removed');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Contact Page</h1>
          <p className="text-muted-foreground mt-2">
            Manage contact information, locations, and satellite centers
          </p>
        </div>

        {/* Main Contact Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Samaniji & Mailing Address
              </CardTitle>
              {!isEditingMain ? (
                <Button size="sm" variant="outline" onClick={() => setIsEditingMain(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveMain}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelMain}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingMain ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input
                      value={mainForm.mailingAddress.name}
                      onChange={(e) => setMainForm({
                        ...mainForm,
                        mailingAddress: { ...mainForm.mailingAddress, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Street</Label>
                    <Input
                      value={mainForm.mailingAddress.street}
                      onChange={(e) => setMainForm({
                        ...mainForm,
                        mailingAddress: { ...mainForm.mailingAddress, street: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={mainForm.mailingAddress.city}
                        onChange={(e) => setMainForm({
                          ...mainForm,
                          mailingAddress: { ...mainForm.mailingAddress, city: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={mainForm.mailingAddress.state}
                        onChange={(e) => setMainForm({
                          ...mainForm,
                          mailingAddress: { ...mainForm.mailingAddress, state: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zip</Label>
                      <Input
                        value={mainForm.mailingAddress.zip}
                        onChange={(e) => setMainForm({
                          ...mainForm,
                          mailingAddress: { ...mainForm.mailingAddress, zip: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Numbers (comma-separated)</Label>
                    <Input
                      value={mainForm.mailingAddress.phone.join(', ')}
                      onChange={(e) => setMainForm({
                        ...mainForm,
                        mailingAddress: { ...mainForm.mailingAddress, phone: e.target.value.split(',').map(p => p.trim()) }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Emails (comma-separated)</Label>
                    <Input
                      value={mainForm.mailingAddress.email.join(', ')}
                      onChange={(e) => setMainForm({
                        ...mainForm,
                        mailingAddress: { ...mainForm.mailingAddress, email: e.target.value.split(',').map(p => p.trim()) }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hours / Location Info</Label>
                    <Textarea
                      value={mainForm.hours}
                      onChange={(e) => setMainForm({ ...mainForm, hours: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events Address - Name</Label>
                    <Input
                      value={mainForm.eventsAddress.name}
                      onChange={(e) => setMainForm({
                        ...mainForm,
                        eventsAddress: { ...mainForm.eventsAddress, name: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Events Address - Street</Label>
                    <Input
                      value={mainForm.eventsAddress.street}
                      onChange={(e) => setMainForm({
                        ...mainForm,
                        eventsAddress: { ...mainForm.eventsAddress, street: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={mainForm.eventsAddress.city}
                        onChange={(e) => setMainForm({
                          ...mainForm,
                          eventsAddress: { ...mainForm.eventsAddress, city: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={mainForm.eventsAddress.state}
                        onChange={(e) => setMainForm({
                          ...mainForm,
                          eventsAddress: { ...mainForm.eventsAddress, state: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Zip</Label>
                      <Input
                        value={mainForm.eventsAddress.zip}
                        onChange={(e) => setMainForm({
                          ...mainForm,
                          eventsAddress: { ...mainForm.eventsAddress, zip: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{contactInfo.mailingAddress.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    {contactInfo.mailingAddress.street}<br />
                    {contactInfo.mailingAddress.city}, {contactInfo.mailingAddress.state} {contactInfo.mailingAddress.zip}
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Ph: {contactInfo.mailingAddress.phone.join(', ')}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Email: {contactInfo.mailingAddress.email.join(', ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Events Address</h4>
                  <p className="text-muted-foreground text-sm">
                    {contactInfo.eventsAddress.name}<br />
                    {contactInfo.eventsAddress.street}<br />
                    {contactInfo.eventsAddress.city}, {contactInfo.eventsAddress.state} {contactInfo.eventsAddress.zip}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Satellite Centers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Parent Organization & Satellite Centers
              </CardTitle>
              <Button size="sm" onClick={handleAddCenter} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Center
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {satelliteCenters.map((center) => (
                <div key={center.id} className="bg-muted/50 rounded-lg p-4">
                  {editingCenterId === center.id && centerForm ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={centerForm.city}
                          onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                          placeholder="City"
                        />
                        <Input
                          value={centerForm.state}
                          onChange={(e) => setCenterForm({ ...centerForm, state: e.target.value })}
                          placeholder="State"
                        />
                      </div>
                      <Input
                        value={centerForm.name}
                        onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                        placeholder="Organization Name"
                      />
                      <Input
                        value={centerForm.street}
                        onChange={(e) => setCenterForm({ ...centerForm, street: e.target.value })}
                        placeholder="Address"
                      />
                      <Input
                        value={centerForm.phone}
                        onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                        placeholder="Phone"
                      />
                      <Input
                        value={centerForm.email.join(', ')}
                        onChange={(e) => setCenterForm({ ...centerForm, email: e.target.value.split(',').map(e => e.trim()) })}
                        placeholder="Emails (comma-separated)"
                      />
                      <Input
                        value={centerForm.website}
                        onChange={(e) => setCenterForm({ ...centerForm, website: e.target.value })}
                        placeholder="Website"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveCenter} className="flex-1">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCenterId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">{center.city}, {center.state}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEditCenter(center)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDeleteCenter(center.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{center.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{center.street}</p>
                      <p className="text-xs text-muted-foreground">Ph: {center.phone}</p>
                      <p className="text-xs text-secondary mt-1">{center.website}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
