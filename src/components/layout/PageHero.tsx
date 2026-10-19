import { ReactNode } from 'react';
import RichText from '@/components/RichText';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string; // rich text
  image?: string; // optional background photo
  children?: ReactNode;
}

export default function PageHero({ eyebrow, title, subtitle, image, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary py-16 md:py-20">
      {image ? (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          {/* Brand-tinted overlay keeps the white title readable on any photo */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-secondary/75" />
        </>
      ) : (
        /* Decorative shapes */
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

      <div className="container-custom relative">
        {eyebrow?.trim() && (
          <p className="text-white/80 text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            {eyebrow}
          </p>
        )}
        {title.trim() && (
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {title}
          </h1>
        )}
        <RichText value={subtitle} onDark className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed" />
        {children}
      </div>
    </section>
  );
}
