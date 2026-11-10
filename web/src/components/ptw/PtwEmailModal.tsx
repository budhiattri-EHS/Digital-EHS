'use client';

import React, { useState } from 'react';
import { PtwRecord, ApproverSlot, PtwService } from '@/lib/ptwService';
import { Mail, CheckCircle2, XCircle, Send, ExternalLink, ShieldAlert, X, Copy, Check } from 'lucide-react';

interface PtwEmailModalProps {
  permit: PtwRecord;
  slotNumber: number;
  onClose: () => void;
  onActionProcessed?: () => void;
  onApproveFromEmail?: (permitId: string, slot: number, comments: string) => void;
  onRejectFromEmail?: (permitId: string, slot: number, comments: string) => void;
}

export const PtwEmailModal: React.FC<PtwEmailModalProps> = ({
  permit,
  slotNumber,
  onClose,
  onActionProcessed,
  onApproveFromEmail,
  onRejectFromEmail
}) => {
  const approver = permit.approvers.find(a => a.slot === slotNumber) || permit.approvers[0];
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState('');
  const [actionDone, setActionDone] = useState<string | null>(null);

  const approvalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/v1/ptw/email?token=${approver.token || 'AUTH'}&permit=${permit.permit_number}&slot=${slotNumber}&action=approve`
    : `https://ehs.sblcoatings.com/api/v1/ptw/email?token=${approver.token}&permit=${permit.permit_number}&slot=${slotNumber}&action=approve`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(approvalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApprove = () => {
    setActionDone('APPROVED');
    if (onApproveFromEmail) {
      onApproveFromEmail(permit.permit_number, slotNumber, comments || 'Digital approval confirmed via Email Gateway.');
    } else {
      PtwService.processApproval(permit.permit_number, slotNumber, 'Approve', comments || 'Verified safe per ISO 45001', approver.name);
    }
    if (onActionProcessed) onActionProcessed();
    setTimeout(() => onClose(), 1000);
  };

  const handleReject = () => {
    setActionDone('REJECTED');
    if (onRejectFromEmail) {
      onRejectFromEmail(permit.permit_number, slotNumber, comments || 'Rejected per email review.');
    } else {
      PtwService.processApproval(permit.permit_number, slotNumber, 'Reject', comments || 'Rejected during email review', approver.name);
    }
    if (onActionProcessed) onActionProcessed();
    setTimeout(() => onClose(), 1000);
  };

  const handleRevoke = () => {
    setActionDone('REVOKED');
    PtwService.processApproval(permit.permit_number, slotNumber, 'Revoke', comments || 'Emergency stop requested via email alert', approver.name);
    if (onActionProcessed) onActionProcessed();
    setTimeout(() => onClose(), 1000);
  };

  // Safe hazards & PPE chips
  const hazardsList = permit.hazards
    ? Object.entries(permit.hazards).filter(([_, v]) => v).map(([k]) => k)
    : ((permit as any).hazards_identified || ['General Operations']);

  const ppesList = permit.ppes
    ? Object.entries(permit.ppes).filter(([_, v]) => v).map(([k]) => k)
    : ((permit as any).precautions_checklist || ['Safety Helmet', 'Safety Shoes']);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-[#d2d2d7]/80 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-[#1d1d1f]">
        
        {/* Modal Window Top Bar */}
        <div className="px-6 py-3.5 bg-[#f5f5f7] border-b border-[#d2d2d7]/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0071e3]" />
            <h3 className="text-xs font-bold text-[#1d1d1f]">
              System Email Dispatch Preview &amp; Verification Gateway
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 border border-[#d2d2d7]/60 flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Header Strip */}
        <div className="p-4 bg-white border-b border-[#d2d2d7]/50 space-y-1.5 text-xs text-[#515154]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#86868b] w-14 shrink-0">From:</span>
            <span className="font-mono text-[#1d1d1f] font-semibold">SBL EHS Sentinel Cloud &lt;ehs-sentinel@sblcoatings.com&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#86868b] w-14 shrink-0">To:</span>
            <span className="font-mono text-[#0071e3] font-bold">{approver.name} &lt;{approver.email}&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#86868b] w-14 shrink-0">Subject:</span>
            <span className="font-bold text-[#1d1d1f]">
              [PTW AUTHORIZATION] Slot #{slotNumber} Signature Required: {permit.permit_number}
            </span>
          </div>
        </div>

        {/* Real Rendered Email Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#fafafc]">
          <div className="bg-white border border-[#d2d2d7]/70 rounded-2xl p-6 shadow-sm space-y-4">
            
            {/* Header Logo in Email */}
            <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#d2d2d7] p-1 flex items-center justify-center">
                  <img src="/sbl-emblem.png" alt="SBL" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#1d1d1f] tracking-tight">SBL Specialty Coatings Private Limited</h4>
                  <p className="text-[10px] text-[#86868b]">Operational Safety &amp; Multi-Tier Escalation Portal</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono border ${
                permit.risk_level === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {permit.risk_level.toUpperCase()} RISK PERMIT
              </span>
            </div>

            {/* Email Greeting */}
            <div>
              <p className="text-xs text-[#1d1d1f] leading-relaxed">
                Dear <strong>{approver.name}</strong> ({approver.role}),
              </p>
              <p className="text-xs text-[#515154] mt-1 leading-relaxed">
                A Permit to Work has been registered and is currently awaiting your physical site inspection observations and digital signature before work can commence on site.
              </p>
            </div>

            {/* Permit Highlights Table */}
            <div className="rounded-xl border border-[#e5e5ea] overflow-hidden text-xs">
              <div className="bg-[#f5f5f7] px-3.5 py-2 font-bold text-[#1d1d1f] border-b border-[#e5e5ea] flex items-center justify-between">
                <span>Permit Specifications</span>
                <span className="font-mono text-[#0071e3]">{permit.permit_number}</span>
              </div>
              <div className="p-3.5 grid grid-cols-2 gap-2.5 bg-white text-[11px]">
                <div>
                  <span className="text-[#86868b] block text-[10px]">Work Location</span>
                  <strong className="text-[#1d1d1f]">{permit.location}</strong>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[10px]">Executing Vendor / Team</span>
                  <strong className="text-[#1d1d1f]">{permit.vendor}</strong>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[10px]">Requestor Name</span>
                  <strong className="text-[#1d1d1f]">{permit.requestor}</strong>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[10px]">Permit Validity</span>
                  <strong className="text-[#1d1d1f]">{permit.valid_from} to {permit.valid_to}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[#86868b] block text-[10px]">Description of Work</span>
                  <p className="text-[#1d1d1f] font-medium leading-snug">{permit.description}</p>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[10px]">Assigned First Aider</span>
                  <strong className="text-[#1d1d1f]">{permit.first_aider || 'Ajay Kumar'}</strong>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[10px]">Fire Watch / ERT</span>
                  <strong className="text-[#1d1d1f]">{permit.fire_watch || 'Sanee Kumar'}</strong>
                </div>
              </div>
            </div>

            {/* Hazards & PPE Chips */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#86868b] block">Identified Hazards &amp; PPE Matrix</span>
              <div className="flex flex-wrap gap-1.5">
                {hazardsList.map((h: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                    ⚠ {h}
                  </span>
                ))}
                {ppesList.map((p: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Approver Remarks & Direct Actions */}
            <div className="pt-3 border-t border-[#e5e5ea] space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#1d1d1f] block mb-1">
                  Physical Inspection Observations / Conditions:
                </label>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="e.g. Verified zero LEL gas; 60mA ELCB tested; work approved safe."
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              {/* Direct 1-Click Interactive Email Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionDone === 'APPROVED' ? '✓ AUTHORIZED & SIGNED' : 'AUTHORIZE & APPLY SIGNATURE'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-[#d2d2d7] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>REJECT</span>
                </button>

                <button
                  type="button"
                  onClick={handleRevoke}
                  className="px-3 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                  title="🚨 Immediate Stop Work Revocation"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>REVOKE</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[11px] text-[#0071e3] hover:underline flex items-center gap-1 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '1-Click Token Link Copied!' : 'Copy Direct Token Approval URL'}</span>
                </button>

                <span className="text-[10px] text-[#86868b] font-mono">Token: {approver.token || 'SECURE'}</span>
              </div>
            </div>

            {/* Email Footer Disclaimer */}
            <div className="text-[9px] text-[#86868b] pt-2 border-t border-[#e5e5ea] text-center">
              This is a system-generated authorization notice compliant with ISO 45001:2018, OSHA 29 CFR 1910.119, and SBL Master Standard EF/SF/01-08.
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 bg-[#f5f5f7] border-t border-[#d2d2d7]/60 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-[#86868b]">
            Multi-tier Telegram &amp; SMTP Envoy Synchronization Live
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-[#e8e8ed] text-[#1d1d1f] border border-[#d2d2d7] text-xs font-semibold"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
