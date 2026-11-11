'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
}

/**
 * The EHS Delta Prism: Pure geometric mark for Budhi Parkash's Digital EHS Solutions.
 * Designed like Apple, ChatGPT, and Antigravity:
 * Ultra-simple, iconic, instantly recognizable geometric shape with zero visual clutter.
 * 
 * Geometry:
 * 1. An aerodynamic protective Shield silhouette (EHS Safety core)
 * 2. 3 clean, flowing geometric facets representing Environment, Health, and Safety
 * 3. An upward-pointing delta in negative space (Zero Harm / Excellence / Digital Ascension)
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

  const fillEnv = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#ehs-delta-env)');
  const fillHealth = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#ehs-delta-health)');
  const fillSafety = isWhite ? '#ffffff' : (isMono ? 'currentColor' : 'url(#ehs-delta-safety)');

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 transition-transform duration-300 hover:scale-105`}
      aria-label="Budhi Parkash Digital EHS Solutions Icon"
    >
      <defs>
        {/* Facet 1: Environment (Emerald to Cyan) */}
        <linearGradient id="ehs-delta-env" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#00c7be" />
        </linearGradient>

        {/* Facet 2: Health & Digital (Cyan to Apple Azure) */}
        <linearGradient id="ehs-delta-health" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c7be" />
          <stop offset="100%" stopColor="#0071e3" />
        </linearGradient>

        {/* Facet 3: Safety Foundation (Apple Azure to Royal Indigo) */}
        <linearGradient id="ehs-delta-safety" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0071e3" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      <g transform="translate(0, 1)">
        {/* Facet 1: Environment (Left Shield Flank) */}
        <path
          d="M 47 14
             C 32 15 18 26 18 45
             C 18 56 23 66 30 73
             L 43 57
             C 39 52 38 48 38 44
             C 38 34 44 26 53 23
             L 47 14 Z"
          fill={fillEnv}
        />

        {/* Facet 2: Health & Digital (Right Shield Flank / 'P' Lobe) */}
        <path
          d="M 53 14
             L 47 23
             C 56 26 62 34 62 44
             C 62 48 61 52 57 57
             L 70 73
             C 77 66 82 56 82 45
             C 82 26 68 15 53 14 Z"
          fill={fillHealth}
        />

        {/* Facet 3: Safety Foundation (Bottom Apex & Zero-Harm Anchor) */}
        <path
          d="M 33 76
             L 46 60
             C 48 61.2 50 61.8 52 61.8
             C 54 61.8 56 61.2 58 60
             L 71 76
             C 65 83 57 88 50 88
             C 43 88 35 83 33 76 Z"
          fill={fillSafety}
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
