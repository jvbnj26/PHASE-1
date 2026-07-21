import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SiteContentProvider } from "@/contexts/SiteContentContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LeadershipPage from "./pages/LeadershipPage";
import EventsPage from "./pages/EventsPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import CalendarPage from "./pages/CalendarPage";
import PhotosPage from "./pages/PhotosPage";
import SpiritualGuidancePage from "./pages/SpiritualGuidancePage";
import VolunteerPage from "./pages/VolunteerPage";
import DonatePage from "./pages/DonatePage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

import SignupPage from "./pages/SignupPage";
import MemberDashboard from "./pages/MemberDashboard";
import CustomPageView from "./pages/CustomPageView";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminBoardPage from "./pages/admin/AdminBoardPage";
import AdminAboutPage from "./pages/admin/AdminAboutPage";
import AdminActivitiesPage from "./pages/admin/AdminActivitiesPage";
import AdminSpiritualGuidancePage from "./pages/admin/AdminSpiritualGuidancePage";
import AdminVolunteerPage from "./pages/admin/AdminVolunteerPage";
import AdminDonationsPage from "./pages/admin/AdminDonationsPage";
import AdminContactPage from "./pages/admin/AdminContactPage";
import AdminMediaPage from "./pages/admin/AdminMediaPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminMembersPage from "./pages/admin/AdminMembersPage";
import AdminMemberDetailPage from "./pages/admin/AdminMemberDetailPage";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminProgramsPage from "./pages/admin/AdminProgramsPage";
import AdminBlogPage from "./pages/admin/AdminBlogPage";
import RequireAdmin from "./components/admin/RequireAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SiteContentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/leadership" element={<LeadershipPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:type" element={<EventsPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/photos" element={<PhotosPage />} />
              <Route path="/spiritual-guidance" element={<SpiritualGuidancePage />} />
              <Route path="/volunteer" element={<VolunteerPage />} />
              <Route path="/get-involved" element={<VolunteerPage />} />
              <Route path="/donate" element={<DonatePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/member" element={<MemberDashboard />} />
              
              <Route path="/p/:slug" element={<CustomPageView />} />
              <Route path="/p/:parent/:slug" element={<CustomPageView />} />

              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              
              
              {/* Admin Routes — login is public; everything else requires isAdmin */}
              <Route path="/admin" element={<AdminLoginPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/home" element={<AdminHomePage />} />
                <Route path="/admin/about" element={<AdminAboutPage />} />
                <Route path="/admin/events" element={<AdminEventsPage />} />
                <Route path="/admin/activities" element={<AdminActivitiesPage />} />
                <Route path="/admin/spiritual-guidance" element={<AdminSpiritualGuidancePage />} />
                <Route path="/admin/volunteer" element={<AdminVolunteerPage />} />
                <Route path="/admin/donations" element={<AdminDonationsPage />} />
                <Route path="/admin/contact" element={<AdminContactPage />} />
                <Route path="/admin/board" element={<AdminBoardPage />} />
                <Route path="/admin/members" element={<Navigate to="/admin" replace />} />
                <Route path="/admin/members/:id" element={<AdminMemberDetailPage />} />
                <Route path="/admin/media" element={<AdminMediaPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/pages" element={<AdminPagesPage />} />
                <Route path="/admin/programs" element={<AdminProgramsPage />} />
                <Route path="/admin/blog" element={<AdminBlogPage />} />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SiteContentProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
