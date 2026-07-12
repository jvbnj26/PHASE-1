import logoAsset from '@/assets/jvb-logo.png.asset.json';

export default function JVBLogo({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Jain Vishwa Bharati"
      className={className}
    />
  );
}
