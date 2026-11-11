'use client';

import React, { useState } from 'react';
import { PtwService, PtwRecord, HAZARDS_CONFIG, PPES_CONFIG } from '@/lib/ptwService';
import {
  X,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Users,
  Clock,
  MapPin,
  Send,
  Zap,
  Building2,
  Lock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface CreatePermitModalProps {
  companyName: string;
  onClose: () => void;
  onPermitCreated: (permit: PtwRecord) => void;
}

export const CreatePermitModal: React.FC<CreatePermitModalProps> = ({
  companyName,
  onClose,
  onPermitCreated
}) => {
  const [activeTab, setActiveTab] = useState<'section1' | 'section2' | 'section3' | 'section4' | 'section5'>('section1');

  // Directory lookups
  const areaIncharges = PtwService.findPersonnelByRole('Area Incharge');
  const engIncharges = PtwService.findPersonnelByRole('Engineering Incharge');
  const ehsManagers = PtwService.findPersonnelByRole('EHS Manager');
  const engHods = PtwService.findPersonnelByRole('Engineering HOD');
  const areaHods = PtwService.findPersonnelByRole('Area HOD');

  // --- Section 1: General Job Permit ---
  const [location, setLocation] = useState('Lalru Unit-3 - Resin Plant Area');
  const [description, setDescription] = useState('Replacement of safety relief valve and nozzle line flange servicing on Reactor R-102.');
  const [emergencyContact, setEmergencyContact] = useState('+91 98765 43210 (Ext 110)');
  const [validFrom, setValidFrom] = useState(new Date().toLocaleDateString('en-GB') + ' 09:00');
  const [validTo, setValidTo] = useState(new Date().toLocaleDateString('en-GB') + ' 17:30');
  const [requestor, setRequestor] = useState('Budhi Parkash (HOD Operations)');
  const [vendor, setVendor] = useState('SBL Maintenance & Engineering Team');
  const [contractorInductionDate, setContractorInductionDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [contractorComplianceId, setContractorComplianceId] = useState('ESI/PF-SBL-2026-9921');
  const [workers, setWorkers] = useState('Sunil Kumar (Fitter), Chandra Mohan (Welder), Rajesh Singh (Helper)');
  const [inductionTrainingNumbers, setInductionTrainingNumbers] = useState('IND-2026-0414, IND-2026-0415, IND-2026-0416');
  const [firstAider, setFirstAider] = useState('Ajay Kumar');
  const [ertMember, setErtMember] = useState('Budhi Prakash');
  const [fireWatch, setFireWatch] = useState('Sanee Kumar');
  const [assemblyPoint, setAssemblyPoint] = useState('Safe Assembly Point No. 1 (Admin Lawn)');
  const [supervisorExecuting, setSupervisorExecuting] = useState('Tarun Bansal');
  const [supervisorBeneficiary, setSupervisorBeneficiary] = useState('Deshraj Annotiya');

  // --- Section 2: Hazards & PPEs ---
  const [hazards, setHazards] = useState<Record<string, boolean>>({
    'Flammables': true,
    'Hot Work': true,
    'Hazardous Energy': true
  });
  const [otherHazards, setOtherHazards] = useState('');

  const [ppes, setPpes] = useState<Record<string, boolean>>({
    'Safety Helmet': true,
    'Safety Shoes': true,
    'Safety Goggles': true,
    'Safety Gloves': true,
    'Face Mask': true
  });
  const [otherPpes, setOtherPpes] = useState('');

  // --- Section 3: Gated Checklists ---
  const [gateways, setGateways] = useState({
    hot_work: true,
    height_work: false,
    confined_space: false,
    line_breaking: false,
    excavation: false,
    hoisting: false
  });

  // Hot Work
  const [hotWorkType, setHotWorkType] = useState('Welding');
  const [cleaningMethod, setCleaningMethod] = useState('Steam washing and water flushing with N2 purge');
  const [hwPurged, setHwPurged] = useState(true);
  const [hwCleared10ft, setHwCleared10ft] = useState(true);
  const [hwBarricaded, setHwBarricaded] = useState(true);
  const [hwFireWatch, setHwFireWatch] = useState(true);
  const [hwElcbEarthed, setHwElcbEarthed] = useState(true);
  const [hwFlashbackArrester, setHwFlashbackArrester] = useState(true);
  const [hwLelPercent, setHwLelPercent] = useState('0.0'); // STRICT: 0%
  const [hwOxygenPercent, setHwOxygenPercent] = useState('20.9'); // Safe: 19.5 - 23.0%

  // Height Work
  const [htElectricalIsolated, setHtElectricalIsolated] = useState(true);
  const [htScaffoldGreenTagged, setHtScaffoldGreenTagged] = useState(true);
  const [htSafetyNet, setHtSafetyNet] = useState(true);
  const [htLadderSecured, setHtLadderSecured] = useState(true);
  const [htSafetyHarnessNo, setHtSafetyHarnessNo] = useState('HARN-SBL-044');
  const [htCertValidityDate, setHtCertValidityDate] = useState('2026-12-31');
  const [htAnchorageVerified, setHtAnchorageVerified] = useState(true);
  const [htMachineryShutdown, setHtMachineryShutdown] = useState(true);

  // Confined Space
  const [csPipelinesIsolated, setCsPipelinesIsolated] = useState(true);
  const [csEquipmentTempC, setCsEquipmentTempC] = useState('28');
  const [csVesselAttendant, setCsVesselAttendant] = useState(true);
  const [csLighting24v, setCsLighting24v] = useState(true);
  const [csHarnessStandby, setCsHarnessStandby] = useState(true);
  const [csLelTop, setCsLelTop] = useState('0.0');
  const [csO2Top, setCsO2Top] = useState('20.8');
  const [csLelMid, setCsLelMid] = useState('0.0');
  const [csO2Mid, setCsO2Mid] = useState('20.8');
  const [csLelBot, setCsLelBot] = useState('0.0');
  const [csO2Bot, setCsO2Bot] = useState('20.7');

  // Line Breaking
  const [lbCleanedFlushed, setLbCleanedFlushed] = useState(true);
  const [lbValvesClosedBlinded, setLbValvesClosedBlinded] = useState(true);
  const [lbPowerLoto, setLbPowerLoto] = useState(true);
  const [lbChemicalSuit, setLbChemicalSuit] = useState(true);
  const [lbToolsCondition, setLbToolsCondition] = useState(true);

  // Excavation
  const [exCablesMarked, setExCablesMarked] = useState(true);
  const [exOverheadCablesSafe, setExOverheadCablesSafe] = useState(true);
  const [exSurroundingBarricaded, setExSurroundingBarricaded] = useState(true);
  const [exShoringProvided, setExShoringProvided] = useState(true);
  const [exLicensedDrivers, setExLicensedDrivers] = useState(true);

  // Hoisting
  const [hoWeightKg, setHoWeightKg] = useState('450');
  const [hoHeightMeters, setHoHeightMeters] = useState('4.5');
  const [hoCertValidity, setHoCertValidity] = useState('2026-12-31 (Third Party TPI Certified)');
  const [hoLoadBalancedTagLine, setHoLoadBalancedTagLine] = useState(true);
  const [hoCraneOutriggers, setHoCraneOutriggers] = useState(true);
  const [hoTrainedSignalPerson, setHoTrainedSignalPerson] = useState(true);

  // --- Section 4: LOTO Isolation ---
  const [lotoRequired, setLotoRequired] = useState(true);
  const [isolations, setIsolations] = useState({
    electrical: { required: true, lock_number: 'LCK-E-414', isolation_done_by: 'Tarun Bansal', energy_discharged: true, try_out_successful: true },
    mechanical: { required: true, lock_number: 'LCK-M-209', isolation_done_by: 'Deshraj Annotiya', energy_discharged: true, try_out_successful: true },
    hydraulic: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: false, try_out_successful: false },
    pneumatic: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: false, try_out_successful: false },
    other: { required: false, lock_number: '', isolation_done_by: '', energy_discharged: false, try_out_successful: false }
  });

  // --- Section 5: Authorization Routing ---
  const [areaIncharge, setAreaIncharge] = useState(areaIncharges[0]?.name || 'Deshraj Annotiya');
  const [engineeringIncharge, setEngineeringIncharge] = useState(engIncharges[0]?.name || 'Tarun Bansal');
  const [ehsManager, setEhsManager] = useState(ehsManagers[0]?.name || 'Budhi Parkash');
  const [engineeringHod, setEngineeringHod] = useState(engHods[0]?.name || 'S. Kushvaha');
  const [areaHod, setAreaHod] = useState(areaHods[0]?.name || 'Namita Sharma');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isHighRisk = !!(
    gateways.hot_work ||
    gateways.height_work ||
    gateways.confined_space ||
    gateways.line_breaking ||
    gateways.excavation ||
    gateways.hoisting
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Strict safety validation matching Code.gs
    if (gateways.hot_work) {
      const lel = parseFloat(hwLelPercent);
      if (isNaN(lel) || lel !== 0) {
        setValidationError('LEL VIOLATION: Hot Work strictly mandates 0.0% Combustible Gas (LEL). Value entered is not 0%.');
        setActiveTab('section3');
        return;
      }
      const o2 = parseFloat(hwOxygenPercent);
      if (isNaN(o2) || o2 < 19.5 || o2 > 23.0) {
        setValidationError('OXYGEN VIOLATION: Oxygen level must strictly reside within safe respiratory range (19.5% - 23.0%).');
        setActiveTab('section3');
        return;
      }
    }

    if (!location.trim()) {
      setValidationError('Location/Area is mandatory.');
      setActiveTab('section1');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      location,
      description,
      emergency_contact: emergencyContact,
      valid_from: validFrom,
      valid_to: validTo,
      requestor,
      vendor,
      contractor_induction_date: contractorInductionDate,
      contractor_compliance_id: contractorComplianceId,
      workers,
      induction_training_numbers: inductionTrainingNumbers,
      first_aider: firstAider,
      ert_member: ertMember,
      fire_watch: fireWatch,
      assembly_point: assemblyPoint,
      supervisor_executing: supervisorExecuting,
      supervisor_beneficiary: supervisorBeneficiary,
      hazards,
      other_hazards: otherHazards,
      ppes,
      other_ppes: otherPpes,
      gateways,
      hot_work: gateways.hot_work ? {
        type_of_hot_work: hotWorkType,
        cleaning_method_used: cleaningMethod,
        equipment_purged: hwPurged,
        flammables_removed_10ft: hwCleared10ft,
        area_barricaded_tarpaulin: hwBarricaded,
        fire_watch_stationed: hwFireWatch,
        welding_machine_earthed_elcb: hwElcbEarthed,
        flashback_arrester_cylinders_trolleys: hwFlashbackArrester,
        lel_percent: hwLelPercent,
        oxygen_percent: hwOxygenPercent
      } : undefined,
      height_work: gateways.height_work ? {
        electrical_hazards_isolated: htElectricalIsolated,
        platform_scaffold_green_tagged: htScaffoldGreenTagged,
        safety_net_provided: htSafetyNet,
        ladder_construction_good: htLadderSecured,
        safety_harness_no: htSafetyHarnessNo,
        certificate_validity_date: htCertValidityDate,
        anchorage_point_verified: htAnchorageVerified,
        moving_machinery_shutdown: htMachineryShutdown
      } : undefined,
      confined_space: gateways.confined_space ? {
        pipelines_isolated: csPipelinesIsolated,
        equipment_temperature_c: csEquipmentTempC,
        vessel_attendant_provided: csVesselAttendant,
        lighting_24v_airline_respirator: csLighting24v,
        safety_harness_standby_holding: csHarnessStandby,
        lel_top: csLelTop,
        oxygen_top: csO2Top,
        lel_middle: csLelMid,
        oxygen_middle: csO2Mid,
        lel_bottom: csLelBot,
        oxygen_bottom: csO2Bot
      } : undefined,
      line_breaking: gateways.line_breaking ? {
        pipeline_cleaned_flushed: lbCleanedFlushed,
        valves_closed_blinded_vent_open: lbValvesClosedBlinded,
        power_supply_loto: lbPowerLoto,
        chemical_suit_face_shield: lbChemicalSuit,
        tools_good_condition: lbToolsCondition
      } : undefined,
      excavation: gateways.excavation ? {
        cables_marked_power_disconnected: exCablesMarked,
        overhead_cables_safe_distance: exOverheadCablesSafe,
        surrounding_barricaded_cleared_1m: exSurroundingBarricaded,
        shoring_arrangement_provided: exShoringProvided,
        licensed_drivers_verified: exLicensedDrivers
      } : undefined,
      hoisting: gateways.hoisting ? {
        weight_of_job_kg: hoWeightKg,
        hoisting_height_meters: hoHeightMeters,
        tool_condition_testing_certificate: hoCertValidity,
        load_balanced_tag_line: hoLoadBalancedTagLine,
        crane_outriggers_fully_extended: hoCraneOutriggers,
        trained_signal_person_assigned: hoTrainedSignalPerson
      } : undefined,
      loto_required: lotoRequired,
      isolations,
      area_incharge: areaIncharge,
      engineering_incharge: engineeringIncharge,
      ehs_manager: ehsManager,
      engineering_hod: engineeringHod,
      area_hod: areaHod
    };

    setTimeout(() => {
      const result = PtwService.createPermit(payload);
      setIsSubmitting(false);
      if (result.success) {
        onPermitCreated(result.permit);
        onClose();
      } else {
        setValidationError(result.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white border border-[#d2d2d7] w-[95vw] sm:max-w-4xl max-h-[94vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col text-[#1d1d1f]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#d2d2d7]/60 flex items-center justify-between bg-[#f5f5f7]/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[#1d1d1f]">Create Safety Permit to Work</h3>
                <span className={`text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                  isHighRisk ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {isHighRisk ? 'HIGH-RISK (5-SLOT)' : 'GENERAL (3-SLOT)'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-[#86868b] mt-0.5 truncate">
                ISO 45001:2018 &bull; OSHA 29 CFR 1910.119 &bull; Format EF/SF/01 - EF/SF/07
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#86868b] hover:text-[#1d1d1f] transition-all touch-target"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (The 5 Form Sections) */}
        <div className="flex border-b border-[#d2d2d7]/60 bg-[#f5f5f7]/50 px-3 sm:px-6 shrink-0 text-xs overflow-x-auto scrollbar-none flex-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('section1')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'section1'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            1. General Job &amp; Personnel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('section2')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'section2'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            2. Hazards &amp; PPEs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('section3')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'section3'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            3. Checklists (Gas &amp; Risk)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('section4')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'section4'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            4. Isolation &amp; LOTO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('section5')}
            className={`py-3 px-3.5 border-b-2 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'section5'
                ? 'border-[#0071e3] text-[#0071e3]'
                : 'border-transparent text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            5. Authorization Routing
          </button>
        </div>

        {/* Validation Banner */}
        {validationError && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* ============================================================== */}
          {/* TAB 1: GENERAL JOB & PERSONNEL */}
          {/* ============================================================== */}
          {activeTab === 'section1' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Department / Area / Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="e.g. Lalru Unit-3 - Resin Plant Area"
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Emergency Contact No *</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    required
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#515154] mb-1">Description of Work *</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Detail exact engineering task, equipment tag, and scope..."
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Permit Start Date &amp; Time</label>
                  <input
                    type="text"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Permit End Date &amp; Time (Shift End)</label>
                  <input
                    type="text"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Requestor Name</label>
                  <input
                    type="text"
                    value={requestor}
                    onChange={(e) => setRequestor(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Vendor / Maintenance Name</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Contractor Safety Induction Date</label>
                  <input
                    type="text"
                    value={contractorInductionDate}
                    onChange={(e) => setContractorInductionDate(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Contractor Compliance ID (ESI/Insurance)</label>
                  <input
                    type="text"
                    value={contractorComplianceId}
                    onChange={(e) => setContractorComplianceId(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Names of Persons Performing Job</label>
                  <input
                    type="text"
                    value={workers}
                    onChange={(e) => setWorkers(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#515154] mb-1">Individual Induction Training Number(s)*</label>
                  <input
                    type="text"
                    value={inductionTrainingNumbers}
                    onChange={(e) => setInductionTrainingNumbers(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              {/* Emergency Preparedness Card */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-[#d2d2d7]/70 space-y-3">
                <h4 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0071e3]" />
                  Emergency Preparedness Marshals
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Assigned Shift First Aider Name</label>
                    <input
                      type="text"
                      value={firstAider}
                      onChange={(e) => setFirstAider(e.target.value)}
                      className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-[#1d1d1f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Assigned Shift ERT Member Name</label>
                    <input
                      type="text"
                      value={ertMember}
                      onChange={(e) => setErtMember(e.target.value)}
                      className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-[#1d1d1f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Assigned Fire Watch Name</label>
                    <input
                      type="text"
                      value={fireWatch}
                      onChange={(e) => setFireWatch(e.target.value)}
                      className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-[#1d1d1f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Rescue Plan Assembly Point No.</label>
                    <input
                      type="text"
                      value={assemblyPoint}
                      onChange={(e) => setAssemblyPoint(e.target.value)}
                      className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-[#1d1d1f]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-[#d2d2d7]/50">
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Supervisor (Executing Department)</label>
                    <input
                      type="text"
                      value={supervisorExecuting}
                      onChange={(e) => setSupervisorExecuting(e.target.value)}
                      className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-[#1d1d1f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#86868b] mb-1">Supervisor (Beneficiary Department)</label>
                    <input
                      type="text"
                      value={supervisorBeneficiary}
                      onChange={(e) => setSupervisorBeneficiary(e.target.value)}
                      className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-2 min-h-[40px] text-xs text-[#1d1d1f]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: HAZARDS & PPE IDENTIFICATION */}
          {/* ============================================================== */}
          {activeTab === 'section2' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Identified Workplace Hazards (Form Section 2)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                  {HAZARDS_CONFIG.map(hz => (
                    <label
                      key={hz}
                      className={`flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl border text-xs cursor-pointer transition-all touch-target ${
                        hazards[hz]
                          ? 'bg-amber-50 border-amber-300 text-amber-900 font-medium'
                          : 'bg-[#f5f5f7] border-[#d2d2d7] text-[#515154] hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!hazards[hz]}
                        onChange={(e) => setHazards({ ...hazards, [hz]: e.target.checked })}
                        className="rounded text-[#0071e3] w-4 h-4"
                      />
                      <span className="truncate">{hz}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={otherHazards}
                    onChange={(e) => setOtherHazards(e.target.value)}
                    placeholder="Any other hazards? Specify..."
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#d2d2d7]/50">
                <h4 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mandatory Personal Protective Equipment (PPE)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                  {PPES_CONFIG.map(p => (
                    <label
                      key={p}
                      className={`flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl border text-xs cursor-pointer transition-all touch-target ${
                        ppes[p]
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                          : 'bg-[#f5f5f7] border-[#d2d2d7] text-[#515154] hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!ppes[p]}
                        onChange={(e) => setPpes({ ...ppes, [p]: e.target.checked })}
                        className="rounded text-[#0071e3] w-4 h-4"
                      />
                      <span className="truncate">{p}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={otherPpes}
                    onChange={(e) => setOtherPpes(e.target.value)}
                    placeholder="Any other PPEs required? Specify..."
                    className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl px-3.5 py-2.5 min-h-[44px] text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: CHECKLISTS (GAS & RISK GATEWAYS) */}
          {/* ============================================================== */}
          {activeTab === 'section3' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                <strong>Gated Permit Rules:</strong> Enabling any of the 6 specialized checklists below automatically classifies this permit as <strong>High Risk</strong> and engages 5-tier approver escalation per ISO 45001.
              </div>

              {/* Gateway Checkbox Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { key: 'hot_work', label: 'Hot Work Permit', icon: Flame },
                  { key: 'height_work', label: 'Height Work Permit', icon: AlertTriangle },
                  { key: 'confined_space', label: 'Confined Space Permit', icon: Users },
                  { key: 'line_breaking', label: 'Line Breaking Permit', icon: Zap },
                  { key: 'excavation', label: 'Excavation Permit', icon: MapPin },
                  { key: 'hoisting', label: 'Hoisting Permit', icon: Building2 }
                ].map(item => {
                  const Icon = item.icon;
                  const isChecked = (gateways as any)[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setGateways({ ...gateways, [item.key]: !isChecked })}
                      className={`p-3 min-h-[48px] rounded-2xl border text-left flex items-center justify-between transition-all touch-target ${
                        isChecked
                          ? 'bg-[#0071e3]/10 border-[#0071e3] text-[#0071e3] font-bold shadow-sm'
                          : 'bg-[#f5f5f7] border-[#d2d2d7] text-[#515154] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        isChecked ? 'bg-[#0071e3] text-white' : 'bg-[#e5e5ea] text-[#86868b]'
                      }`}>
                        {isChecked ? 'ENGAGED' : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* HOT WORK EXPANDED CHECKLIST */}
              {gateways.hot_work && (
                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
                  <h5 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-600" />
                    Hot Work Verification Checkpoints &amp; Gas Test (Form #53 - #62)
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">HW - Type of Hot Work</label>
                      <select
                        value={hotWorkType}
                        onChange={(e) => setHotWorkType(e.target.value)}
                        className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      >
                        <option value="Welding">Welding</option>
                        <option value="Gas Cutting">Gas Cutting</option>
                        <option value="Grinding">Grinding</option>
                        <option value="Buffing">Buffing</option>
                        <option value="Drilling">Drilling</option>
                        <option value="Soldering">Soldering / Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#86868b] mb-1">HW - Cleaning Method Used</label>
                      <input
                        type="text"
                        value={cleaningMethod}
                        onChange={(e) => setCleaningMethod(e.target.value)}
                        className="w-full bg-white border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      />
                    </div>
                  </div>

                  {/* Gas Readings (Strict validation) */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white border border-rose-200">
                    <div>
                      <label className="block text-[11px] font-bold text-rose-700 mb-1">HW - LEL % (STRICT: 0.0%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={hwLelPercent}
                        onChange={(e) => setHwLelPercent(e.target.value)}
                        className="w-full bg-rose-50 border border-rose-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-rose-800"
                      />
                      <span className="text-[10px] text-rose-600 mt-0.5 block">Zero tolerance: strictly 0% combustible vapor</span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-700 mb-1">HW - Oxygen % (Safe: 19.5 - 23.0%) *</label>
                      <input
                        type="number"
                        step="0.1"
                        value={hwOxygenPercent}
                        onChange={(e) => setHwOxygenPercent(e.target.value)}
                        className="w-full bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-800"
                      />
                      <span className="text-[10px] text-emerald-600 mt-0.5 block">Standard safe atmospheric level</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs pt-1">
                    {[
                      { state: hwPurged, setter: setHwPurged, label: 'Equipment purged and open to atmosphere to release expanded air?' },
                      { state: hwCleared10ft, setter: setHwCleared10ft, label: 'Flammable materials removed within 10ft radius?' },
                      { state: hwBarricaded, setter: setHwBarricaded, label: 'Area barricaded with tarpaulin/metal sheets to prevent sparks?' },
                      { state: hwFireWatch, setter: setHwFireWatch, label: 'Fire watch stationed and adjacent department informed?' },
                      { state: hwElcbEarthed, setter: setHwElcbEarthed, label: 'Welding Machine body earthed and 60mA ELCB in circuit?' },
                      { state: hwFlashbackArrester, setter: setHwFlashbackArrester, label: 'Gas torch Flashback Arrester & cylinders on trolleys verified?' }
                    ].map((c, i) => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer text-[#1d1d1f]">
                        <input
                          type="checkbox"
                          checked={c.state}
                          onChange={(e) => c.setter(e.target.checked)}
                          className="rounded text-[#0071e3]"
                        />
                        <span>{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* HEIGHT WORK EXPANDED CHECKLIST (Form #64 - #73) */}
              {gateways.height_work && (
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      Height Work Mandatory Safety Checkpoints (Form #64 - #73)
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                      Fall Protection Required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-blue-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515154] mb-1">
                        HT - Full Body Safety Harness No. (Form #70) *
                      </label>
                      <input
                        type="text"
                        value={htSafetyHarnessNo}
                        onChange={(e) => setHtSafetyHarnessNo(e.target.value)}
                        placeholder="e.g. HARN-SBL-044"
                        className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515154] mb-1">
                        HT - Harness / Equipment Certificate Validity Date (Form #71) *
                      </label>
                      <input
                        type="text"
                        value={htCertValidityDate}
                        onChange={(e) => setHtCertValidityDate(e.target.value)}
                        placeholder="YYYY-MM-DD"
                        className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    {[
                      { state: htElectricalIsolated, setter: setHtElectricalIsolated, label: 'HT - Electrical hazards nearby isolated? (Form #66)' },
                      { state: htScaffoldGreenTagged, setter: setHtScaffoldGreenTagged, label: 'HT - Platform/Scaffold green tagged and sound material construction? (Form #67)' },
                      { state: htSafetyNet, setter: setHtSafetyNet, label: 'HT - Safety net provided below the job? (Form #68)' },
                      { state: htLadderSecured, setter: setHtLadderSecured, label: 'HT - Ladder: Construction good, footing firm and secured at top/bottom? (Form #69)' },
                      { state: htAnchorageVerified, setter: setHtAnchorageVerified, label: 'HT - Anchorage point verified not to be lower than working level? (Form #72)' },
                      { state: htMachineryShutdown, setter: setHtMachineryShutdown, label: 'HT - Moving/rotating machinery nearby shut down? (Form #73)' }
                    ].map((c, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-blue-100 cursor-pointer text-[#1d1d1f] hover:bg-blue-50/50 transition-all">
                        <input
                          type="checkbox"
                          checked={c.state}
                          onChange={(e) => c.setter(e.target.checked)}
                          className="rounded text-[#0071e3] w-4 h-4"
                        />
                        <span className="font-medium">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* CONFINED SPACE EXPANDED CHECKLIST (Form #75 - #87) */}
              {gateways.confined_space && (
                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Confined Space Entry Verification &amp; Gas Profiling (Form #75 - #87)
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                      Critical Life-Safety
                    </span>
                  </div>

                  {/* Pre-Entry Checks */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-indigo-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515154] mb-1">
                        CS - Equipment Temperature Recorded (°C) (Form #78) *
                      </label>
                      <input
                        type="text"
                        value={csEquipmentTempC}
                        onChange={(e) => setCsEquipmentTempC(e.target.value)}
                        placeholder="e.g. 28°C"
                        className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-[#1d1d1f]">
                        <input
                          type="checkbox"
                          checked={csVesselAttendant}
                          onChange={(e) => setCsVesselAttendant(e.target.checked)}
                          className="rounded text-[#0071e3] w-4 h-4"
                        />
                        <span className="font-semibold text-xs">CS - Dedicated Vessel Attendant Assigned (Form #79)</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {[
                      { state: csPipelinesIsolated, setter: setCsPipelinesIsolated, label: 'CS - Nitrogen, Reflux and Utility pipelines isolated & blinded? (Form #77)' },
                      { state: csLighting24v, setter: setCsLighting24v, label: 'CS - 24V DC hand lamp lighting & air-line respirator verified? (Form #80)' },
                      { state: csHarnessStandby, setter: setCsHarnessStandby, label: 'CS - Safety harness standby person holding lifeline outside manhole? (Form #81)' }
                    ].map((c, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-indigo-100 cursor-pointer text-[#1d1d1f] hover:bg-indigo-50/50 transition-all">
                        <input
                          type="checkbox"
                          checked={c.state}
                          onChange={(e) => c.setter(e.target.checked)}
                          className="rounded text-[#0071e3] w-4 h-4"
                        />
                        <span className="font-medium">{c.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* 3-Level Gas Tests */}
                  <div className="p-3 rounded-xl bg-white border border-indigo-200">
                    <span className="text-[11px] font-bold text-indigo-900 block mb-2">
                      CS - 3-Level Atmospheric Gas Profiling (Strict: 0.0% LEL, 19.5-23.0% O₂) (Form #82 - #87)
                    </span>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-2 rounded-lg bg-[#f5f5f7]">
                        <span className="font-bold text-slate-700 block mb-1 text-[10px] uppercase">Top Strata (#82-#83)</span>
                        <div className="space-y-1">
                          <input type="text" placeholder="LEL % (0.0)" value={csLelTop} onChange={(e) => setCsLelTop(e.target.value)} className="w-full bg-white border rounded px-2 py-1 text-xs font-mono" />
                          <input type="text" placeholder="O2 % (19.5-23)" value={csO2Top} onChange={(e) => setCsO2Top(e.target.value)} className="w-full bg-white border rounded px-2 py-1 text-xs font-mono" />
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#f5f5f7]">
                        <span className="font-bold text-slate-700 block mb-1 text-[10px] uppercase">Middle Strata (#84-#85)</span>
                        <div className="space-y-1">
                          <input type="text" placeholder="LEL % (0.0)" value={csLelMid} onChange={(e) => setCsLelMid(e.target.value)} className="w-full bg-white border rounded px-2 py-1 text-xs font-mono" />
                          <input type="text" placeholder="O2 % (19.5-23)" value={csO2Mid} onChange={(e) => setCsO2Mid(e.target.value)} className="w-full bg-white border rounded px-2 py-1 text-xs font-mono" />
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#f5f5f7]">
                        <span className="font-bold text-slate-700 block mb-1 text-[10px] uppercase">Bottom Strata (#86-#87)</span>
                        <div className="space-y-1">
                          <input type="text" placeholder="LEL % (0.0)" value={csLelBot} onChange={(e) => setCsLelBot(e.target.value)} className="w-full bg-white border rounded px-2 py-1 text-xs font-mono" />
                          <input type="text" placeholder="O2 % (19.5-23)" value={csO2Bot} onChange={(e) => setCsO2Bot(e.target.value)} className="w-full bg-white border rounded px-2 py-1 text-xs font-mono" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LINE BREAKING EXPANDED CHECKLIST (Form #89 - #95) */}
              {gateways.line_breaking && (
                <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-rose-600" />
                      Line Breaking Hazardous Chemical Checkpoints (Form #89 - #95)
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                      Chemical Release Barrier
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { state: lbCleanedFlushed, setter: setLbCleanedFlushed, label: 'LB - Pipeline cleaned/flushed and free from hazardous vapors/liquid? (Form #91)' },
                      { state: lbValvesClosedBlinded, setter: setLbValvesClosedBlinded, label: 'LB - All related valves closed/blinded and vent/drain open to verify depressurization? (Form #92)' },
                      { state: lbPowerLoto, setter: setLbPowerLoto, label: 'LB - Power supply Locked/Tagged (LOTO) at source/panel for motorized valves? (Form #93)' },
                      { state: lbChemicalSuit, setter: setLbChemicalSuit, label: 'LB - Chemical resistant suit, face shield & acid/alkali hood provided? (Form #94)' },
                      { state: lbToolsCondition, setter: setLbToolsCondition, label: 'LB - Tools in good condition and non-sparking standard if flammable? (Form #95)' }
                    ].map((c, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-rose-100 cursor-pointer text-[#1d1d1f] hover:bg-rose-50/50 transition-all">
                        <input
                          type="checkbox"
                          checked={c.state}
                          onChange={(e) => c.setter(e.target.checked)}
                          className="rounded text-[#0071e3] w-4 h-4"
                        />
                        <span className="font-medium">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* EXCAVATION EXPANDED CHECKLIST (Form #97 - #103) */}
              {gateways.excavation && (
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Excavation Underground Safety Checkpoints (Form #97 - #103)
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      Underground Clearance
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { state: exCablesMarked, setter: setExCablesMarked, label: 'EX - Underground cables marked and power supply disconnected? (Form #99)' },
                      { state: exOverheadCablesSafe, setter: setExOverheadCablesSafe, label: 'EX - Overhead cables safe distance from JCB/Excavator boom height? (Form #100)' },
                      { state: exSurroundingBarricaded, setter: setExSurroundingBarricaded, label: 'EX - Surrounding barricaded and excavated material cleared 1m from edge? (Form #101)' },
                      { state: exShoringProvided, setter: setExShoringProvided, label: 'EX - Shoring arrangement provided (Mandatory if Trench Depth > 3ft)? (Form #102)' },
                      { state: exLicensedDrivers, setter: setExLicensedDrivers, label: 'EX - Licensed & medically fit drivers verified for vehicles/JCB? (Form #103)' }
                    ].map((c, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-amber-100 cursor-pointer text-[#1d1d1f] hover:bg-amber-50/50 transition-all">
                        <input
                          type="checkbox"
                          checked={c.state}
                          onChange={(e) => c.setter(e.target.checked)}
                          className="rounded text-[#0071e3] w-4 h-4"
                        />
                        <span className="font-medium">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* HOISTING EXPANDED CHECKLIST (Form #105 - #112) */}
              {gateways.hoisting && (
                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Hoisting &amp; Heavy Rigging Safety Checkpoints (Form #105 - #112)
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                      Load Lifting Clearance
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs bg-white p-3 rounded-xl border border-indigo-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515154] mb-1">
                        HO - Weight of Job (kg) (Form #107) *
                      </label>
                      <input
                        type="text"
                        value={hoWeightKg}
                        onChange={(e) => setHoWeightKg(e.target.value)}
                        placeholder="e.g. 850"
                        className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515154] mb-1">
                        HO - Hoisting Height (meters) (Form #108) *
                      </label>
                      <input
                        type="text"
                        value={hoHeightMeters}
                        onChange={(e) => setHoHeightMeters(e.target.value)}
                        placeholder="e.g. 6.5"
                        className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#515154] mb-1">
                        HO - Tool Condition &amp; Cert (Form #109) *
                      </label>
                      <input
                        type="text"
                        value={hoCertValidity}
                        onChange={(e) => setHoCertValidity(e.target.value)}
                        placeholder="Valid Certificate Date"
                        className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-lg px-2.5 py-1.5 text-xs text-[#1d1d1f]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { state: hoLoadBalancedTagLine, setter: setHoLoadBalancedTagLine, label: 'HO - Load balanced, rigging slings inspected and tag line attached? (Form #110)' },
                      { state: hoCraneOutriggers, setter: setHoCraneOutriggers, label: 'HO - Crane outriggers fully extended on firm ground / steel plates? (Form #111)' },
                      { state: hoTrainedSignalPerson, setter: setHoTrainedSignalPerson, label: 'HO - Trained signal person / rigger assigned with high-vis vest? (Form #112)' }
                    ].map((c, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-indigo-100 cursor-pointer text-[#1d1d1f] hover:bg-indigo-50/50 transition-all">
                        <input
                          type="checkbox"
                          checked={c.state}
                          onChange={(e) => c.setter(e.target.checked)}
                          className="rounded text-[#0071e3] w-4 h-4"
                        />
                        <span className="font-medium">{c.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: ISOLATION & LOTO TRY-OUT */}
          {/* ============================================================== */}
          {activeTab === 'section4' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-[#d2d2d7] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1d1d1f] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#0071e3]" />
                    Is LOTO / Energy Isolation Required for this permit?
                  </h4>
                  <p className="text-[11px] text-[#86868b] mt-0.5">OSHA 29 CFR 1910.147 Control of Hazardous Energy</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLotoRequired(!lotoRequired)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    lotoRequired ? 'bg-[#0071e3] text-white shadow-sm' : 'bg-[#e5e5ea] text-[#515154]'
                  }`}
                >
                  {lotoRequired ? 'YES (LOTO APPLIED)' : 'NO (NOT REQUIRED)'}
                </button>
              </div>

              {lotoRequired && (
                <div className="space-y-3">
                  {(['electrical', 'mechanical', 'hydraulic', 'pneumatic', 'other'] as const).map(type => {
                    const record = (isolations as any)[type];
                    return (
                      <div key={type} className="p-3.5 rounded-2xl border border-[#d2d2d7] bg-white space-y-2.5">
                        <div className="flex items-center justify-between border-b border-[#d2d2d7]/50 pb-2">
                          <span className="text-xs font-bold text-[#1d1d1f] uppercase">{type} Isolation</span>
                          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={record.required}
                              onChange={(e) => {
                                setIsolations({
                                  ...isolations,
                                  [type]: { ...record, required: e.target.checked }
                                });
                              }}
                              className="rounded text-[#0071e3]"
                            />
                            <span>Required</span>
                          </label>
                        </div>

                        {record.required && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                            <div>
                              <label className="block text-[10px] text-[#86868b] mb-1">Lock Number</label>
                              <input
                                type="text"
                                value={record.lock_number}
                                onChange={(e) => {
                                  setIsolations({
                                    ...isolations,
                                    [type]: { ...record, lock_number: e.target.value }
                                  });
                                }}
                                placeholder="e.g. LCK-414"
                                className="w-full bg-[#f5f5f7] border rounded px-2 py-1 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-[#86868b] mb-1">Isolation Done By</label>
                              <input
                                type="text"
                                value={record.isolation_done_by}
                                onChange={(e) => {
                                  setIsolations({
                                    ...isolations,
                                    [type]: { ...record, isolation_done_by: e.target.value }
                                  });
                                }}
                                placeholder="Supervisor Name"
                                className="w-full bg-[#f5f5f7] border rounded px-2 py-1 text-xs"
                              />
                            </div>
                            <div className="flex items-center pt-3">
                              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={record.energy_discharged}
                                  onChange={(e) => {
                                    setIsolations({
                                      ...isolations,
                                      [type]: { ...record, energy_discharged: e.target.checked }
                                    });
                                  }}
                                  className="rounded text-[#0071e3]"
                                />
                                <span>Stored Energy Released</span>
                              </label>
                            </div>
                            <div className="flex items-center pt-3">
                              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-emerald-700 font-semibold">
                                <input
                                  type="checkbox"
                                  checked={record.try_out_successful}
                                  onChange={(e) => {
                                    setIsolations({
                                      ...isolations,
                                      [type]: { ...record, try_out_successful: e.target.checked }
                                    });
                                  }}
                                  className="rounded text-emerald-600"
                                />
                                <span>Zero Energy Try-Out</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: AUTHORIZATION ROUTING */}
          {/* ============================================================== */}
          {activeTab === 'section5' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Authorization Routing (Form Section 5):</strong> Select designated authorizers from the authentic SBL reference directory. Email notifications and tokenized action links will be sent sequentially.
              </div>

              <div className="space-y-3 text-xs">
                {/* Slot 1: Area Incharge */}
                <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-[#d2d2d7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="w-full sm:w-1/3">
                    <span className="font-bold text-[#1d1d1f] block">Slot 1: Area Incharge</span>
                    <span className="text-[10px] text-[#86868b]">Beneficiary department head</span>
                  </div>
                  <select
                    value={areaIncharge}
                    onChange={(e) => setAreaIncharge(e.target.value)}
                    className="w-full sm:w-2/3 bg-white border border-[#d2d2d7] rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#1d1d1f] touch-target"
                  >
                    {areaIncharges.map(p => (
                      <option key={p.name + p.email} value={p.name}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>

                {/* Slot 2: Engineering Incharge */}
                <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-[#d2d2d7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="w-full sm:w-1/3">
                    <span className="font-bold text-[#1d1d1f] block">Slot 2: Engineering Incharge</span>
                    <span className="text-[10px] text-[#86868b]">Maintenance executing lead</span>
                  </div>
                  <select
                    value={engineeringIncharge}
                    onChange={(e) => setEngineeringIncharge(e.target.value)}
                    className="w-full sm:w-2/3 bg-white border border-[#d2d2d7] rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#1d1d1f] touch-target"
                  >
                    {engIncharges.map(p => (
                      <option key={p.name + p.email} value={p.name}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>

                {/* Slot 3: EHS Manager */}
                <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-[#d2d2d7] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="w-full sm:w-1/3">
                    <span className="font-bold text-[#1d1d1f] block">Slot 3: EHS Manager</span>
                    <span className="text-[10px] text-[#86868b]">Safety &amp; environmental compliance</span>
                  </div>
                  <select
                    value={ehsManager}
                    onChange={(e) => setEhsManager(e.target.value)}
                    className="w-full sm:w-2/3 bg-white border border-[#d2d2d7] rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#1d1d1f] touch-target"
                  >
                    {ehsManagers.map(p => (
                      <option key={p.name + p.email} value={p.name}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>

                {/* Slot 4 & 5 (High Risk Only) */}
                {isHighRisk && (
                  <>
                    <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="w-full sm:w-1/3">
                        <span className="font-bold text-rose-900 block">Slot 4: Engineering HOD</span>
                        <span className="text-[10px] text-rose-700">High-risk executive technical sign-off</span>
                      </div>
                      <select
                        value={engineeringHod}
                        onChange={(e) => setEngineeringHod(e.target.value)}
                        className="w-full sm:w-2/3 bg-white border border-rose-300 rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#1d1d1f] touch-target"
                      >
                        {engHods.map(p => (
                          <option key={p.name + p.email} value={p.name}>{p.name} ({p.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="w-full sm:w-1/3">
                        <span className="font-bold text-rose-900 block">Slot 5: Area HOD</span>
                        <span className="text-[10px] text-rose-700">Operations &amp; manufacturing authorization</span>
                      </div>
                      <select
                        value={areaHod}
                        onChange={(e) => setAreaHod(e.target.value)}
                        className="w-full sm:w-2/3 bg-white border border-rose-300 rounded-xl px-3 py-2.5 min-h-[44px] text-xs text-[#1d1d1f] touch-target"
                      >
                        {areaHods.map(p => (
                          <option key={p.name + p.email} value={p.name}>{p.name} ({p.email})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#d2d2d7]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-[#86868b] text-center sm:text-left">
              <span>Section {activeTab.slice(-1)} of 5</span>
            </div>

            <div className="flex items-center gap-2">
              {activeTab !== 'section1' && (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('section1' | 'section2' | 'section3' | 'section4' | 'section5')[] = ['section1', 'section2', 'section3', 'section4', 'section5'];
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1]);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] rounded-full border border-[#d2d2d7] text-xs font-medium hover:bg-[#f5f5f7] transition-all flex items-center justify-center gap-1 touch-target"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}

              {activeTab !== 'section5' ? (
                <button
                  type="button"
                  onClick={() => {
                    const tabs: ('section1' | 'section2' | 'section3' | 'section4' | 'section5')[] = ['section1', 'section2', 'section3', 'section4', 'section5'];
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 min-h-[44px] rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1 touch-target"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] rounded-full bg-[#34c759] hover:bg-[#2fb34f] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 touch-target"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Registering...' : 'Authorize & Dispatch Permit'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
