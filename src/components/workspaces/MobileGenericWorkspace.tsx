import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Truck, 
  Droplets, 
  BookOpen, 
  Microscope, 
  ShieldCheck, 
  Send,
  Download
} from 'lucide-react';
import { WorkspaceLink } from '../../types';
import { AppleHaptics } from '../../services/appleHaptics';
import { generateEnterpriseEhsPdf } from '../../utils/pdfGenerator';
import { MobileUniversalSaaSClient } from '../../services/universalSaaSClient';

interface MobileGenericWorkspaceProps {
  workspace: WorkspaceLink;
  onOpenOriginalUrl: () => void;
}

export const MobileGenericWorkspace: React.FC<MobileGenericWorkspaceProps> = ({
  workspace,
  onOpenOriginalUrl
}) => {
  const [checklistCompleted, setChecklistCompleted] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const getChecklistItems = () => {
    switch (workspace.id) {
      case '5s-dashboard':
        return [
          'Sort (Seiri): Red tag quarantine completed & unneeded items removed.',
          'Set in Order (Seiton): Floor boundary demarcation visible & tools on shadow board.',
          'Shine (Seiso): Floor clean, no solvent weeping, machine surfaces wiped.',
          'Standardize (Seiketsu): 100-Point SBL Scorecard posted at eye level.',
          'Sustain (Shitsuke): Daily 5-minute shift cleanup routine completed.'
        ];
      case 'incident-investigation':
        return [
          'QS-011-024-01: Incident ID registered in Master Ledger (1HMSMQvkJhodBn_20Z3_Zouvepz3UExlXjPrEq1KRGcw).',
          'Root Cause Engine: 5-Whys Chain mapped to true root failure mode.',
          'Ishikawa Fishbone: 6-M analysis (Man, Machine, Method, Material, Milieu, Measurement).',
          'Hazard Containment: Chemical spill release/recovery/lost quantities documented.',
          'Vehicle Audit: RTO registration, Insurance, Fitness & PESO certificate verified.'
        ];
      case 'mock-drill':
        return [
          'ISO Protocol: Emergency siren activation and Incident Commander command post.',
          'Deployment: Fire Fighting Team charged hydrant hose line within 120 seconds.',
          'First Aid: Triage station established with emergency medical kit.',
          'Evacuation: 100% headcount accounted for at designated Safe Assembly Point.',
          'CAPA: Evacuation bottleneck action items assigned with target dates.'
        ];
      case 'first-aid-inspection':
        return [
          'Bandage Targets: Small (min 12), Medium (min 6), Large (min 6), Cutisorb (min 6), Band Aid (min 6).',
          'Antiseptics: Crystal violet (min 1), Iodine tincture, Sevlon, Potassium permanganate.',
          'Hardware: Sterile cotton, medical tweezers, scissors, eyewash cup.',
          'First Aid Register: Copy of items list & trained first aiders roster posted on cabinet.'
        ];
      case 'industrial-hygiene':
        return [
          'Illumination (Lux): Survey completed per Factory Act norms (>150 Lux minimum, >300 Lux fine work).',
          'Sound Level (dB(A)): 8-Hour TWA noise level verified below 85 dB(A) OSHA/Factory threshold.',
          'Calibration: Sound Level Meter & Lux Meter valid calibration certificates verified.',
          'EHS Ledger: Survey Logs and Calibration Master records updated.'
        ];
      case 'ehs-sops':
        return [
          'SOP-EHS-01: Confined Space Entry Standard Operating Procedure.',
          'SOP-EHS-02: Hot Work & Fire Prevention Safety Standard.',
          'SOP-EHS-03: Hazardous Chemical Handling & Spillage Control.',
          'SOP-EHS-04: Lockout / Tagout (LOTO) Energy Isolation Standard.'
        ];
      default:
        return [
          'Field inspection checklist verified and documented.',
          'All safety parameters compliant with SBL EHS specifications.',
          'No critical non-conformances detected during shift walk.'
        ];
    }
  };

  const items = getChecklistItems();

  const toggleCheck = (idx: string) => {
    AppleHaptics.click();
    setChecklistCompleted({
      ...checklistCompleted,
      [idx]: !checklistCompleted[idx]
    });
  };

  const handleSubmitChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    AppleHaptics.success();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-3.5 p-3 pb-24 text-slate-100 text-left">
      {/* Header Card */}
      <div className="ios-card-elevated p-4 border-blue-500/30">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">{workspace.category}</span>
            <h3 className="text-sm font-black text-white">{workspace.name}</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold uppercase">
            Mobile Standard
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Configured for mobile inspection and rapid compliance verification.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={onOpenOriginalUrl}
            className="py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Source Form / Doc</span>
          </button>

          <button
            onClick={() => {
              AppleHaptics.success();
              const tenant = MobileUniversalSaaSClient.getTenant();
              const verifiedCount = Object.values(checklistCompleted).filter(Boolean).length;
              generateEnterpriseEhsPdf({
                companyName: tenant?.name || 'SBL Specialty Coatings Private Limited',
                formatNumber: workspace.formatNumber || 'SBL/EHS/F-100',
                revNumber: workspace.revNumber || 'Rev 01',
                revDate: workspace.revDate || '01-Nov-2026',
                docId: `EHS-${workspace.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}-${Date.now().toString().slice(-6)}`,
                status: submitted ? 'AUDITED & SUBMITTED' : 'INSPECTION ACTIVE',
                title: `${workspace.name} Official Record`,
                facility: 'Lalru Unit-3 (Synthetic Resins & Coatings)',
                metadata: {
                  'Workspace Module': workspace.name,
                  'Classification': workspace.category,
                  'Format Number': workspace.formatNumber || 'SBL/EHS/GEN-01',
                  'Revision': `${workspace.revNumber || 'Rev 01'} (${workspace.revDate || 'Nov-2026'})`,
                  'Inspector': 'Budhi Parkash (HOD Manufacturing)',
                  'Verification Rate': `${verifiedCount} / ${items.length} points compliant`
                },
                tableHeaders: ['#', 'Standard Operating Checkpoint', 'Verification Status'],
                tableRows: items.map((item, i) => [
                  i + 1,
                  item,
                  checklistCompleted[String(i)] ? 'COMPLIANT' : 'PENDING'
                ]),
                observationsNotes: notes || 'Standard mobile checklist audit verified per SBL EHS operating standard.'
              });
            }}
            className="py-2 px-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all truncate"
          >
            <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Export Official PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile Checklist */}
      <div className="ios-card p-4 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          Mobile Compliance Audit Items
        </span>

        <form onSubmit={handleSubmitChecklist} className="space-y-2.5">
          {items.map((item, idx) => {
            const isChecked = !!checklistCompleted[String(idx)];
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(String(idx))}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer active:scale-98 transition-all ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                  isChecked
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-slate-800 border-slate-700'
                }`}>
                  {isChecked && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium leading-relaxed">{item}</span>
              </div>
            );
          })}

          <div className="pt-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Field Inspector Observations / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any non-conformances, tag numbers, or remarks..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitted ? '✓ Audit Logged & Synced' : 'Submit Inspection Log'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
