'use client';

import React, { useState } from 'react';
import { Company } from '@/types';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  company: Company;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  size = 'md',
  showDetails = true,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }[size];

  // Specific high-definition logo for SBL Specialty Coatings
  const isSbl = company.name.toLowerCase().includes('sbl');
  const isApex = company.name.toLowerCase().includes('apex');
  const isGlobal = company.name.toLowerCase().includes('global');

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Container Badge */}
      <div className={`relative ${dimensions} rounded-2xl bg-white border border-[#d2d2d7]/80 shadow-sm flex items-center justify-center p-1 overflow-hidden shrink-0`}>
        {isSbl ? (
          <img
            src="/sbl-emblem.png"
            alt={company.name}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : isApex ? (
          // Apex Industrial Chemicals Bespoke Vector Emblem
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-black text-xs shadow-inner">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M12 2L2 22H22L12 2ZM12 6L18.5 19H5.5L12 6Z" />
            </svg>
          </div>
        ) : isGlobal ? (
          // Global Paints & Resins Bespoke Vector Emblem
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-inner">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        ) : (
          // Dynamic Company Emblem
          <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] flex items-center justify-center text-white font-bold text-xs">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Company Metadata Info */}
      {showDetails && (
        <div className="flex flex-col text-left leading-tight min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-bold text-[#0071e3] tracking-wider font-mono">
              TENANT CORPORATE NODE
            </span>
          </div>
          <span className="text-xs font-bold text-[#1d1d1f] truncate max-w-[200px]" title={company.name}>
            {company.name}
          </span>
          <span className="text-[10px] text-[#86868b] truncate max-w-[200px]">
            {company.industry} • {company.subscription_tier}
          </span>
        </div>
      )}
    </div>
  );
};
