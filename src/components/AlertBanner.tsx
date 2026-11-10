import React from 'react';
import { AlertOctagon, TriangleAlert, Clock, ArrowRight } from 'lucide-react';
import { MasterTelemetry } from '../types';

interface AlertBannerProps {
  telemetry: MasterTelemetry;
  onNavigateToTelemetry: () => void;
  onNavigateToResources: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  telemetry,
  onNavigateToTelemetry,
  onNavigateToResources
}) => {
  const score = telemetry.globalRiskScore;
  const activeIncidents = telemetry.metrics.incidents.totalActive;
  const pendingKaizen = telemetry.metrics.kaizen.breakdown[0]?.count || 0;
  const criticalHazards = telemetry.criticalHazards;

  if (score >= 70) {
    return (
      <div 
        onClick={onNavigateToTelemetry}
        className="rounded-xl p-3.5 bg-gradient-to-r from-red-950/80 to-red-900/40 border border-red-500/50 shadow-lg shadow-red-950/50 flex items-start gap-3 cursor-pointer active:scale-98 transition-all"
      >
        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0 animate-pulse">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-300">
              Critical Risk Threshold Breached
            </h3>
            <span className="text-[10px] font-bold text-red-400 flex items-center">
              View <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-red-200/90 mt-0.5 leading-snug">
            Global Risk Index reached {score}%. Mandatory shop-floor intervention required for high-risk permits.
          </p>
        </div>
      </div>
    );
  }

  if (criticalHazards.length > 0) {
    const topHazard = criticalHazards[0];
    return (
      <div 
        onClick={onNavigateToResources}
        className="rounded-xl p-3 bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 shadow-md flex items-start gap-3 cursor-pointer active:scale-98 transition-all"
      >
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
          <TriangleAlert className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Top Actionable CAPA: {topHazard.source}
            </span>
            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
              {topHazard.dueDate}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-200 mt-1 line-clamp-2">
            {topHazard.desc}
          </p>
        </div>
      </div>
    );
  }

  if (pendingKaizen >= 5) {
    return (
      <div 
        onClick={onNavigateToTelemetry}
        className="rounded-xl p-3 bg-slate-800/80 border border-blue-500/30 shadow-md flex items-start gap-3 cursor-pointer active:scale-98 transition-all"
      >
        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex-shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-blue-300">
              Kaizen Approvals Pending
            </h4>
            <span className="text-[10px] font-bold text-blue-400 flex items-center">
              Review <ArrowRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            {pendingKaizen} Kaizen submissions awaiting HOD review to progress implementation.
          </p>
        </div>
      </div>
    );
  }

  return null;
};
