'use client';

import React, { useState } from 'react';
import { PtwRecord, PtwService } from '@/lib/ptwService';
import { supabase } from '@/lib/supabaseClient';
import {
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserCheck,
  ClipboardList,
  Flame,
  Zap,
  Lock,
  Layers,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface AdminEditPermitModalProps {
  permit: PtwRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: PtwRecord) => void;
}

export const AdminEditPermitModal: React.FC<AdminEditPermitModalProps> = ({
  permit,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'personnel' | 'approvals' | 'checklists'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State initialized from permit
  const [form, setForm] = useState({
    // Core & Status
    permit_number: permit.permit_number,
    status: permit.status,
    permit_type: permit.permit_type || (permit.gateways?.hot_work ? 'Hot Work' : 'General / Cold Work'),
    risk_level: permit.risk_level,
    location: permit.location || '',
    title: permit.title || permit.description || '',
    description: permit.description || permit.title || '',
    emergency_contact: permit.emergency_contact || '110',
    valid_from: permit.valid_from || '',
    valid_to: permit.valid_to || '',

    // Personnel
    requestor_name: permit.requestor_name || permit.requestor || '',
    vendor_name: permit.vendor_name || permit.vendor || '',
    contractor_induction_date: permit.contractor_induction_date || '',
    contractor_esi_id: permit.contractor_esi_id || permit.contractor_compliance_id || '',
    workers_names: permit.workers_names || permit.workers || '',
    induction_numbers: permit.induction_numbers || permit.induction_training_numbers || '',
    first_aider_name: permit.first_aider_name || permit.first_aider || '',
    ert_member_name: permit.ert_member_name || permit.ert_member || '',
    fire_watch_name: permit.fire_watch_name || permit.fire_watch || '',
    assembly_point: permit.assembly_point || '1',
    executing_supervisor: permit.executing_supervisor || permit.supervisor_executing || '',
    beneficiary_supervisor: permit.beneficiary_supervisor || permit.supervisor_beneficiary || '',

    // Approvers 1-5
    approver_1_role: permit.approver_1_role || permit.approvers?.[0]?.role || 'Area Incharge',
    approver_1_name: permit.approver_1_name || permit.approvers?.[0]?.name || '',
    approver_1_email: permit.approver_1_email || permit.approvers?.[0]?.email || '',
    approver_1_status: permit.approver_1_status || permit.approvers?.[0]?.status || 'Approved',
    approver_1_timestamp: permit.approver_1_timestamp || permit.approvers?.[0]?.timestamp || '',
    approver_1_comments: permit.approver_1_comments || permit.approvers?.[0]?.comments || '',
    approver_1_token: permit.approver_1_token || permit.approvers?.[0]?.token || '',

    approver_2_role: permit.approver_2_role || permit.approvers?.[1]?.role || 'Engineering Incharge',
    approver_2_name: permit.approver_2_name || permit.approvers?.[1]?.name || '',
    approver_2_email: permit.approver_2_email || permit.approvers?.[1]?.email || '',
    approver_2_status: permit.approver_2_status || permit.approvers?.[1]?.status || 'Approved',
    approver_2_timestamp: permit.approver_2_timestamp || permit.approvers?.[1]?.timestamp || '',
    approver_2_comments: permit.approver_2_comments || permit.approvers?.[1]?.comments || '',
    approver_2_token: permit.approver_2_token || permit.approvers?.[1]?.token || '',

    approver_3_role: permit.approver_3_role || permit.approvers?.[2]?.role || 'EHS Manager',
    approver_3_name: permit.approver_3_name || permit.approvers?.[2]?.name || '',
    approver_3_email: permit.approver_3_email || permit.approvers?.[2]?.email || '',
    approver_3_status: permit.approver_3_status || permit.approvers?.[2]?.status || 'Approved',
    approver_3_timestamp: permit.approver_3_timestamp || permit.approvers?.[2]?.timestamp || '',
    approver_3_comments: permit.approver_3_comments || permit.approvers?.[2]?.comments || '',
    approver_3_token: permit.approver_3_token || permit.approvers?.[2]?.token || '',

    approver_4_role: permit.approver_4_role || permit.approvers?.[3]?.role || 'Engineering HOD',
    approver_4_name: permit.approver_4_name || permit.approvers?.[3]?.name || '',
    approver_4_email: permit.approver_4_email || permit.approvers?.[3]?.email || '',
    approver_4_status: permit.approver_4_status || permit.approvers?.[3]?.status || 'N/A',
    approver_4_timestamp: permit.approver_4_timestamp || permit.approvers?.[3]?.timestamp || '',
    approver_4_comments: permit.approver_4_comments || permit.approvers?.[3]?.comments || '',
    approver_4_token: permit.approver_4_token || permit.approvers?.[3]?.token || '',

    approver_5_role: permit.approver_5_role || permit.approvers?.[4]?.role || 'Area HOD',
    approver_5_name: permit.approver_5_name || permit.approvers?.[4]?.name || '',
    approver_5_email: permit.approver_5_email || permit.approvers?.[4]?.email || '',
    approver_5_status: permit.approver_5_status || permit.approvers?.[4]?.status || 'N/A',
    approver_5_timestamp: permit.approver_5_timestamp || permit.approvers?.[4]?.timestamp || '',
    approver_5_comments: permit.approver_5_comments || permit.approvers?.[4]?.comments || '',
    approver_5_token: permit.approver_5_token || permit.approvers?.[4]?.token || '',

    final_closure_time: permit.final_closure_time || permit.final_closure?.closed_at || '',
    final_closure_comments: permit.final_closure_comments || permit.final_closure?.comments || '',
    report_pdf_url: permit.report_pdf_url || permit.pdf_url || '',

    // Safety & Isolation
    loto_required: permit.loto_required || false,
    loto_details: permit.loto_details || {
      electrical: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: '', try_out_successful: '' },
      mechanical: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: '', try_out_successful: '' },
      hydraulic: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: '', try_out_successful: '' },
      pneumatic: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: '', try_out_successful: '' },
      other: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: '', try_out_successful: '' }
    },
    hazards_identified: Array.isArray(permit.hazards_identified)
      ? permit.hazards_identified
      : Object.keys(permit.hazards || {}).filter(k => permit.hazards[k]),
    ppe_issued: Array.isArray(permit.ppe_issued)
      ? permit.ppe_issued
      : Object.keys(permit.ppes || {}).filter(k => permit.ppes[k]),
    precautions_checklist: Array.isArray(permit.precautions_checklist) ? permit.precautions_checklist : [],
    gas_test_records: Array.isArray(permit.gas_test_records) ? permit.gas_test_records : []
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLotoSubField = (type: string, key: string, val: any) => {
    setForm(prev => ({
      ...prev,
      loto_details: {
        ...prev.loto_details,
        [type]: {
          ...(prev.loto_details?.[type] || {}),
          [key]: val
        }
      }
    }));
  };

  const handleChecklistValueChange = (index: number, newVal: string) => {
    const updated = [...form.precautions_checklist];
    updated[index] = { ...updated[index], value: newVal };
    setForm(prev => ({ ...prev, precautions_checklist: updated }));
  };

  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: any = {
        status: form.status,
        permit_type: form.permit_type,
        risk_level: form.risk_level,
        location: form.location,
        title: form.title,
        description: form.description,
        emergency_contact: form.emergency_contact,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : new Date().toISOString(),
        valid_to: form.valid_to ? new Date(form.valid_to).toISOString() : new Date().toISOString(),
        requestor_name: form.requestor_name,
        vendor_name: form.vendor_name,
        contractor_induction_date: form.contractor_induction_date,
        contractor_esi_id: form.contractor_esi_id,
        workers_names: form.workers_names,
        induction_numbers: form.induction_numbers,
        first_aider_name: form.first_aider_name,
        ert_member_name: form.ert_member_name,
        fire_watch_name: form.fire_watch_name,
        assembly_point: form.assembly_point,
        executing_supervisor: form.executing_supervisor,
        beneficiary_supervisor: form.beneficiary_supervisor,

        approver_1_role: form.approver_1_role,
        approver_1_name: form.approver_1_name,
        approver_1_email: form.approver_1_email,
        approver_1_status: form.approver_1_status,
        approver_1_timestamp: form.approver_1_timestamp,
        approver_1_comments: form.approver_1_comments,
        approver_1_token: form.approver_1_token,

        approver_2_role: form.approver_2_role,
        approver_2_name: form.approver_2_name,
        approver_2_email: form.approver_2_email,
        approver_2_status: form.approver_2_status,
        approver_2_timestamp: form.approver_2_timestamp,
        approver_2_comments: form.approver_2_comments,
        approver_2_token: form.approver_2_token,

        approver_3_role: form.approver_3_role,
        approver_3_name: form.approver_3_name,
        approver_3_email: form.approver_3_email,
        approver_3_status: form.approver_3_status,
        approver_3_timestamp: form.approver_3_timestamp,
        approver_3_comments: form.approver_3_comments,
        approver_3_token: form.approver_3_token,

        approver_4_role: form.approver_4_role,
        approver_4_name: form.approver_4_name,
        approver_4_email: form.approver_4_email,
        approver_4_status: form.approver_4_status,
        approver_4_timestamp: form.approver_4_timestamp,
        approver_4_comments: form.approver_4_comments,
        approver_4_token: form.approver_4_token,

        approver_5_role: form.approver_5_role,
        approver_5_name: form.approver_5_name,
        approver_5_email: form.approver_5_email,
        approver_5_status: form.approver_5_status,
        approver_5_timestamp: form.approver_5_timestamp,
        approver_5_comments: form.approver_5_comments,
        approver_5_token: form.approver_5_token,

        final_closure_time: form.final_closure_time,
        final_closure_comments: form.final_closure_comments,
        report_pdf_url: form.report_pdf_url,

        loto_required: form.loto_required,
        loto_details: form.loto_details,
        hazards_identified: form.hazards_identified,
        ppe_issued: form.ppe_issued,
        ppe_required: form.ppe_issued,
        precautions_checklist: form.precautions_checklist,
        gas_test_records: form.gas_test_records,
        updated_at: new Date().toISOString()
      };

      // 1. Direct Supabase Cloud Update
      const { error: supaErr } = await supabase
        .from('ptw_permits')
        .update(payload)
        .eq('permit_number', form.permit_number);

      if (supaErr) {
        throw new Error(`Supabase error: ${supaErr.message}`);
      }

      // 2. Local State & Service Sync
      const updatedPtwRecord: PtwRecord = {
        ...permit,
        ...payload,
        requestor: form.requestor_name,
        vendor: form.vendor_name,
        workers: form.workers_names,
        contractor_compliance_id: form.contractor_esi_id,
        induction_training_numbers: form.induction_numbers,
        first_aider: form.first_aider_name,
        ert_member: form.ert_member_name,
        fire_watch: form.fire_watch_name,
        supervisor_executing: form.executing_supervisor,
        supervisor_beneficiary: form.beneficiary_supervisor,
        approvers: [
          { slot: 1, role: form.approver_1_role, name: form.approver_1_name, email: form.approver_1_email, status: form.approver_1_status as any, timestamp: form.approver_1_timestamp, comments: form.approver_1_comments, token: form.approver_1_token },
          { slot: 2, role: form.approver_2_role, name: form.approver_2_name, email: form.approver_2_email, status: form.approver_2_status as any, timestamp: form.approver_2_timestamp, comments: form.approver_2_comments, token: form.approver_2_token },
          { slot: 3, role: form.approver_3_role, name: form.approver_3_name, email: form.approver_3_email, status: form.approver_3_status as any, timestamp: form.approver_3_timestamp, comments: form.approver_3_comments, token: form.approver_3_token },
          { slot: 4, role: form.approver_4_role, name: form.approver_4_name, email: form.approver_4_email, status: form.approver_4_status as any, timestamp: form.approver_4_timestamp, comments: form.approver_4_comments, token: form.approver_4_token },
          { slot: 5, role: form.approver_5_role, name: form.approver_5_name, email: form.approver_5_email, status: form.approver_5_status as any, timestamp: form.approver_5_timestamp, comments: form.approver_5_comments, token: form.approver_5_token }
        ]
      };

      PtwService.updatePermit(form.permit_number, updatedPtwRecord);
      setSuccessMsg(`Changes saved successfully to Supabase for ${form.permit_number}!`);

      setTimeout(() => {
        onSuccess(updatedPtwRecord);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to update permit in Supabase:', err);
      setErrorMsg(err.message || 'Failed to save changes to Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#d2d2d7]/80 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d2d2d7]/50 flex items-center justify-between bg-[#fbfbfd]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#1d1d1f]">Master Admin Permit Editor</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] font-bold">
                  {form.permit_number}
                </span>
              </div>
              <p className="text-xs text-[#86868b]">
                Direct Supabase 164-Column Parity & Audit Override
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#86868b] hover:text-[#1d1d1f] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#d2d2d7]/50 px-6 bg-white overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <FileText className="w-4 h-4" />
            General & Scope
          </button>
          <button
            onClick={() => setActiveTab('personnel')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'personnel'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Personnel & Contractors
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'approvals'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <Shield className="w-4 h-4" />
            5-Tier Approvers & Audit
          </button>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'checklists'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Checklists, LOTO & Gas
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: GENERAL & SCOPE */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Permit Number</label>
                  <input
                    type="text"
                    disabled
                    value={form.permit_number}
                    className="w-full p-2.5 rounded-xl bg-[#f5f5f7] border border-[#d2d2d7] text-xs font-mono font-bold text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Permit Status</label>
                  <select
                    value={form.status}
                    onChange={e => handleChange('status', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-bold text-[#1d1d1f]"
                  >
                    <option value="Closed">Closed</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending L1">Pending L1 (Area Incharge)</option>
                    <option value="Pending L2">Pending L2 (Engineering Incharge)</option>
                    <option value="Pending L3">Pending L3 (EHS Manager)</option>
                    <option value="Pending L4">Pending L4 (Engineering HOD)</option>
                    <option value="Pending L5">Pending L5 (Area HOD)</option>
                    <option value="Pending Area Incharge">Pending Area Incharge (Handback)</option>
                    <option value="Pending Safety">Pending Safety</option>
                    <option value="Rejected">Rejected</option>
                    <option value="REVOKED (SAFETY VIOLATION)">REVOKED (SAFETY VIOLATION)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Risk Level</label>
                  <select
                    value={form.risk_level}
                    onChange={e => handleChange('risk_level', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-bold text-[#1d1d1f]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Permit Type / Gateways</label>
                  <input
                    type="text"
                    value={form.permit_type}
                    onChange={e => handleChange('permit_type', e.target.value)}
                    placeholder="e.g. General / Cold Work, Hot Work, Height Work"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Department / Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => handleChange('location', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#86868b] mb-1">Description of Work</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => {
                    handleChange('description', e.target.value);
                    handleChange('title', e.target.value);
                  }}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Emergency Contact No.</label>
                  <input
                    type="text"
                    value={form.emergency_contact}
                    onChange={e => handleChange('emergency_contact', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Valid From (ISO / Date)</label>
                  <input
                    type="text"
                    value={form.valid_from}
                    onChange={e => handleChange('valid_from', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Valid To (ISO / Date)</label>
                  <input
                    type="text"
                    value={form.valid_to}
                    onChange={e => handleChange('valid_to', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONNEL & CONTRACTORS */}
          {activeTab === 'personnel' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Requestor Name</label>
                  <input
                    type="text"
                    value={form.requestor_name}
                    onChange={e => handleChange('requestor_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-bold text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Vendor / Maintenance Name</label>
                  <input
                    type="text"
                    value={form.vendor_name}
                    onChange={e => handleChange('vendor_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Contractor Induction Date</label>
                  <input
                    type="text"
                    value={form.contractor_induction_date}
                    onChange={e => handleChange('contractor_induction_date', e.target.value)}
                    placeholder="YYYY-MM-DD or As per Gate"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Contractor Compliance ID (ESI/Insurance)</label>
                  <input
                    type="text"
                    value={form.contractor_esi_id}
                    onChange={e => handleChange('contractor_esi_id', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#86868b] mb-1">Names of Persons Performing the Job (Workers)</label>
                <textarea
                  rows={2}
                  value={form.workers_names}
                  onChange={e => handleChange('workers_names', e.target.value)}
                  placeholder="e.g. Ramesh Kumar, Suresh Singh, Vijay"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Induction Training Numbers</label>
                  <input
                    type="text"
                    value={form.induction_numbers}
                    onChange={e => handleChange('induction_numbers', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Rescue Assembly Point No.</label>
                  <input
                    type="text"
                    value={form.assembly_point}
                    onChange={e => handleChange('assembly_point', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Assigned First Aider Name</label>
                  <input
                    type="text"
                    value={form.first_aider_name}
                    onChange={e => handleChange('first_aider_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Assigned ERT Member Name</label>
                  <input
                    type="text"
                    value={form.ert_member_name}
                    onChange={e => handleChange('ert_member_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Assigned Fire Watch Name</label>
                  <input
                    type="text"
                    value={form.fire_watch_name}
                    onChange={e => handleChange('fire_watch_name', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Supervisor (Executing Department)</label>
                  <input
                    type="text"
                    value={form.executing_supervisor}
                    onChange={e => handleChange('executing_supervisor', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#86868b] mb-1">Supervisor (Beneficiary Department)</label>
                  <input
                    type="text"
                    value={form.beneficiary_supervisor}
                    onChange={e => handleChange('beneficiary_supervisor', e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 5-TIER APPROVERS & AUDIT */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map(tier => {
                const roleKey = `approver_${tier}_role` as keyof typeof form;
                const nameKey = `approver_${tier}_name` as keyof typeof form;
                const emailKey = `approver_${tier}_email` as keyof typeof form;
                const statusKey = `approver_${tier}_status` as keyof typeof form;
                const timeKey = `approver_${tier}_timestamp` as keyof typeof form;
                const commentKey = `approver_${tier}_comments` as keyof typeof form;

                return (
                  <div key={tier} className="p-4 rounded-2xl bg-[#fbfbfd] border border-[#d2d2d7]/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#1d1d1f] flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[10px]">
                          {tier}
                        </span>
                        Tier {tier}: {(form[roleKey] as string) || `Approver ${tier}`}
                      </span>
                      <select
                        value={(form[statusKey] as string) || 'Pending'}
                        onChange={e => handleChange(statusKey, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-[#d2d2d7] text-[11px] font-bold bg-white"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                        <option value="N/A - General Work">N/A - General Work</option>
                        <option value="Waiting">Waiting</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#86868b] mb-0.5">Name</label>
                        <input
                          type="text"
                          value={(form[nameKey] as string) || ''}
                          onChange={e => handleChange(nameKey, e.target.value)}
                          className="w-full p-2 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#86868b] mb-0.5">Email</label>
                        <input
                          type="email"
                          value={(form[emailKey] as string) || ''}
                          onChange={e => handleChange(emailKey, e.target.value)}
                          className="w-full p-2 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#86868b] mb-0.5">Approval Timestamp (Audit)</label>
                        <input
                          type="text"
                          value={(form[timeKey] as string) || ''}
                          onChange={e => handleChange(timeKey, e.target.value)}
                          placeholder="ISO string or Date"
                          className="w-full p-2 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#86868b] mb-0.5">Approver Comments</label>
                      <input
                        type="text"
                        value={(form[commentKey] as string) || ''}
                        onChange={e => handleChange(commentKey, e.target.value)}
                        placeholder="e.g. Area verified safe to execute."
                        className="w-full p-2 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Final Closure & PDF */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-[#1d1d1f]">Site Handback, Final Closure & PDF Link</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#86868b] mb-0.5">Final Closure Time</label>
                    <input
                      type="text"
                      value={form.final_closure_time}
                      onChange={e => handleChange('final_closure_time', e.target.value)}
                      placeholder="ISO Date"
                      className="w-full p-2 rounded-xl bg-white border border-[#d2d2d7] text-xs font-mono text-[#1d1d1f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#86868b] mb-0.5">Final PDF URL</label>
                    <input
                      type="text"
                      value={form.report_pdf_url}
                      onChange={e => handleChange('report_pdf_url', e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full p-2 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#86868b] mb-0.5">Final Closure Comments</label>
                  <textarea
                    rows={2}
                    value={form.final_closure_comments}
                    onChange={e => handleChange('final_closure_comments', e.target.value)}
                    className="w-full p-2 rounded-xl bg-white border border-[#d2d2d7] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLISTS, LOTO & GAS */}
          {activeTab === 'checklists' && (
            <div className="space-y-6">
              {/* LOTO Toggle & Details */}
              <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-[#d2d2d7]/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-xs text-[#1d1d1f]">LOTO / Energy Isolation Required</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.loto_required}
                    onChange={e => handleChange('loto_required', e.target.checked)}
                    className="w-5 h-5 accent-[#0071e3] rounded"
                  />
                </div>

                {form.loto_required && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {['electrical', 'mechanical', 'hydraulic', 'pneumatic', 'other'].map(type => (
                      <div key={type} className="p-3 bg-white rounded-xl border border-[#d2d2d7]/50 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold capitalize text-[#1d1d1f]">
                          <span>{type} Isolation</span>
                          <input
                            type="checkbox"
                            checked={form.loto_details?.[type]?.required || false}
                            onChange={e => handleLotoSubField(type, 'required', e.target.checked)}
                            className="w-4 h-4 accent-[#0071e3]"
                          />
                        </div>
                        {form.loto_details?.[type]?.required && (
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <input
                              type="text"
                              placeholder="Lock #"
                              value={form.loto_details?.[type]?.lock_number || ''}
                              onChange={e => handleLotoSubField(type, 'lock_number', e.target.value)}
                              className="p-1.5 border rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Isolated By"
                              value={form.loto_details?.[type]?.isolation_done_by || ''}
                              onChange={e => handleLotoSubField(type, 'isolation_done_by', e.target.value)}
                              className="p-1.5 border rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Gas Test Readings */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-xs text-[#1d1d1f]">Gas Test Records (LEL & Oxygen)</span>
                </div>
                {form.gas_test_records.length === 0 ? (
                  <p className="text-xs text-[#86868b] italic">No active gas readings required for this permit type.</p>
                ) : (
                  <div className="space-y-2">
                    {form.gas_test_records.map((rec: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-blue-100 text-xs">
                        <span className="font-bold text-[#1d1d1f]">{rec.location}</span>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold">LEL: {rec.lel}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">O2: {rec.oxygen}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Precautions Checklist Items */}
              <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-[#d2d2d7]/70 space-y-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#0071e3]" />
                  <span className="font-bold text-xs text-[#1d1d1f]">Active Checklist Checkpoints ({form.precautions_checklist.length})</span>
                </div>
                {form.precautions_checklist.length === 0 ? (
                  <p className="text-xs text-[#86868b] italic">No specific gateway checklists active (Standard General Precautions apply).</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {form.precautions_checklist.map((chk: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-[#d2d2d7]/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {chk.category}
                          </span>
                        </div>
                        <p className="font-medium text-[#1d1d1f] text-[11px]">{chk.item}</p>
                        <input
                          type="text"
                          value={chk.value || ''}
                          onChange={e => handleChecklistValueChange(idx, e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-[#d2d2d7] text-xs bg-[#fbfbfd]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#d2d2d7]/50 flex items-center justify-between bg-[#fbfbfd]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#d2d2d7] text-xs font-bold text-[#515154] hover:bg-black/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveToSupabase}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save to Supabase</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
