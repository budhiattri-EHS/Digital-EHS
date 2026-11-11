import React, { useState, useEffect } from 'react';
import { Factory, ChevronDown, Plus, Settings } from 'lucide-react';
import { UserProfile } from '../types';
import { AppleHaptics } from '../services/appleHaptics';

interface HeaderProps {
  facility: string;
  onOpenFacilityModal: () => void;
  user: UserProfile;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenQuickReport: () => void;
  isOnline: boolean;
  isAppleMode?: boolean;
}

const getInitials = (name?: string, code?: string): string => {
  if (!name || !name.trim()) return code ? code.slice(0, 2).toUpperCase() : 'BP';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export const Header: React.FC<HeaderProps> = ({
  facility,
  onOpenFacilityModal,
  user,
  onOpenAuthModal,
  onOpenSettingsModal,
  onOpenQuickReport,
  isOnline,
  isAppleMode = false
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      setTimeStr(new Date().toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`sticky top-0 z-40 pt-safe px-4 pb-3 ${
      isAppleMode ? 'ios-glass-header' : 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80'
    }`}>
      {/* Top Row: Brand & Status */}
      <div className="flex items-center justify-between gap-2">
        {/* SBL Brand & Facility Selector */}
        <div className="flex items-center gap-2.5">
          {/* Official SBL Specialty Coatings Company Logo Badge */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-md overflow-hidden flex-shrink-0 p-1 border border-slate-700/80">
            <img 
              src="/sbl-emblem.png" 
              alt="SBL Specialty Coatings" 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = './sbl-emblem.png';
              }}
            />
          </div>

          {/* Facility dropdown button */}
          <button
            onClick={() => {
              AppleHaptics.light();
              onOpenFacilityModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700/60 hover:bg-slate-750 active:scale-95 transition-all text-left"
          >
            <Factory className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">
                Facility
              </span>
              <span className="text-xs font-bold text-slate-100 leading-tight truncate max-w-[100px]">
                {facility}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>
        </div>

        {/* Right side: Quick Report + User Profile + Settings */}
        <div className="flex items-center gap-2">
          {/* Quick Log Hazard Button */}
          <button
            onClick={() => {
              AppleHaptics.light();
              onOpenQuickReport();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-900/30 active:scale-95 transition-all"
            title="Log Unsafe Observation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Report</span>
          </button>

          {/* User initials & profile on top header */}
          <button
            onClick={() => {
              AppleHaptics.light();
              onOpenAuthModal();
            }}
            className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500/50 text-slate-200 active:scale-95 transition-all shadow-sm"
            title={`Logged in as ${user?.name || user?.employeeCode || 'User'} (Tap to view profile)`}
          >
            <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-[11px] flex items-center justify-center shadow-inner tracking-wider">
              {getInitials(user?.name, user?.employeeCode)}
            </span>
            <span className="text-xs font-bold text-slate-200 truncate max-w-[70px] xs:max-w-[100px]">
              {user?.name ? user.name.split(' ')[0] : (user?.employeeCode || 'BP')}
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              AppleHaptics.light();
              onOpenSettingsModal();
            }}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
            title="App Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Row: Live telemetry status & time */}
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className={`font-black uppercase tracking-wider ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isOnline ? (isAppleMode ? 'APPLE TELEMETRY SYNCED' : 'LIVE SYSTEMS SYNCED') : 'OFFLINE CACHED'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 font-mono font-bold">
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
};
