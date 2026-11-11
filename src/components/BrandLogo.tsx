'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
}

/**
 * The Quantum Aegis: Pure geometric mark for Budhi Parkash's Digital EHS Solutions.
 * Designed like Apple, ChatGPT, and Antigravity:
 * Pure, iconic, instantly recognizable geometric shape with zero text or raster clutter.
 * 
 * Geometry:
 * 1. An aerodynamic protective Shield silhouette (EHS Safety core)
 * 2. 3 interlocking continuous Möbius ribbons (Environment, Health, Safety)
 * 3. Flowing geometric monogram loops evoking 'B' and 'P' (Budhi Parkash)
 * 4. A luminous digital prism diamond star in negative space (Intelligence & Zero-Harm)
 */
export const EhsBrandShape: React.FC<{
  className?: string;
  variant?: 'gradient' | 'mono' | 'white';
}> = ({
  className = 'w-8 h-8',
  variant = 'gradient'
}) => {
  const isMono = variant === 'mono';
  const isWhite = variant === 'white';

  const fill1 = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#ehs-grad-alpha)');
  const fill2 = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#ehs-grad-beta)');
  const fill3 = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#ehs-grad-gamma)');
  const centerFill = isWhite ? '#0071e3' : (isMono ? 'transparent' : '#ffffff');

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform duration-300 hover:scale-105`}
      aria-label="Budhi Parkash Digital EHS Solutions Icon"
    >
      <defs>
        {/* Master Electric Sapphire & Cyan Gradient (Digital & Safety) */}
        <linearGradient id="ehs-grad-alpha" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#0071e3" />
          <stop offset="100%" stopColor="#00c7be" />
        </linearGradient>

        {/* Master Emerald to Azure Gradient (Environment & Health) */}
        <linearGradient id="ehs-grad-beta" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34c759" />
          <stop offset="50%" stopColor="#00c7be" />
          <stop offset="100%" stopColor="#0071e3" />
        </linearGradient>

        {/* Master Deep Cobalt Gradient (Process Safety & Foundation Anchor) */}
        <linearGradient id="ehs-grad-gamma" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#005bb5" />
          <stop offset="60%" stopColor="#0071e3" />
          <stop offset="100%" stopColor="#5856d6" />
        </linearGradient>

        {/* Apple-grade ambient drop shadow for depth */}
        <filter id="aegis-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#0071e3" floodOpacity="0.22" />
        </filter>
      </defs>

      <g filter={variant === 'gradient' ? 'url(#aegis-glow)' : undefined} transform="translate(0, 1)">
        {/* Ribbon 1: The Left Spine & Upper Shield Arch ('B' Foundation & Health) */}
        <path
          d="M 50 10
             C 32 10 17 22 15 42
             C 13 58 22 72 34 80
             C 36 81.5 38.5 79.8 37.5 77.8
             C 28 62 26 50 28 38
             C 30 27 38 20 50 20
             C 61 20 70 27 72 36
             C 72.8 39.5 76 39.5 77 37
             C 78 34 76.5 29.5 73.5 25
             C 67 15 59 10 50 10 Z"
          fill={fill1}
        />

        {/* Ribbon 2: The Right Wing & 'P' Head (Environment & Inward Loop) */}
        <path
          d="M 50 20
             C 62 20 74 29 76 43
             C 77.5 54 72 64 62 70.5
             C 60 72 61 75 63 74
             C 75 66 83 54 85 40
             C 87 22 73 10 51 10
             C 46 10 40 11.5 36 14
             C 34 15.5 34.5 18.5 37 19.5
             C 41 20 45 20 50 20 Z"
          fill={fill2}
        />

        {/* Ribbon 3: The Foundation & Safety Apex (Zero-Harm Grounding) */}
        <path
          d="M 50 91
             C 47.5 91 45.5 89 44 86.5
             C 35 72.5 30 57.5 34 44
             C 34.5 41.5 37.5 41.5 38.5 44
             C 40.5 53 44 63.5 50 71.5
             C 56 63.5 59.5 53 61.5 44
             C 62.5 41.5 65.5 41.5 66 44
             C 70 57.5 65 72.5 56 86.5
             C 54.5 89 52.5 91 50 91 Z"
          fill={fill3}
        />

        {/* The Digital Prism Core Spark (North Star of Vigilance) */}
        <path
          d="M 50 35
             L 56.5 46.5
             L 50 58
             L 43.5 46.5 Z"
          fill={centerFill}
        />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  iconOnly = false
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-16 sm:h-16'
  }[size];

  const textSize = {
    sm: {
      owner: 'text-[9px]',
      title: 'text-xs',
      system: 'text-[9px]'
    },
    md: {
      owner: 'text-[10px]',
      title: 'text-sm',
      system: 'text-[11px]'
    },
    lg: {
      owner: 'text-xs',
      title: 'text-lg',
      system: 'text-xs'
    }
  }[size];

  if (iconOnly) {
    return <EhsBrandShape className={iconDimensions} />;
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* The Pure Geometric Shape (Like Apple / ChatGPT / Antigravity) */}
      <EhsBrandShape className={iconDimensions} />

      {/* Structured Brand Typography */}
      <div className="flex flex-col text-left leading-tight min-w-0">
        {/* Creator / Owner Brand */}
        <span className={`${textSize.owner} font-semibold uppercase tracking-wider text-[#0071e3] truncate`}>
          Budhi Parkash&apos;s
        </span>

        {/* Core Brand Title */}
        <span className={`${textSize.title} font-black tracking-tight text-[#1d1d1f] truncate`}>
          Digital EHS
        </span>

        {/* Category Description */}
        {showSubtitle && (
          <span className={`${textSize.system} font-medium text-[#86868b] truncate`}>
            Management Solutions
          </span>
        )}
      </div>
    </div>
  );
};
