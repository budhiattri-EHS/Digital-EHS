import React from 'react';
import { Activity, Zap, Plus, AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';
import { MasterTelemetry } from '../types';
import { TelemetryService } from '../services/dataService';

interface RiskCardProps {
  telemetry: MasterTelemetry;
  onOpenShiftBriefing: () => void;
  onOpenQuickReport: () => void;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  telemetry,
  onOpenShiftBriefing,
  onOpenQuickReport
}) => {
  const { score, penaltyPTW, penaltyCAPA, penaltyLMS, status } = TelemetryService.calculateRisk(telemetry);

  const getStatusConfig = () => {
    switch (status) {
      case 'Critical':
        return {
          textColor: 'text-red-500',
          badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
          ecgClass: 'ecg-critical',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          icon: AlertOctagon
        };
      case 'Elevated':
        return {
          textColor: 'text-amber-500',
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          ecgClass: 'ecg-elevated',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
          icon: AlertTriangle
        };
      default:
        return {
          textColor: 'text-emerald-500',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          ecgClass: 'ecg-optimal',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
          icon: ShieldCheck
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // Dynamic heartbeat speed based on score: higher score = beats faster
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const beatDuration = (3.5 - (clampedScore / 100) * 2.6).toFixed(2);
  const speedClass = clampedScore >= 75 ? 'ecg-speed-rapid' : (clampedScore >= 50 ? 'ecg-speed-fast' : (clampedScore >= 25 ? 'ecg-speed-medium' : 'ecg-speed-calm'));

  return (
    <div className={`mobile-card rounded-2xl p-4 relative overflow-hidden transition-all duration-300 ${config.glow}`}>
      {/* Background blueprint grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">
            Facility Risk Index
          </h2>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase tracking-wider ${config.badgeBg}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{status}</span>
        </div>
      </div>

      {/* Main score & ECG wave */}
      <div className="flex items-baseline justify-between mb-2 relative z-10">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-black tracking-tight ${config.textColor}`}>
            {score}
          </span>
          <span className="text-sm font-bold text-slate-500">/ 100</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Target &lt; 30 pts
          </span>
          <span className="text-xs font-mono text-slate-300 font-semibold">
            {status === 'Optimal' ? 'All Clear' : status === 'Elevated' ? 'Action Required' : 'Immediate Intervention'}
          </span>
        </div>
      </div>

      {/* Clean Full-Space Heartbeat Waveform: covers complete space, beats fast as per score, clean */}
      <div className="w-full h-8 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950/60 my-3 relative shadow-inner">
        <div 
          className={`w-full h-full rounded-lg transition-all duration-500 ease-out ecg-track ${config.ecgClass} ${speedClass}`}
          style={{
            '--ecg-duration': `${beatDuration}s`
          } as React.CSSProperties}
        />
      </div>

      {/* 4-Pillar Diagnostics Breakdown */}
      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/80 text-center relative z-10">
        {/* Baseline */}
        <div className="bg-slate-800/70 p-1.5 rounded-lg border border-slate-700/50">
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block truncate">
            Baseline
          </span>
          <span className="text-xs font-bold text-slate-300">
            +10
          </span>
        </div>

        {/* PTW */}
        <div className="bg-slate-800/70 p-1.5 rounded-lg border border-slate-700/50">
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block truncate">
            PTWs
          </span>
          <span className={`text-xs font-bold ${penaltyPTW > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            +{penaltyPTW}
          </span>
        </div>

        {/* CAPA */}
        <div className="bg-slate-800/70 p-1.5 rounded-lg border border-slate-700/50">
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block truncate">
            Reports
          </span>
          <span className={`text-xs font-bold ${penaltyCAPA > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            +{penaltyCAPA}
          </span>
        </div>

        {/* LMS */}
        <div className="bg-slate-800/70 p-1.5 rounded-lg border border-slate-700/50">
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block truncate">
            LMS
          </span>
          <span className={`text-xs font-bold ${penaltyLMS > 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
            +{penaltyLMS}
          </span>
        </div>
      </div>

      {/* Tactical Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mt-3.5 relative z-10">
        <button
          onClick={onOpenShiftBriefing}
          className="btn-live-gradient flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span>Shift Briefing</span>
        </button>

        <button
          onClick={onOpenQuickReport}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold text-xs active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span>Log Hazard</span>
        </button>
      </div>
    </div>
  );
};
