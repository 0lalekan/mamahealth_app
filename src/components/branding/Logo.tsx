import { FC } from 'react';
import logoPng from '@/assets/logo.png';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: number;
}

// Simple logo placeholder; replace SVG paths with your real brand artwork
export const Logo: FC<LogoProps> = ({ className = '', showWordmark = true, size = 40 }) => {
  return (
    <div className={`flex items-center gap-2 font-semibold ${className}`}>
      <img
        src={logoPng}
        alt="MamaHealth Logo"
        style={{ width: size, height: size }}
        className="rounded-xl object-contain shadow-glow"
        loading="lazy"
      />
      {showWordmark && (
        <span className="text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          MamaHealth
        </span>
      )}
    </div>
  );
};

export default Logo;
