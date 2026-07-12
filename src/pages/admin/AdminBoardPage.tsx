import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteContent } from '@/contexts/SiteContentContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminBoardPage() {
  const { isAuthenticated } = useAuth();
  const { 
    boardMembers, setBoardMembers,
    executiveCommittee, setExecutiveCommittee 
  } = useSiteContent();
  const { toast } = useToast();

  const [localBoard, setLocalBoard] = useState(boardMembers);
  const [localEC, setLocalEC] = useState(executiveCommittee);

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSaveBoard = () => {
    setBoardMembers(localBoard);
    toast({
      title: "Board Updated",
      description: "Board of Directors has been saved successfully.",
    });
  };

  const handleSaveEC = () => {
    setExecutiveCommittee(localEC);
    toast({
      title: "EC Updated",
      description: "Executive Committee has been saved successfully.",
    });
  };

  const addBoardMember = () => {
    setLocalBoard([
      ...localBoard,
      {
        id: String(Date.now()),
        name: 'New Member',
        order: localBoard.length + 1,
      }
    ]);
  };

  const addECMember = () => {
    setLocalEC([
      ...localEC,
      {
        id: String(Date.now()),
        role: 'New Role',
        name: 'New Member',
        order: localEC.length + 1,
      }
    ]);
  };

  return (
    <AdminLayout>
      <div className="fade-in max-w-4xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Board & Executive Committee</h1>
          <p className="text-muted-foreground mt-1">
            Manage the Board of Directors and Executive Committee members
          </p>
        </div>

        {/* Board of Directors */}
        <section className="admin-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-foreground">Board of Directors</h2>
            <Button onClick={addBoardMember} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="space-y-2">
            {localBoard.map((member, index) => (
              <div key={member.id} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
                <Input
                  value={member.name}
                  onChange={(e) => {
                    setLocalBoard(localBoard.map(m =>
                      m.id === member.id ? { ...m, name: e.target.value } : m
                    ));
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocalBoard(localBoard.filter(m => m.id !== member.id))}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button onClick={handleSaveBoard} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save Board
          </Button>
        </section>

        {/* Executive Committee */}
        <section className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-foreground">Executive Committee 2024-25</h2>
            <Button onClick={addECMember} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>

          <div className="space-y-3">
            {localEC.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <Input
                      value={member.role}
                      onChange={(e) => {
                        setLocalEC(localEC.map(m =>
                          m.id === member.id ? { ...m, role: e.target.value } : m
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input
                      value={member.name}
                      onChange={(e) => {
                        setLocalEC(localEC.map(m =>
                          m.id === member.id ? { ...m, name: e.target.value } : m
                        ));
                      }}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocalEC(localEC.filter(m => m.id !== member.id))}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {localEC.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No members added yet.</p>
            </div>
          )}

          <Button onClick={handleSaveEC} className="mt-4">
            <Save className="w-4 h-4 mr-2" />
            Save Executive Committee
          </Button>
        </section>
      </div>
    </AdminLayout>
  );
}
