import React, { useState } from 'react';
import { 
  X, 
  ClipboardCheck, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Activity, 
  AlertOctagon, 
  Info, 
  FileWarning, 
  GraduationCap, 
  Clock 
} from 'lucide-react';
import { MasterTelemetry } from '../types';

interface ShiftHandoverModalProps {
  telemetry: MasterTelemetry;
  facility: string;
  onClose: () => void;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  telemetry,
  facility,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const m = telemetry.metrics;

  const isMonday = new Date().getDay() === 1;
  const prevDayText = isMonday ? 'Saturday' : 'yesterday';

  const yPtw = m.ptw.yesterday || { total: 8, hot: 1, confined: 1, height: 2, cold: 4 };
  const yInc = m.incidents.yesterday || { total: 3, act: 1, condition: 2, nearMiss: 0 };

  const riskBadge = telemetry.globalRiskScore >= 70 
    ? 'bg-red-500/20 text-red-400 border-red-500/40' 
    : telemetry.globalRiskScore >= 30 
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

  const generatePlainText = () => {
    return `*SBL SPECIALTY COATINGS - EHS SHIFT HANDOVER BRIEFING*
Facility: ${facility}
Date & Time: ${new Date().toLocaleString()}

*1. PREVIOUS SHIFT REVIEW (${prevDayText.toUpperCase()}):*
• Permits Executed: ${yPtw.total} (${yPtw.hot} Hot, ${yPtw.confined} Confined, ${yPtw.height} Height, ${yPtw.cold} Cold)
• Safety Observations: ${yInc.total} new logs (${yInc.act} Unsafe Acts, ${yInc.condition} Conditions, ${yInc.nearMiss} Near Misses)

*2. LIVE OPERATIONAL STATUS:*
• Facility Risk Index: ${telemetry.globalRiskScore}/100
• Active Shop-floor Permits: ${m.ptw.total} (${m.ptw.highRisk} Critical High-Risk)

*3. COMPLIANCE & CAPA DEBT:*
• Actionable Incident CAPA: ${m.incidents.totalActive} open observations
• LMS Training Compliance: ${m.lms.compliance}%
• Stalled Kaizens: ${m.kaizen.pending} pending HOD review

Generated via SBL EHS Mobile Control Tower.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EHS Shift Handover - ${facility}`,
          text: generatePlainText()
        });
      } catch (err) {
        console.warn('Share cancelled or not supported:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                Tactical Shift Handover
              </h3>
              <p className="text-[10px] text-slate-400">{facility} // Real-Time Synopsis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
          {/* Section 1: Previous Shift */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Previous Shift Review ({prevDayText})
            </span>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-100">{yPtw.total} permits</strong> were executed {prevDayText} ({yPtw.hot} Hot, {yPtw.confined} Confined, {yPtw.height} Height, {yPtw.cold} Cold).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-100">{yInc.total} observations</strong> logged {prevDayText}: {yInc.act} Unsafe Acts, {yInc.condition} Conditions, {yInc.nearMiss} Near Misses.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 2: Live Operations */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Live Operational Status
            </span>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Facility Risk Index is calibrated at{' '}
                  <span className={`px-2 py-0.5 rounded border font-mono font-bold ${riskBadge}`}>
                    {telemetry.globalRiskScore}/100
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FileWarning className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-100">{m.ptw.total} active permits</strong> spanning the floor (<span className="text-red-400 font-bold">{m.ptw.highRisk} Critical High-Risk</span>).
                </span>
              </li>
            </ul>
          </div>

          {/* Section 3: Compliance & Backlog */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Compliance & Actionable Backlog
            </span>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-red-400">{m.incidents.totalActive} unresolved</strong> safety incidents requiring CAPA closure.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  LMS compliance stands at <strong className="text-slate-100">{m.lms.compliance}%</strong> against the annual goal.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-100">{m.kaizen.pending} Kaizens</strong> awaiting HOD review.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950/80">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs active:scale-95 transition-all"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-900/40 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Handover</span>
          </button>
        </div>
      </div>
    </div>
  );
};
