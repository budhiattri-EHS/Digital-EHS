import React, { useState } from 'react';
import { 
  Search, 
  Layers, 
  FileSpreadsheet, 
  FormInput, 
  Cpu, 
  Lightbulb, 
  ShieldAlert, 
  AlertTriangle, 
  UserCheck, 
  Sparkles, 
  Flame, 
  Truck, 
  Droplets, 
  Megaphone, 
  Package, 
  BookOpen, 
  Microscope,
  Plus
} from 'lucide-react';
import { WORKSPACE_APPS } from '../services/dataService';
import { WorkspaceLink } from '../types';

interface LaunchpadViewProps {
  onOpenQuickReport: () => void;
  onOpenWorkspace: (workspace: WorkspaceLink) => void;
}

export const LaunchpadView: React.FC<LaunchpadViewProps> = ({ 
  onOpenQuickReport,
  onOpenWorkspace
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All', 
    'Core Operations', 
    'Incident & Quality', 
    'Audits & Standards', 
    'Risk & Process Safety', 
    'Health & People', 
    'Environment & Assets'
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileSpreadsheet': return FileSpreadsheet;
      case 'FormInput': return FormInput;
      case 'Cpu': return Cpu;
      case 'Lightbulb': return Lightbulb;
      case 'ShieldAlert': return ShieldAlert;
      case 'AlertTriangle': return AlertTriangle;
      case 'UserCheck': return UserCheck;
      case 'Sparkles': return Sparkles;
      case 'Flame': return Flame;
      case 'Truck': return Truck;
      case 'Droplets': return Droplets;
      case 'Megaphone': return Megaphone;
      case 'Package': return Package;
      case 'BookOpen': return BookOpen;
      case 'Microscope': return Microscope;
      case 'Layers': return Layers;
      default: return FileSpreadsheet;
    }
  };

  const filteredApps = WORKSPACE_APPS.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (app.formatNumber && app.formatNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 24 SBL enterprise modules & apps..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* App Grid - Opens In-App */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredApps.map((app) => {
          const Icon = getIcon(app.icon);
          return (
            <div
              key={app.id}
              onClick={() => onOpenWorkspace(app)}
              className="mobile-card rounded-2xl p-3.5 flex flex-col justify-between hover:border-blue-500/50 active:scale-95 transition-all group relative overflow-hidden cursor-pointer shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${app.bg} ${app.border} ${app.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {app.badge ? (
                    <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      {app.badge}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-blue-400/80 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      Open
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">
                  {app.name}
                </h4>
                {app.formatNumber && (
                  <div className="text-[9px] font-mono text-slate-400 mt-1">
                    {app.formatNumber} • {app.revNumber || 'Rev 01'}
                  </div>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">
                  {app.type}
                </span>
                <span className="text-[8px] font-bold text-slate-400 truncate max-w-[80px]">
                  {app.category}
                </span>
              </div>
            </div>
          );
        })}

        {/* Quick Add Custom Shortcut */}
        <button
          onClick={onOpenQuickReport}
          className="mobile-card rounded-2xl p-3.5 flex flex-col justify-center items-center text-center border-dashed border-slate-700 hover:border-slate-500 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-2">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-300">Quick Observation</span>
          <span className="text-[9px] text-slate-500 mt-0.5">Log Unsafe Condition</span>
        </button>
      </div>
    </div>
  );
};
