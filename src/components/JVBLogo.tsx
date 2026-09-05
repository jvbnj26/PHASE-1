import jvbLogo from '@/assets/jvb-logo.png';

export default function JVBLogo({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <img
      src={jvbLogo}
      alt="Jain Vishwa Bharati"
      className={className}
    />
  );
}
