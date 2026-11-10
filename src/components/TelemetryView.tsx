import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Lightbulb, 
  UserCheck, 
  ShieldAlert, 
  Flame, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { MasterTelemetry } from '../types';

interface TelemetryViewProps {
  telemetry: MasterTelemetry;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ telemetry }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'ptw' | 'kaizen' | 'lms' | 'incidents'>('all');
  const { ptw, kaizen, lms, incidents } = telemetry.metrics;

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'ptw', label: 'PTW' },
    { id: 'kaizen', label: 'Kaizen' },
    { id: 'lms', label: 'LMS' },
    { id: 'incidents', label: 'Incidents' },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Category Pills Header */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 1. PTW System Card */}
      {(activeCategory === 'all' || activeCategory === 'ptw') && (
        <div className="mobile-card rounded-2xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                  Permit To Work (PTW)
                </h3>
                <span className="text-[10px] text-slate-400">Live Maintenance Operations</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-100 block leading-tight">
                {ptw.total}
              </span>
              <span className="text-[9px] font-black uppercase text-red-400 bg-red-500/20 border border-red-500/30 px-1.5 py-0.5 rounded">
                {ptw.highRisk} Critical
              </span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
            {ptw.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {item.label}
                </span>
                <span className="font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          {/* Previous Shift execution comparison */}
          {ptw.yesterday && (
            <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 bg-slate-950/40 p-2.5 rounded-xl text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px] mb-1">
                Previous Shift Handover Execution:
              </span>
              <div className="flex items-center justify-between text-slate-300 font-mono">
                <span>{ptw.yesterday.total} Executed</span>
                <span className="text-slate-400">({ptw.yesterday.hot} Hot, {ptw.yesterday.height} Height, {ptw.yesterday.confined} Confined)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Kaizen Engine Card */}
      {(activeCategory === 'all' || activeCategory === 'kaizen') && (
        <div className="mobile-card rounded-2xl p-4 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                  Kaizen Continuous Pipeline
                </h3>
                <span className="text-[10px] text-slate-400">Total Submissions: {kaizen.total}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 block leading-tight">
                {kaizen.pending}
              </span>
              <span className="text-[9px] font-bold text-amber-300 uppercase">
                Pending Review
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
            {kaizen.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{item.label}</span>
                <span className="font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LMS Compliance Leaderboard Card */}
      {(activeCategory === 'all' || activeCategory === 'lms') && (
        <div className="mobile-card rounded-2xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                  Digital LMS Training
                </h3>
                <span className="text-[10px] text-slate-400">Annual Safety Compliance</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400 block leading-tight">
                {lms.compliance}%
              </span>
              <span className="text-[9px] font-bold text-emerald-300 uppercase">
                {lms.compliance >= 90 ? 'High Compliance' : 'Deficit Detected'}
              </span>
            </div>
          </div>

          {/* Department leaderboard */}
          <div className="space-y-2.5 mt-3 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
              Department Compliance Standings
            </span>
            {lms.breakdown.map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{dept.label}</span>
                  <span className={dept.count >= 95 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                    {dept.count}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${dept.count >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${dept.count}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Safety Incidents & UA/C Card */}
      {(activeCategory === 'all' || activeCategory === 'incidents') && (
        <div className="mobile-card rounded-2xl p-4 border border-rose-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                  UA/C & Incident Engine
                </h3>
                <span className="text-[10px] text-slate-400">Unsafe Observations</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-rose-400 block leading-tight">
                {incidents.totalActive}
              </span>
              <span className="text-[9px] font-bold text-rose-300 uppercase">
                Active Unresolved
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-slate-800">
            {incidents.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{item.label}</span>
                <span className="font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          {incidents.yesterday && (
            <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 bg-slate-950/40 p-2.5 rounded-xl text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px] mb-1">
                Yesterday's Fresh Observations:
              </span>
              <div className="flex items-center justify-between text-slate-300 font-mono">
                <span>{incidents.yesterday.total} Reported</span>
                <span className="text-slate-400">({incidents.yesterday.act} Acts, {incidents.yesterday.condition} Conditions)</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
