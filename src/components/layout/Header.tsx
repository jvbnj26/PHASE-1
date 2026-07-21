import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, ChevronDown, LogIn, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jvbLogo from '@/assets/jvb-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomPages } from '@/hooks/useCustomPages';
import { toast } from 'sonner';

const navItems = [
  { name: 'HOME', path: '/' },
  {
    name: 'ABOUT US',
    path: '/about',
    submenu: [
      { name: 'About JVBNA', path: '/about' },
      { name: 'Leadership', path: '/about/leadership' },
    ],
  },
  {
    name: 'EVENTS',
    path: '/events',
    submenu: [
      { name: 'Upcoming Events', path: '/events/upcoming' },
      { name: 'Ongoing Events', path: '/events/ongoing' },
      { name: 'Past Events', path: '/events/past' },
    ],
  },
  { name: 'ACTIVITIES', path: '/activities' },
  { name: 'BLOG', path: '/blog' },
  { name: 'CALENDAR', path: '/calendar' },
  { name: 'PHOTOS', path: '/photos' },
  { name: 'SPIRITUAL GUIDANCE', path: '/spiritual-guidance' },
  {
    name: 'GET INVOLVED',
    path: '/get-involved',
    submenu: [
      { name: 'Volunteer', path: '/volunteer' },
      { name: 'Donate', path: '/donate' },
    ],
  },
  { name: 'CONTACT US', path: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { pages: customPages } = useCustomPages();

  const isActive = (path: string) => location.pathname === path;

  const customNav = (() => {
    const publishedPages = customPages.filter((p) => p.status === 'published');
    const top = publishedPages.filter((p) => !p.parent_slug);
    return top.map((p) => {
      const subs = publishedPages
        .filter((c) => c.parent_slug === p.slug)
        .map((c) => ({ name: c.title.toUpperCase(), path: `/p/${p.slug}/${c.slug}` }));
      return {
        name: p.title.toUpperCase(),
        path: `/p/${p.slug}`,
        submenu: subs.length ? subs : undefined,
      };
    });
  })();
  const allNavItems = [...navItems, ...customNav];

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <header className="w-full">
      {/* Top bar with contact info */}
      <div className="bg-white border-b border-border">
        <div className="container-custom py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={jvbLogo} alt="JVBNA Logo" className="w-14 h-14 object-contain" />
            <div>
              <h1 className="text-primary font-serif text-xl font-bold leading-tight">
                JAIN VISHWA BHARATI
              </h1>
              <p className="text-secondary text-sm font-medium">
                Center for Peace and Preksha Meditation
              </p>
            </div>
          </Link>

          {/* Contact info */}
          <div className="flex items-center gap-3 sm:gap-6 text-sm">
            <a href="mailto:INFO@JVBNJ.ORG" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">INFO@JVBNJ.ORG</span>
            </a>
            <a href="tel:848-219-5195" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">848-219-5195</span>
            </a>

            {/* Action buttons: desktop-only here — mobile equivalents live in the hamburger menu to prevent this row from overflowing on narrow screens */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/donate">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold">
                  DONATE
                </Button>
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link to="/member">
                    <Button variant="ghost" className="text-foreground hover:text-primary font-semibold gap-1.5">
                      <UserCircle className="w-5 h-5 text-secondary" />
                      <span className="hidden md:inline truncate max-w-[120px]">
                        {(user?.user_metadata?.name as string)?.split(' ')[0] || 'MY ACCOUNT'}
                      </span>
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    className="font-semibold"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    LOG OUT
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/auth?tab=signin">
                    <Button variant="ghost" className="text-foreground hover:text-primary font-semibold">
                      <LogIn className="w-4 h-4 mr-1.5" />
                      LOG IN
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="secondary" className="font-semibold">
                      SIGN UP
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-primary">
        <div className="container-custom">
          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center justify-center">
            {allNavItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => item.submenu && setOpenSubmenu(item.name)}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-1 px-4 py-4 text-sm font-medium transition-colors
                    ${isActive(item.path) 
                      ? 'bg-primary-foreground/20 text-white' 
                      : 'text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-white'
                    }`}
                >
                  {item.name}
                  {item.submenu && <ChevronDown className="w-4 h-4" />}
                </Link>
                
                {/* Submenu dropdown */}
                {item.submenu && openSubmenu === item.name && (
                  <div className="absolute top-full left-0 min-w-[200px] bg-white shadow-lg rounded-b-lg z-50 fade-in">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        className="block px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex justify-end py-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-4 fade-in">
              {allNavItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => !item.submenu && setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium transition-colors
                      ${isActive(item.path) 
                        ? 'bg-primary-foreground/20 text-white' 
                        : 'text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-white'
                      }`}
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <div className="pl-6 bg-primary-foreground/5">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-primary-foreground/80 hover:text-white transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Action buttons — desktop shows these in the top bar instead */}
              <div className="mt-3 pt-3 border-t border-primary-foreground/20 px-4 flex flex-col gap-2">
                <Link to="/donate" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full font-semibold">
                    DONATE
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link to="/member" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-primary-foreground hover:text-white hover:bg-primary-foreground/10 font-semibold gap-1.5">
                        <UserCircle className="w-5 h-5" />
                        {(user?.user_metadata?.name as string)?.split(' ')[0] || 'MY ACCOUNT'}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-1.5" />
                      LOG OUT
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth?tab=signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-primary-foreground hover:text-white hover:bg-primary-foreground/10 font-semibold">
                        <LogIn className="w-4 h-4 mr-1.5" />
                        LOG IN
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold">
                        SIGN UP
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
