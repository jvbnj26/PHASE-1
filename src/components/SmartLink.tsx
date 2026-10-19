import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { linkHref, isInternalHref } from '@/lib/pageContent';

/**
 * Link to an admin-editable destination: site paths use the router, web links open in a new tab,
 * mailto:/tel: open normally. Renders nothing when the destination is empty or invalid.
 */
export default function SmartLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  const href = linkHref(to);
  if (!href) return null;
  if (href.startsWith('/')) return <Link to={href} className={className}>{children}</Link>;
  if (isInternalHref(href)) return <a href={href} className={className}>{children}</a>;
  const external = /^https?:/i.test(href);
  return (
    <a href={href} className={className} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}
