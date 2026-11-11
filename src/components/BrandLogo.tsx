'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
}

/**
 * The Sovereign EHS Crest: Symmetrical 4-Pillar Emblem for Budhi Parkash's Digital EHS Solutions.
 * Designed with bilateral mirror symmetry, combining 4 distinct shapes & 4 distinct colors:
 * 
 * 1. SAFETY: Protective Shield Foundation (Golden Amber) - Grounding industrial defense & Zero Harm.
 * 2. ENVIRONMENT: Twin Botanical Leaves (Emerald Green) - Symmetrical wings of sustainable ecological stewardship.
 * 3. HEALTH: Centered Vitality Heart (Coral Rose) - Human life, well-being, and occupational health at the core.
 * 4. DIGITAL: Crown Tech Diamond (Electric Sapphire) - Cloud intelligence, digital connectivity, and forward vision.
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

  const fillDigital = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#symm-digital)');
  const fillEnv = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#symm-env)');
  const fillHealth = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#symm-health)');
  const fillSafety = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#symm-safety)');
  const nodeFill = isWhite ? '#0071e3' : (isMono ? 'currentColor' : '#ffffff');

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform duration-300 hover:scale-105`}
      aria-label="Budhi Parkash Digital EHS Solutions Icon"
    >
      <defs>
        {/* 1. DIGITAL: Electric Sapphire to Cyan (Vision & Cloud Intelligence) */}
        <linearGradient id="symm-digital" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0071e3" />
          <stop offset="100%" stopColor="#00c7be" />
        </linearGradient>

        {/* 2. ENVIRONMENT: Vibrant Emerald to Mint (Nature & Sustainability) */}
        <linearGradient id="symm-env" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34c759" />
        </linearGradient>

        {/* 3. HEALTH: Radiant Coral Rose to Crimson (Vitality & Human Life) */}
        <linearGradient id="symm-health" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>

        {/* 4. SAFETY: Industrial Golden Amber to Deep Gold (Zero Harm & Protective Shield) */}
        <linearGradient id="symm-safety" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ff9500" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 1)">
        {/* 1. SAFETY: Foundation Shield Cradle (Golden Amber) */}
        <path
          d="M 50 88
             C 37 82 17 68 17 44
             C 17 35 21 29 26 25
             L 32 31
             C 28 34 25 38 25 44
             C 25 62 41 74 50 80
             C 59 74 75 62 75 44
             C 75 38 72 34 68 31
             L 74 25
             C 79 29 83 35 83 44
             C 83 68 63 82 50 88 Z"
          fill={fillSafety}
        />

        {/* 2. ENVIRONMENT: Twin Botanical Leaves (Emerald Green) */}
        {/* Left Leaf */}
        <path
          d="M 30 46
             C 19 46 19 29 34 23
             C 42 29 42 42 30 46 Z"
          fill={fillEnv}
        />
        {/* Right Leaf (Mirror reflection across x=50) */}
        <path
          d="M 70 46
             C 81 46 81 29 66 23
             C 58 29 58 42 70 46 Z"
          fill={fillEnv}
        />

        {/* 3. HEALTH: Centered Heart / Vitality Bloom (Coral Rose) */}
        <path
          d="M 50 66
             C 43 57 33 49 33 37
             C 33 28 40 23 46 26
             C 48 27 49.3 29 50 31
             C 50.7 29 52 27 54 26
             C 60 23 67 28 67 37
             C 67 49 57 57 50 66 Z"
          fill={fillHealth}
        />

        {/* 4. DIGITAL: Crown Tech Diamond Spark (Electric Sapphire) */}
        <path
          d="M 50 11
             L 59 21
             L 50 31
             L 41 21 Z"
          fill={fillDigital}
        />
        <circle cx="50" cy="21" r="2.5" fill={nodeFill} />
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
