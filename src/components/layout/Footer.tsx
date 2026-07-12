import { Link } from 'react-router-dom';
import { Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">JVBNA New Jersey</h3>
            <p className="text-background/70 text-sm leading-relaxed">
              Center for Peace and Preksha Meditation. Promoting nonviolence, inner peace, 
              and spiritual growth through the timeless teachings of Jain philosophy.
            </p>
            <div className="flex gap-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-background/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/events/upcoming" className="text-background/70 hover:text-primary transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/activities" className="text-background/70 hover:text-primary transition-colors">
                  Activities
                </Link>
              </li>
              <li>
                <Link to="/spiritual-guidance" className="text-background/70 hover:text-primary transition-colors">
                  Spiritual Guidance
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-background/70 hover:text-primary transition-colors">
                  Donate
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-background/70">
                  151 Middlesex Avenue,<br />
                  Iselin, NJ 08830
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:848-219-5195" className="text-background/70 hover:text-primary transition-colors">
                  848-219-5195
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:info@jvbnj.org" className="text-background/70 hover:text-primary transition-colors">
                  info@jvbnj.org
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-serif text-lg font-bold mb-4">Center Hours</h3>
            <p className="text-background/70 text-sm leading-relaxed">
              Open for Members and Visitors<br />
              Seven days a week<br />
              9:00 AM to 6:00 PM
            </p>
            <Link
              to="/admin"
              className="inline-block mt-4 text-sm text-background/50 hover:text-primary transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col items-center gap-2 text-center text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} Jain Vishwa Bharati of North America - New Jersey. All rights reserved.</p>
          <a
            href="/about-app.txt"
            download
            className="text-xs text-background/40 hover:text-primary transition-colors"
          >
            About this app
          </a>
        </div>
      </div>
    </footer>
  );
}
