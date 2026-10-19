import { Facebook, Youtube, Camera, type LucideIcon } from 'lucide-react';
import { usePageText } from '@/hooks/usePageText';
import { linkHref } from '@/lib/pageContent';

const NETWORKS: { field: 'facebookUrl' | 'flickrUrl' | 'youtubeUrl'; label: string; Icon: LucideIcon; color: string }[] = [
  { field: 'facebookUrl', label: 'Facebook', Icon: Facebook, color: 'bg-[#1877F2]' },
  { field: 'flickrUrl', label: 'Flickr', Icon: Camera, color: 'bg-[#FF0084]' },
  { field: 'youtubeUrl', label: 'YouTube', Icon: Youtube, color: 'bg-[#FF0000]' },
];

/** JVBNA's social media links (Admin > Settings). Networks without a valid link are hidden. */
export function useSocialLinks() {
  const { t } = usePageText('site');
  return NETWORKS.flatMap((n) => {
    const href = linkHref(t(n.field));
    return href ? [{ ...n, href }] : [];
  });
}

/** Round brand-colored buttons, as on the Spiritual Guidance and Volunteer pages. */
export default function SocialLinks({ className }: { className?: string }) {
  const links = useSocialLinks();
  if (links.length === 0) return null;
  return (
    <div className={className}>
      {links.map(({ href, label, Icon, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md`}
        >
          <Icon className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}
