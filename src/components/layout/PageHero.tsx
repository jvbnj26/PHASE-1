import { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHero({ eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary py-16 md:py-20">
      {/* Decorative shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent blur-3xl" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

      <div className="container-custom relative">
        {eyebrow && (
          <p className="text-white/80 text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
