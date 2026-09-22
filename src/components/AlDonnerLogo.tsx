import React from 'react';

interface AlDonnerLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'horizontal' | 'mark';
  color?: string;
  textColor?: string;
  subtextColor?: string;
  showSubtitle?: boolean;
}

/**
 * Official AL DONNER Geometric Monogram & Brand Logo
 * Matching the exact staff uniform embroidery & brand identity:
 * Stylized geometric "AD" monogram with clean uppercase "AL DONNER" wordmark.
 */
export const AlDonnerLogo: React.FC<AlDonnerLogoProps> = ({
  className = '',
  size = 40,
  variant = 'horizontal',
  color = '#F59E0B',
  textColor = '#FFFFFF',
  subtextColor = '#9CA3AF',
  showSubtitle = true,
}) => {
  const numericSize = typeof size === 'number' ? size : 40;

  // The official geometric AD monogram mark
  const MonogramMark = ({ w = numericSize, h = numericSize }: { w?: number; h?: number }) => (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm transition-transform group-hover:scale-105"
    >
      {/* Outer Glow / Ambient for dark backgrounds */}
      <defs>
        <linearGradient id="alDonnerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="alDonnerWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>

      {/* Stylized AD Monogram: Angled A blending into curved D loop */}
      {/* Left leg of A: ascending diagonal stroke */}
      <path
        d="M 32 82 L 62 18 L 74 18 L 44 82 Z"
        fill={color === 'white' ? 'url(#alDonnerWhiteGrad)' : color === 'gold' ? 'url(#alDonnerGoldGrad)' : color}
      />

      {/* The D loop & right leg of A connecting into the curved bowl of D */}
      <path
        d="M 58 18 L 82 18 C 98 18 110 28 110 46 C 110 64 96 74 80 74 L 54 74 L 60 62 L 78 62 C 88 62 96 56 96 46 C 96 36 88 30 78 30 L 52 30 Z"
        fill={color === 'white' ? 'url(#alDonnerWhiteGrad)' : color === 'gold' ? 'url(#alDonnerGoldGrad)' : color}
      />

      {/* Inner crossbar / angled apex cutout creating the sharp A counter */}
      <path
        d="M 47 54 L 75 54 L 69 66 L 41 66 Z"
        fill={color === 'white' ? 'url(#alDonnerWhiteGrad)' : color === 'gold' ? 'url(#alDonnerGoldGrad)' : color}
      />
    </svg>
  );

  // Variant 1: Just the icon / mark
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <MonogramMark w={numericSize} h={numericSize} />
      </div>
    );
  }

  // Variant 2: Full vertical lockup (Logo on top, AL DONNER text below) as seen on the chest embroidery
  if (variant === 'full') {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        <MonogramMark w={numericSize} h={numericSize * 0.85} />
        <span
          className="font-black tracking-[0.25em] text-xs sm:text-sm uppercase font-['Outfit'] mt-1"
          style={{ color: textColor }}
        >
          AL DONNER
        </span>
        {showSubtitle && (
          <span
            className="text-[9px] tracking-[0.15em] uppercase font-semibold mt-0.5"
            style={{ color: subtextColor }}
          >
            GOURMET DÖNER & PIZZA
          </span>
        )}
      </div>
    );
  }

  // Variant 3: Horizontal lockup (Monogram on left, AL DONNER text on right)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <MonogramMark w={numericSize} h={numericSize * 0.85} />
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className="font-black tracking-[0.16em] text-sm sm:text-base md:text-lg uppercase font-['Outfit']"
            style={{ color: textColor }}
          >
            AL DONNER
          </span>
        </div>
        {showSubtitle && (
          <span
            className="text-[10px] tracking-[0.14em] uppercase font-medium mt-1 leading-none"
            style={{ color: subtextColor }}
          >
            DÖNER & PIZZA RESTORANI
          </span>
        )}
      </div>
    </div>
  );
};
