import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Link } from 'react-router-dom';
import MembersDatabasePanel from './AdminMembersPage';
import {
  Home,
  FileText,
  Calendar,
  Megaphone,
  Users,
  ArrowRight,
  Image,
  ExternalLink
} from 'lucide-react';

const quickActions = [
  { 
    name: 'Edit Home Page', 
    description: 'Update banners, welcome text, and featured content',
    path: '/admin/home', 
    icon: Home,
    color: 'bg-primary/10 text-primary'
  },
  { 
    name: 'Manage Events', 
    description: 'Add or update upcoming, ongoing, and past events',
    path: '/admin/events', 
    icon: Calendar,
    color: 'bg-secondary/10 text-secondary'
  },
  { 
    name: 'Update Activities', 
    description: 'Edit activity descriptions and schedules',
    path: '/admin/activities', 
    icon: Megaphone,
    color: 'bg-accent/30 text-foreground'
  },
  { 
    name: 'Board & Committee', 
    description: 'Update board members and executive committee',
    path: '/admin/board', 
    icon: Users,
    color: 'bg-primary/10 text-primary'
  },
];

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout>
      <div className="fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to the JVBNA Website Admin Panel
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="admin-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">6</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Megaphone className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Activities</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">27</p>
                <p className="text-sm text-muted-foreground">EC Members</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4</p>
                <p className="text-sm text-muted-foreground">Banner Slides</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.path}
                  className="admin-card flex items-center gap-4 group hover:border-primary transition-colors"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Members Database */}
        <div className="mb-8">
          <MembersDatabasePanel />
        </div>

        {/* Help Section */}
        <div className="admin-card bg-gradient-to-r from-primary/5 to-secondary/5">
          <h2 className="font-serif text-xl font-bold text-foreground mb-4">How to Use This Panel</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Editing Content</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Navigate to the section you want to edit from the sidebar
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Make your changes in the form fields provided
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  Click "Save Changes" to update the website
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Managing Events</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2" />
                  Events can be marked as Upcoming, Ongoing, or Past
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2" />
                  Upload flyer images for each event
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2" />
                  Add RSVP or registration links as needed
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* View Live Site */}
        <div className="mt-8 text-center">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Live Website
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
