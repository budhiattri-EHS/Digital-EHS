'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16'
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

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Creative Dynamic Shield & Digital Cross Icon */}
      <div className={`relative ${iconDimensions} rounded-2xl bg-gradient-to-tr from-[#0071e3] via-[#0284c7] to-[#10b981] p-[2px] shadow-lg shadow-[#0071e3]/20 shrink-0`}>
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Cyber Grid Lines in background */}
          <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 40 40">
            <defs>
              <pattern id="logo-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#0071e3" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="40" height="40" fill="url(#logo-grid)" />
          </svg>

          {/* Central Stylized BP & Safety Cross Emblem */}
          <svg className="w-3/4 h-3/4 relative z-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Safety Hex Shield */}
            <path
              d="M24 4L39 10.5V23C39 32.5 32.5 41 24 44C15.5 41 9 32.5 9 23V10.5L24 4Z"
              fill="url(#shield-grad)"
              stroke="#0071e3"
              strokeWidth="1.5"
            />
            {/* Digital Cross / Pulse */}
            <path
              d="M24 13V33M14 23H34"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Interconnected Digital Nodes */}
            <circle cx="24" cy="13" r="2.2" fill="#10b981" />
            <circle cx="24" cy="33" r="2.2" fill="#10b981" />
            <circle cx="14" cy="23" r="2.2" fill="#38bdf8" />
            <circle cx="34" cy="23" r="2.2" fill="#38bdf8" />
            {/* Center BP Monogram Core */}
            <circle cx="24" cy="23" r="6" fill="#0071e3" />
            <text
              x="24"
              y="25.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="7"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              BP
            </text>

            <defs>
              <linearGradient id="shield-grad" x1="9" y1="4" x2="39" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0071e3" stopOpacity="0.9" />
                <stop offset="1" stopColor="#0284c7" stopOpacity="0.85" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Structured Brand Typography */}
      <div className="flex flex-col text-left leading-tight">
        {/* Creator / Owner Brand */}
        <span className={`${textSize.owner} font-semibold uppercase tracking-wider text-[#0071e3]`}>
          Budhi Parkash&apos;s
        </span>

        {/* Core Brand Title */}
        <span className={`${textSize.title} font-black tracking-tight text-[#1d1d1f]`}>
          Digital EHS
        </span>

        {/* Category Description */}
        {showSubtitle && (
          <span className={`${textSize.system} font-medium text-[#86868b]`}>
            Management System
          </span>
        )}
      </div>
    </div>
  );
};
