import React from 'react';
import { LayoutDashboard, Activity, LayoutGrid, Layers, Cpu, Sparkles } from 'lucide-react';
import { AppleHaptics } from '../services/appleHaptics';

export type TabType = 'dashboard' | 'telemetry' | 'apps' | 'resources' | 'jarvis';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hazardCount: number;
  isAppleMode?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  hazardCount,
  isAppleMode = false
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Tower',
      icon: LayoutDashboard
    },
    {
      id: 'telemetry' as TabType,
      label: 'Telemetry',
      icon: Activity
    },
    {
      id: 'apps' as TabType,
      label: 'Launchpad',
      icon: LayoutGrid
    },
    {
      id: 'resources' as TabType,
      label: 'CAPA & Eco',
      icon: Layers,
      badge: hazardCount > 0 ? hazardCount : undefined
    },
    {
      id: 'jarvis' as TabType,
      label: 'J.A.R.V.I.S.',
      icon: isAppleMode ? Sparkles : Cpu,
      isSpecial: true
    }
  ];

  const handleTabClick = (tabId: TabType) => {
    AppleHaptics.selection();
    onSelectTab(tabId);
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 pb-safe ${
      isAppleMode ? 'ios-glass-tabbar' : 'bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80'
    }`}>
      <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className="relative -top-2.5 flex flex-col items-center group active:scale-90 transition-all"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isActive
                    ? isAppleMode
                      ? 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 text-white ring-4 ring-cyan-500/30 shadow-cyan-500/40 scale-105'
                      : 'bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 text-white ring-4 ring-blue-500/30 shadow-blue-500/50 scale-105'
                    : isAppleMode
                      ? 'bg-slate-900/90 text-cyan-400 border border-cyan-400/40'
                      : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-blue-400 border border-blue-500/40 shadow-slate-950'
                }`}>
                  <Icon className="w-5 h-5 animate-pulse" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${
                  isActive ? (isAppleMode ? 'text-cyan-400' : 'text-sky-400') : 'text-slate-400'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-1 flex flex-col items-center relative transition-all active:scale-95 ${
                isActive 
                  ? (isAppleMode ? 'text-blue-500' : 'text-blue-400') 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-black px-1 rounded-full animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-1 tracking-tight ${
                isActive ? 'font-black text-slate-100' : ''
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <div className={`w-4 h-0.5 rounded-full mt-0.5 ${
                  isAppleMode ? 'bg-blue-500 shadow-[0_0_6px_#007aff]' : 'bg-blue-500 shadow-[0_0_6px_#3b82f6]'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
