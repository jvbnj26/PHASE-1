import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  FileText,
  Calendar,
  Users,
  Image,
  Settings,
  LogOut,
  LayoutDashboard,
  Megaphone,
  Heart,
  MapPin,
  BookOpen,
  HandHeart,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import JVBLogo from '@/components/JVBLogo';

interface AdminLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pages', path: '/admin/pages', icon: FileText },
  { name: 'Home Page', path: '/admin/home', icon: Home },
  { name: 'About Us', path: '/admin/about', icon: FileText },
  { name: 'Events', path: '/admin/events', icon: Calendar },
  { name: 'Activities', path: '/admin/activities', icon: Megaphone },
  { name: 'Spiritual Guidance', path: '/admin/spiritual-guidance', icon: BookOpen },
  { name: 'Volunteer', path: '/admin/volunteer', icon: HandHeart },
  { name: 'Donations', path: '/admin/donations', icon: Heart },
  { name: 'Contact', path: '/admin/contact', icon: MapPin },
  { name: 'Board & EC', path: '/admin/board', icon: Users },

  { name: 'Programs', path: '/admin/programs', icon: Layers },
  { name: 'Media Library', path: '/admin/media', icon: Image },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-16 bg-foreground text-background flex items-center justify-between px-4 border-b border-background/10">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <JVBLogo className="w-8 h-8 shrink-0" />
          <p className="font-semibold text-sm truncate">JVBNA Admin</p>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-background/10 rounded-lg shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 bg-foreground text-background flex flex-col fixed h-full z-50 transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-background/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <JVBLogo className="w-10 h-10" />
            <div>
              <p className="font-semibold text-sm">JVBNA Admin</p>
              <p className="text-xs text-background/60">Website Manager</p>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-background/10 rounded-lg"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-background/70 hover:bg-background/10 hover:text-background'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t border-background/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {(user?.user_metadata?.name as string)?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{(user?.user_metadata?.name as string) || 'Admin'}</p>
              <p className="text-xs text-background/60">{user?.email || 'admin@jvbnj.org'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full border-background/20 text-background hover:bg-background/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 w-full min-w-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
