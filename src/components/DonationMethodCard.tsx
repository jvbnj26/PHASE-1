import { CheckCircle, ExternalLink } from 'lucide-react';
import RichText from '@/components/RichText';
import type { DonationMethod } from '@/data/siteContent';
import { DONATION_METHOD_ICONS, donationButtonHref } from '@/lib/donationMethods';
import { isRichTextEmpty } from '@/lib/richText';

/**
 * One "How to Donate" card. `accent` alternates the icon color between plain cards; recommended
 * cards use the green highlighted style.
 */
export default function DonationMethodCard({ method, accent }: { method: DonationMethod; accent?: boolean }) {
  const { Icon } = DONATION_METHOD_ICONS[method.icon] ?? DONATION_METHOD_ICONS.heart;
  const href = donationButtonHref(method.buttonUrl);
  const showButton = href && method.buttonLabel.trim();
  const hasDetails = !isRichTextEmpty(method.details);
  const external = href ? /^https?:/i.test(href) : false;
  const rec = method.recommended;

  return (
    <div
      className={
        rec
          ? 'group relative w-full flex flex-col [&>*:last-child]:mb-0 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl border border-secondary p-7 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden'
          : 'group relative w-full flex flex-col [&>*:last-child]:mb-0 bg-white rounded-2xl border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
      }
    >
      {rec && (
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
          Recommended
        </div>
      )}
      <div
        className={
          rec
            ? 'w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center mb-5 group-hover:scale-110 transition-transform'
            : `w-14 h-14 rounded-2xl bg-gradient-to-br ${accent ? 'from-accent to-accent/70 text-accent-foreground' : 'from-primary to-primary/70 text-primary-foreground'} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md`
        }
      >
        <Icon className="w-7 h-7" />
      </div>
      <h4 className={`font-serif font-bold text-xl mb-2 ${rec ? '' : 'text-foreground'}`}>{method.title}</h4>
      <RichText
        value={method.description}
        onDark={rec}
        className={`text-sm mb-4 ${rec ? 'text-white/90' : 'text-muted-foreground'}`}
      />

      {hasDetails &&
        (rec ? (
          <div className="flex items-start gap-2 bg-white/10 rounded-lg px-4 py-3 mb-4">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <RichText value={method.details} onDark className="text-sm font-medium [--rt-gap:0.375rem]" />
          </div>
        ) : (
          <RichText
            value={method.details}
            className="text-xs text-muted-foreground bg-section rounded-lg p-4 mb-4 [--rt-gap:0.375rem]"
          />
        ))}

      {method.imageUrl && (
        <img
          src={method.imageUrl}
          alt={`${method.title} — scan or save`}
          loading="lazy"
          className="w-full max-h-56 object-contain rounded-lg bg-white p-2 mb-4"
        />
      )}

      {showButton && (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={`mt-auto inline-flex items-center justify-center gap-2 w-full h-10 rounded-md text-sm font-medium transition-colors ${
            rec
              ? 'bg-white text-secondary hover:bg-white/90'
              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          {method.buttonLabel}
          {external && <ExternalLink className="w-4 h-4" />}
        </a>
      )}
    </div>
  );
}
