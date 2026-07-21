import jvbLogo from '@/assets/jvb-logo.png';

/** Uniform branded stand-in for posts without a featured image yet — keeps every card/hero the same shape and look. */
export default function BlogImagePlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center ${className}`}>
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-accent/25 blur-2xl" />
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 shadow-lg flex items-center justify-center p-3">
        <img src={jvbLogo} alt="" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
