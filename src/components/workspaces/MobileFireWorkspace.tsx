import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Flame, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  Droplets, 
  Activity, 
  RefreshCw,
  ShieldCheck,
  Zap,
  Search,
  QrCode,
  Camera,
  Filter,
  Check,
  X,
  ChevronRight,
  Info,
  Clock,
  Send,
  FileText,
  Sliders,
  Download,
  AlertCircle
} from 'lucide-react';
import { AppleHaptics } from '../../services/appleHaptics';
import { FPSAsset } from '../../data/fpsAssetsData';
import { FPSDirective, FPS_DIRECTIVES, InspectionRecord, CAPAItem } from '../../data/fpsDirectives';
import { fpsService, isPendingThisMonth, normalizeAssetId } from '../../services/fpsService';

type TabView = 'slice-pending' | 'all-assets' | 'completed' | 'capa-tracker' | 'pump-duty';
type AssetCategoryFilter = 'All' | 'Extinguisher' | 'Detector' | 'Hydrant' | 'Hose Reel' | 'DV' | 'Pump';

export const MobileFireWorkspace: React.FC = () => {
  // Master state
  const [assets, setAssets] = useState<FPSAsset[]>([]);
  const [capaItems, setCapaItems] = useState<CAPAItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabView>('slice-pending');
  const [selectedUnit, setSelectedUnit] = useState<'All' | 'Unit 3-Lalru' | 'Unit 2-Derabassi'>('All');
  const [categoryFilter, setCategoryFilter] = useState<AssetCategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<'synced' | 'offline' | 'idle'>('idle');

  // Inspection Modal State
  const [inspectingAsset, setInspectingAsset] = useState<FPSAsset | null>(null);
  const [modalStatus, setModalStatus] = useState<'Operational' | 'Defective'>('Operational');
  const [modalScore, setModalScore] = useState<number>(100);
  const [modalGps, setModalGps] = useState<string>('');
  const [modalSerialNo, setModalSerialNo] = useState<string>('');
  const [modalTemp, setModalTemp] = useState<string>('24');
  const [modalRemarks, setModalRemarks] = useState<string>('');
  const [checklistValues, setChecklistValues] = useState<Record<string, any>>({});
  const [inspectorEmail, setInspectorEmail] = useState<string>('fireman@sbl.com');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Digital Signature State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // QR Code Scanner Modal
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrManualInput, setQrManualInput] = useState('');

  // Pump 45-Min Test Modal
  const [pumpTestActive, setPumpTestActive] = useState(false);
  const [pumpTestData, setPumpTestData] = useState({
    pumpId: 'PMP-D-001',
    startTime: '09:00',
    endTime: '09:45',
    suction0: '0.0',
    suction15: '0.0',
    suction30: '0.0',
    suction45: '0.0',
    discharge0: '8.5',
    discharge15: '8.4',
    discharge30: '8.5',
    discharge45: '8.5',
    rpm0: '1800',
    rpm15: '1805',
    rpm30: '1800',
    rpm45: '1795',
    heatExchPr: '2.5',
    flowGpm: '2250',
    temp: '82',
    oilPr: '4.2',
    bat1: '13.4',
    bat2: '13.5',
    load: '100',
    remarks: 'Standard weekly 45-minute duty run. Full flow and operating pressures verified.'
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load
  useEffect(() => {
    refreshLocalData();
  }, []);

  const refreshLocalData = () => {
    const list = fpsService.getAssets();
    setAssets([...list]);
    setCapaItems(fpsService.getCAPAItems());
  };

  const handleSyncWithCloud = async () => {
    AppleHaptics.light();
    setIsSyncing(true);
    setSyncStatusText('idle');
    const result = await fpsService.syncWithGoogleSheet();
    setIsSyncing(false);
    if (result.success) {
      setSyncStatusText('synced');
      refreshLocalData();
      showToast(`✓ Cloud Sync Successful: ${result.count} assets refreshed from Google Sheet!`);
    } else {
      setSyncStatusText('offline');
      showToast(`⚡ Working in Offline Plant Mode (588 assets loaded in local cache).`);
    }
  };

  // Computed Summary Stats
  const summary = useMemo(() => {
    return fpsService.getSummaryStats(selectedUnit);
  }, [assets, selectedUnit]);

  // Filtered Assets Pipeline
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Unit filter
      if (selectedUnit !== 'All' && asset.unit !== selectedUnit) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'All') {
        const typeLower = asset.type.toLowerCase();
        if (categoryFilter === 'Extinguisher' && !typeLower.includes('extinguisher')) return false;
        if (categoryFilter === 'Detector' && !typeLower.includes('detector')) return false;
        if (categoryFilter === 'Hydrant' && !typeLower.includes('hydrant')) return false;
        if (categoryFilter === 'Hose Reel' && !typeLower.includes('hose')) return false;
        if (categoryFilter === 'DV' && !typeLower.includes('dv') && !typeLower.includes('valve')) return false;
        if (categoryFilter === 'Pump' && !typeLower.includes('pump')) return false;
      }

      // Tab Slice Filter
      if (activeTab === 'slice-pending') {
        if (!isPendingThisMonth(asset)) return false;
      } else if (activeTab === 'completed') {
        if (isPendingThisMonth(asset)) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const normQ = normalizeAssetId(searchQuery);
        const normId = normalizeAssetId(asset.id);
        const matchId = normId.includes(normQ) || asset.id.toLowerCase().includes(q);
        const matchLoc = (asset.location || '').toLowerCase().includes(q);
        const matchFloor = (asset.floor || '').toLowerCase().includes(q);
        const matchCap = (asset.capacity || '').toLowerCase().includes(q);
        const matchLandmark = (asset.landmark || '').toLowerCase().includes(q);
        if (!matchId && !matchLoc && !matchFloor && !matchCap && !matchLandmark) {
          return false;
        }
      }

      return true;
    });
  }, [assets, selectedUnit, categoryFilter, activeTab, searchQuery]);

  // Open Inspection Flow for an Asset
  const handleOpenInspection = (asset: FPSAsset) => {
    AppleHaptics.light();
    setInspectingAsset(asset);
    setModalStatus(asset.status === 'Defective' ? 'Defective' : 'Operational');
    setModalScore(asset.conditionScore || 100);
    setModalGps(asset.gpsCoordinates || (asset.unit.includes('Derabassi') ? '30.5964, 76.8433' : '30.4546226, 76.8461592'));
    setModalSerialNo(asset.engineSN || asset.pumpSN || `SBL-${asset.id}`);
    setModalTemp('24');
    setModalRemarks('');
    setCapturedPhoto(null);
    setHasSigned(false);

    // Contextual Pre-fill defaults based on asset type
    const initialVals: Record<string, any> = {};
    const typeLower = asset.type.toLowerCase();

    if (typeLower.includes('extinguisher')) {
      initialVals['FE_Discharge_Hose'] = 'OK';
      initialVals['FE_Discharge_Nozzle'] = 'OK';
      initialVals['FE_Safety_Pin_Seal'] = 'OK';
      initialVals['FE_Mounting'] = 'OK';
      initialVals['FE_Cleanliness'] = 'OK';
    } else if (typeLower.includes('hose')) {
      initialVals['HRH_Drum_Rotation'] = 'OK';
      initialVals['HRH_Pipe_Condition'] = 'OK';
      initialVals['HRH_Nozzle_Condition'] = 'OK';
      initialVals['HRH_Operational_Status'] = 'OK';
    } else if (typeLower.includes('hydrant')) {
      initialVals['HYD_Butterfly_Valve'] = 'OK';
      initialVals['HYD_Operating_Wheel'] = 'OK';
      initialVals['HYD_Female_Coupling_Washer'] = 'OK';
      initialVals['HYD_Lugs_Condition'] = 'OK';
      initialVals['HYD_Blank_Cap'] = 'OK';
      initialVals['HYD_Lubrication'] = 'OK';
      initialVals['HYD_Flushing_Date'] = new Date().toISOString().split('T')[0];
      initialVals['HYD_Pressure_Reading'] = '7.5';
      initialVals['HYD_Box_Glass'] = 'OK';
      initialVals['HYD_Glass_Breaker'] = 'OK';
      initialVals['HYD_Box_Key'] = 'Available';
      initialVals['HYD_Branch_Nozzle'] = 'OK';
      initialVals['HYD_Hose_Quantity'] = 2;
    } else if (typeLower.includes('detector')) {
      initialVals['DET_LED_Flashing'] = 'OK';
      initialVals['DET_Alarm_Test_Working'] = 'OK';
    } else if (typeLower.includes('dv') || typeLower.includes('valve')) {
      initialVals['DV_Detection_Air_Pr'] = '4.5';
      initialVals['DV_Pilot_Head_Air_Pr'] = '4.5';
      initialVals['DV_Water_DV_Head_Pr'] = '7.5';
      initialVals['DV_AFR_Condition'] = 'OK';
      initialVals['DV_SOV_Condition'] = 'OK';
      initialVals['DV_Pr_Switch_Delivery'] = 'OK';
      initialVals['DV_BV_Bypass'] = 'OK';
      initialVals['DV_BV_Delivery'] = 'OK';
      initialVals['DV_BV_Test'] = 'OK';
      initialVals['DV_BV_Inlet'] = 'OK';
      initialVals['DV_Y_Strainer'] = 'OK';
      initialVals['DV_HOV_Condition'] = 'OK';
      initialVals['DV_Foam_Level_Ltr'] = '500';
      initialVals['DV_PLC_Interlock'] = 'OK';
      initialVals['DV_PLC_Signalling'] = 'OK';
      initialVals['DV_Actuation_Sec'] = '45';
      initialVals['DV_Closing_Sec'] = '15';
    }

    setChecklistValues(initialVals);
  };

  // 1-Tap Quick Pass (All OK)
  const handleApplyQuickPass = () => {
    AppleHaptics.success();
    setModalStatus('Operational');
    setModalScore(100);
    setHasSigned(true);
    showToast('⚡ Quick Pass Activated: All directives marked 100% Compliant.');
  };

  // Capture GPS
  const handleCaptureGps = () => {
    AppleHaptics.light();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
          setModalGps(coords);
          showToast(`📍 GPS Locked: ${coords}`);
        },
        () => {
          const fallback = inspectingAsset?.unit.includes('Derabassi') ? '30.5964, 76.8433' : '30.4546226, 76.8461592';
          setModalGps(fallback);
          showToast(`📍 Default Unit GPS Applied: ${fallback}`);
        }
      );
    }
  };

  // Signature Canvas Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    AppleHaptics.light();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSigned(false);
  };

  // Submit & Certify Inspection
  const handleSubmitInspection = () => {
    if (!inspectingAsset) return;

    AppleHaptics.success();

    const isBoxKeyMissing = checklistValues['HYD_Box_Key'] === 'Missing';
    const computedScore = modalStatus === 'Defective' ? Math.min(modalScore, 70) : modalScore;

    const logRecord: InspectionRecord = {
      logId: 'LOG-' + Date.now(),
      unit: inspectingAsset.unit,
      assetId: inspectingAsset.id,
      inspectorEmail: inspectorEmail,
      timestamp: new Date().toISOString(),
      statusFound: modalStatus,
      score: computedScore,
      fieldGps: modalGps,
      ambientTempC: parseFloat(modalTemp) || 24,
      verifiedSerialNo: modalSerialNo,
      remarks: modalRemarks,
      checklistData: checklistValues
    };

    const res = fpsService.recordInspection(logRecord);

    refreshLocalData();
    setInspectingAsset(null);

    if (res.capaItem) {
      showToast(`⚠️ Inspection Recorded! High-Risk Defect created CAPA #${res.capaItem.issueId}`);
    } else {
      showToast(`✓ Asset ${inspectingAsset.id} inspected! Cleared from Pending Slice.`);
    }
  };

  // QR Lookup / Camera Scanner
  const handleQrLookup = (rawVal: string) => {
    const found = fpsService.findAsset(rawVal);
    if (found) {
      AppleHaptics.success();
      setIsQrModalOpen(false);
      setQrManualInput('');
      handleOpenInspection(found);
      showToast(`✓ Asset Matched: ${found.id} (${found.type})`);
    } else {
      AppleHaptics.warning();
      showToast(`❌ Asset "${rawVal}" not found. Check ID or leading zeros.`);
    }
  };

  // Submit Pump 45-Min Test
  const handleSubmitPumpDuty = () => {
    AppleHaptics.success();
    const targetAsset = assets.find(a => normalizeAssetId(a.id) === normalizeAssetId(pumpTestData.pumpId)) || assets[0];
    const logRecord: InspectionRecord = {
      logId: 'LOG-PMP-' + Date.now(),
      unit: targetAsset.unit,
      assetId: targetAsset.id,
      inspectorEmail: inspectorEmail,
      timestamp: new Date().toISOString(),
      statusFound: 'Operational',
      score: 100,
      fieldGps: targetAsset.gpsCoordinates,
      ambientTempC: parseFloat(pumpTestData.temp) || 82,
      verifiedSerialNo: targetAsset.engineSN || 'E-99421',
      remarks: pumpTestData.remarks,
      checklistData: {
        PMP_Start_Time: pumpTestData.startTime,
        PMP_End_Time: pumpTestData.endTime,
        PMP_Suction_0: pumpTestData.suction0,
        PMP_Suction_15: pumpTestData.suction15,
        PMP_Suction_30: pumpTestData.suction30,
        PMP_Suction_45: pumpTestData.suction45,
        PMP_Discharge_0: pumpTestData.discharge0,
        PMP_Discharge_15: pumpTestData.discharge15,
        PMP_Discharge_30: pumpTestData.discharge30,
        PMP_Discharge_45: pumpTestData.discharge45,
        PMP_RPM_0: pumpTestData.rpm0,
        PMP_RPM_15: pumpTestData.rpm15,
        PMP_RPM_30: pumpTestData.rpm30,
        PMP_RPM_45: pumpTestData.rpm45,
        PMP_Heat_Exch_Pr: pumpTestData.heatExchPr,
        PMP_Flow_GPM: pumpTestData.flowGpm,
        PMP_Temp: pumpTestData.temp,
        PMP_Oil_Pr: pumpTestData.oilPr,
        PMP_Bat_1: pumpTestData.bat1,
        PMP_Bat_2: pumpTestData.bat2,
        PMP_Load: pumpTestData.load
      }
    };

    fpsService.recordInspection(logRecord);
    refreshLocalData();
    setPumpTestActive(false);
    showToast(`✓ 45-Min Pump Duty Certified: Discharge 8.5 Bar, 1800 RPM logged!`);
  };

  return (
    <div className="space-y-3.5 p-2 sm:p-3 pb-28 text-slate-100 max-w-4xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold text-amber-300 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="ios-card-elevated p-4 border-orange-500/30 bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shadow-inner">
              <Flame className="w-6 h-6 animate-pulse text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Fire Protection System
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  v37.0 Master
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                SBL Industrial Fire & Life Safety • 76 Forensic Directives
              </p>
            </div>
          </div>

          {/* Sync Button & Live Telemetry Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncWithCloud}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 active:scale-95 transition-all text-xs font-bold shadow-sm"
              title="Sync directly with live Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>7.2 kg/cm²</span>
            </div>
          </div>
        </div>

        {/* Manufacturing Unit Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-white/10">
          {(['All', 'Unit 3-Lalru', 'Unit 2-Derabassi'] as const).map(unit => (
            <button
              key={unit}
              onClick={() => {
                AppleHaptics.light();
                setSelectedUnit(unit);
              }}
              className={`py-1.5 px-2 rounded-xl text-center font-bold text-[11px] transition-all ${
                selectedUnit === unit
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {unit === 'All' ? 'All Units (588)' : unit === 'Unit 3-Lalru' ? 'Unit 3 - Lalru (537)' : 'Unit 2 - Derabassi (51)'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards (Pending Slice, Inspected, Defective, Pumps) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Pending Slice Button */}
        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('slice-pending');
          }}
          className={`p-3 rounded-2xl text-left transition-all border ${
            activeTab === 'slice-pending'
              ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-amber-400">Pending Slice</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {summary.pendingThisMonth}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Audit This Month</div>
        </button>

        {/* Completed This Month */}
        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('completed');
          }}
          className={`p-3 rounded-2xl text-left transition-all border ${
            activeTab === 'completed'
              ? 'bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-emerald-400">Inspected</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
            {summary.completedThisMonth}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{summary.complianceRate}% Monthly Coverage</div>
        </button>

        {/* CAPA & Defects */}
        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('capa-tracker');
          }}
          className={`p-3 rounded-2xl text-left transition-all border ${
            activeTab === 'capa-tracker'
              ? 'bg-rose-950/40 border-rose-500/80 ring-2 ring-rose-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-rose-400">CAPA Tracker</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-300 font-mono">
            {capaItems.filter(c => c.status === 'OPEN').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Critical Defect Tickets</div>
        </button>

        {/* Pump 45-Min Runner */}
        <button
          onClick={() => {
            AppleHaptics.light();
            setPumpTestActive(true);
          }}
          className="p-3 rounded-2xl text-left transition-all border bg-slate-900/70 border-slate-800 hover:border-orange-500/50"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-orange-400">Pump 45-Min</span>
            <Activity className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            3 Pumps
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Duty Cycle Engine</div>
        </button>
      </div>

      {/* Main Navigation Slice Pill & Registry Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('slice-pending');
          }}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'slice-pending'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Assets This Month</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
            {summary.pendingThisMonth}
          </span>
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('all-assets');
          }}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'all-assets'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>All Registry</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
            {summary.total}
          </span>
        </button>
      </div>

      {/* Search Bar + QR Scanner Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ID (e.g. 1, DGLEL, FE31), floor, area..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            AppleHaptics.light();
            setIsQrModalOpen(true);
          }}
          className="px-3.5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden xs:inline">Scan QR</span>
        </button>
      </div>

      {/* Equipment Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
        {[
          { id: 'All', label: 'All Equipment' },
          { id: 'Extinguisher', label: '🧯 Extinguishers' },
          { id: 'Detector', label: '🚨 Detectors' },
          { id: 'Hydrant', label: '💧 Hydrants' },
          { id: 'Hose Reel', label: '🌀 Hose Reels' },
          { id: 'DV', label: '⚡ Deluge Valves' },
          { id: 'Pump', label: '⚙️ Pumps' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              AppleHaptics.light();
              setCategoryFilter(cat.id as AssetCategoryFilter);
            }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              categoryFilter === cat.id
                ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* CAPA Tracker View */}
      {activeTab === 'capa-tracker' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Active Corrective & Preventive Actions (CAPA)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {capaItems.length} Total Tickets
            </span>
          </div>

          {capaItems.length === 0 ? (
            <div className="ios-card p-8 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-sm text-slate-200">Zero Open CAPA Violations</p>
              <p className="text-xs mt-1">All equipment meets 100% forensic safety threshold.</p>
            </div>
          ) : (
            capaItems.map((item) => (
              <div key={item.issueId} className="ios-card p-3.5 space-y-2 border-slate-800">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-orange-400">{item.issueId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        item.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.severity === 'MAJOR'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white block">
                      Asset Tag: {item.assetId} • {item.unit}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase font-mono ${
                    item.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {item.faultDescription}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Raised: <b className="text-slate-300">{item.dateRaised}</b></span>
                  <span>Assigned: <b className="text-slate-300">{item.assignedTo}</b></span>

                  {item.status === 'OPEN' && (
                    <button
                      onClick={() => {
                        AppleHaptics.success();
                        fpsService.resolveCAPAItem(item.issueId, 'Rectified by duty fireman & certified.');
                        refreshLocalData();
                        showToast(`✓ Ticket ${item.issueId} marked RESOLVED!`);
                      }}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Asset Cards List */
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {activeTab === 'slice-pending' ? 'Pending Assets This Month' : 'Fire Protection Asset Registry'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Showing {filteredAssets.length} nodes
            </span>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="ios-card p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-sm text-slate-200">
                {activeTab === 'slice-pending'
                  ? 'All Set! Zero Pending Inspections This Month'
                  : 'No matching assets found.'}
              </p>
              <p className="text-xs mt-1">
                {activeTab === 'slice-pending'
                  ? 'Every physical fire asset in this slice is certified operational.'
                  : 'Try searching with a different ID or filter.'}
              </p>
            </div>
          ) : (
            filteredAssets.slice(0, 150).map((asset) => {
              const pending = isPendingThisMonth(asset);
              return (
                <div
                  key={asset.id}
                  className="ios-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-slate-800/90 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-500/20">
                        {asset.id}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {asset.type}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-800">
                        {asset.unit}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                      <span>📍 <b className="text-white">{asset.location || 'Site Plant'}</b></span>
                      <span>Floor: <b className="text-white">{asset.floor || 'GF'}</b></span>
                      {asset.capacity && <span>• Spec: <b className="text-amber-300">{asset.capacity}</b></span>}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-0.5">
                      <span>Last Inspected: <b className={pending ? 'text-amber-400' : 'text-emerald-400'}>{asset.lastInspection || 'Never'}</b></span>
                      <span>• Health: <b className="text-white">{asset.conditionScore}%</b></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {pending ? (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending This Month
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Operational
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenInspection(asset)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md flex items-center gap-1.5 ${
                        pending
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-500 hover:to-amber-500'
                          : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <span>{pending ? 'Inspect Now' : 'Re-Inspect'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 76-NODE FORENSIC INSPECTION MODAL */}
      {inspectingAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Forensic Inspection Form
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Asset ID: <b className="text-orange-400 font-mono">{inspectingAsset.id}</b> • {inspectingAsset.type}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingAsset(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Asset Identity Card */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-bold text-white">{inspectingAsset.location} (Floor: {inspectingAsset.floor})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Unit:</span>
                  <span className="font-bold text-orange-300">{inspectingAsset.unit}</span>
                </div>
                {inspectingAsset.capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Rating / Capacity:</span>
                    <span className="font-mono font-bold text-amber-300">{inspectingAsset.capacity}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions & Status Toggle */}
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-800/40 rounded-2xl border border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      AppleHaptics.light();
                      setModalStatus('Operational');
                      setModalScore(100);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                      modalStatus === 'Operational'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ✓ Operational
                  </button>
                  <button
                    onClick={() => {
                      AppleHaptics.warning();
                      setModalStatus('Defective');
                      setModalScore(65);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                      modalStatus === 'Defective'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ⚠️ Defective
                  </button>
                </div>

                <button
                  onClick={handleApplyQuickPass}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs active:scale-95 transition-all shadow-sm flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Tap Pass (All OK)</span>
                </button>
              </div>

              {/* Environmental & Forensic Metadata */}
              <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                <span className="font-black uppercase tracking-wider text-slate-400 text-[10px] block">
                  Directive Metadata (Q-01 - Q-13)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Q-13 Verified Tag SN</label>
                    <input
                      type="text"
                      value={modalSerialNo}
                      onChange={e => setModalSerialNo(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Q-12 Ambient Temp (°C)</label>
                    <input
                      type="number"
                      value={modalTemp}
                      onChange={e => setModalTemp(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400 font-mono">
                    GPS: <span className="text-white">{modalGps || 'Awaiting lock'}</span>
                  </div>
                  <button
                    onClick={handleCaptureGps}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-bold text-xs border border-slate-700"
                  >
                    📍 Lock GPS
                  </button>
                </div>
              </div>

              {/* Contextual Asset-Specific Checklist */}
              <div className="space-y-2.5">
                <span className="font-black uppercase tracking-wider text-slate-400 text-[10px] block px-1">
                  Technical Checklist Directives
                </span>

                {/* Extinguisher Directives (Q-14 to Q-18) */}
                {inspectingAsset.type.toLowerCase().includes('extinguisher') && (
                  <div className="space-y-2">
                    {[
                      { key: 'FE_Discharge_Hose', q: 'Q-14 Discharge Hose: Any cracks or blockage?' },
                      { key: 'FE_Discharge_Nozzle', q: 'Q-15 Discharge Nozzle: Clear & undamaged?' },
                      { key: 'FE_Safety_Pin_Seal', q: 'Q-16 Safety Pin & Lead Seal: Unbroken & intact?' },
                      { key: 'FE_Mounting', q: 'Q-17 Wall Mounting: Securely hung & accessible?' },
                      { key: 'FE_Cleanliness', q: 'Q-18 Cylinder Body: Clean & labels readable?' }
                    ].map(item => (
                      <div key={item.key} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300">{item.q}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              AppleHaptics.light();
                              setChecklistValues({ ...checklistValues, [item.key]: 'OK' });
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'OK'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              AppleHaptics.warning();
                              setChecklistValues({ ...checklistValues, [item.key]: 'Defect' });
                              setModalStatus('Defective');
                              setModalScore(80);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'Defect'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Defect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hose Reel Directives (Q-19 to Q-22) */}
                {inspectingAsset.type.toLowerCase().includes('hose') && (
                  <div className="space-y-2">
                    {[
                      { key: 'HRH_Drum_Rotation', q: 'Q-19 Drum Rotation: Free rotation without jamming?' },
                      { key: 'HRH_Pipe_Condition', q: 'Q-20 Supply Pipes: Free of leakage / corrosion?' },
                      { key: 'HRH_Nozzle_Condition', q: 'Q-21 Shut-off Nozzle: Operational & adjustable spray?' },
                      { key: 'HRH_Operational_Status', q: 'Q-22 Overall Assembly: Ready for immediate use?' }
                    ].map(item => (
                      <div key={item.key} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300">{item.q}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              AppleHaptics.light();
                              setChecklistValues({ ...checklistValues, [item.key]: 'OK' });
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'OK'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              AppleHaptics.warning();
                              setChecklistValues({ ...checklistValues, [item.key]: 'Defect' });
                              setModalStatus('Defective');
                              setModalScore(75);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'Defect'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Defect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hydrant Directives (Q-23 to Q-35) */}
                {inspectingAsset.type.toLowerCase().includes('hydrant') && (
                  <div className="space-y-2">
                    {[
                      { key: 'HYD_Butterfly_Valve', q: 'Q-23 Butterfly Valve: Cycles smoothly?' },
                      { key: 'HYD_Operating_Wheel', q: 'Q-24 Handwheel: Undamaged & securely keyed?' },
                      { key: 'HYD_Female_Coupling_Washer', q: 'Q-25 Rubber Coupling Washer: Present & supple?' },
                      { key: 'HYD_Lugs_Condition', q: 'Q-26 Coupling Lugs: Straight & undamaged?' },
                      { key: 'HYD_Blank_Cap', q: 'Q-27 Blank Cap: Present & tightened?' },
                      { key: 'HYD_Lubrication', q: 'Q-28 Valve Stems: Adequately greased?' },
                      { key: 'HYD_Box_Glass', q: 'Q-31 Hose Box Glass: Intact & clean?' },
                      { key: 'HYD_Glass_Breaker', q: 'Q-32 Glass Breaker Hammer: Available?' },
                      { key: 'HYD_Box_Key', q: 'Q-33 Box Key: Present inside holder?', isKey: true },
                      { key: 'HYD_Branch_Nozzle', q: 'Q-34 Branch Pipe: Present in box?' }
                    ].map(item => (
                      <div key={item.key} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300">{item.q}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              AppleHaptics.light();
                              setChecklistValues({ ...checklistValues, [item.key]: item.isKey ? 'Available' : 'OK' });
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'OK' || checklistValues[item.key] === 'Available'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.isKey ? 'Available' : 'OK'}
                          </button>
                          <button
                            onClick={() => {
                              AppleHaptics.warning();
                              setChecklistValues({ ...checklistValues, [item.key]: item.isKey ? 'Missing' : 'Defect' });
                              setModalStatus('Defective');
                              setModalScore(70);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'Defect' || checklistValues[item.key] === 'Missing'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.isKey ? 'Missing' : 'Defect'}
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-300">Q-35 Hose Quantity (2 lengths expected)</span>
                      <input
                        type="number"
                        value={checklistValues['HYD_Hose_Quantity'] || 2}
                        onChange={e => setChecklistValues({ ...checklistValues, HYD_Hose_Quantity: parseInt(e.target.value, 10) || 0 })}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono font-bold text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Detector Directives (Q-74 to Q-75) */}
                {inspectingAsset.type.toLowerCase().includes('detector') && (
                  <div className="space-y-2">
                    {[
                      { key: 'DET_LED_Flashing', q: 'Q-74 Detector LED: Flashing normally in standby mode?' },
                      { key: 'DET_Alarm_Test_Working', q: 'Q-75 Alarm Test: Triggers alarm signal on test aerosol?' }
                    ].map(item => (
                      <div key={item.key} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300">{item.q}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              AppleHaptics.light();
                              setChecklistValues({ ...checklistValues, [item.key]: 'OK' });
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'OK'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              AppleHaptics.warning();
                              setChecklistValues({ ...checklistValues, [item.key]: 'Defect' });
                              setModalStatus('Defective');
                              setModalScore(80);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'Defect'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Defect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Deluge Valve Directives (Q-57 to Q-73) */}
                {(inspectingAsset.type.toLowerCase().includes('dv') || inspectingAsset.type.toLowerCase().includes('valve')) && (
                  <div className="space-y-2">
                    {[
                      { key: 'DV_AFR_Condition', q: 'Q-60 Air Filter Regulator: Functional?' },
                      { key: 'DV_SOV_Condition', q: 'Q-61 Solenoid Valve SOV: Acting correctly?' },
                      { key: 'DV_Pr_Switch_Delivery', q: 'Q-62 Delivery Pr Switch: Signalling OK?' },
                      { key: 'DV_BV_Delivery', q: 'Q-64 Main Delivery Valve: Open & locked?' },
                      { key: 'DV_PLC_Interlock', q: 'Q-70 PLC Interlock: Dry-fire prevention verified?' }
                    ].map(item => (
                      <div key={item.key} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300">{item.q}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              AppleHaptics.light();
                              setChecklistValues({ ...checklistValues, [item.key]: 'OK' });
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'OK'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              AppleHaptics.warning();
                              setChecklistValues({ ...checklistValues, [item.key]: 'Defect' });
                              setModalStatus('Defective');
                            }}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                              checklistValues[item.key] === 'Defect'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Defect
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inspector Remarks (Q-76) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Q-76 Forensic Remarks & Defect Notes
                </label>
                <textarea
                  rows={2}
                  value={modalRemarks}
                  onChange={e => setModalRemarks(e.target.value)}
                  placeholder="Enter observation notes, physical condition, or defect explanation..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Digital Signature Pad (Q-09) */}
              <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Q-09 Fireman Digital Signature
                  </span>
                  <button
                    onClick={clearSignature}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    Clear
                  </button>
                </div>

                <div className="relative rounded-xl border border-dashed border-slate-700 bg-slate-900 h-24 overflow-hidden touch-none">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={100}
                    className="w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasSigned && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-600 text-xs font-mono">
                      ✍️ Sign with finger or stylus
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
              <button
                onClick={() => setInspectingAsset(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitInspection}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Certify & Submit Inspection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR SCANNER & MANUAL LOOKUP MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-400" />
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  Scan QR / Equipment Tag
                </h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Type or scan any physical tag ID (e.g. <b>1</b>, <b>00683</b>, <b>FE31</b>, <b>DGLEL 01</b>, <b>PMP-D-001</b>).
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={qrManualInput}
                  onChange={e => setQrManualInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && qrManualInput.trim()) {
                      handleQrLookup(qrManualInput);
                    }
                  }}
                  placeholder="Enter Asset ID or Scan Code..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQrLookup(qrManualInput)}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  Find Asset
                </button>

                <button
                  onClick={() => {
                    // Try quick test asset
                    handleQrLookup('1');
                  }}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 active:scale-95 transition-all"
                >
                  Quick Tag #1
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUMP 45-MIN DUTY CYCLE RUNNER MODAL */}
      {pumpTestActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                  <Activity className="w-5 h-5 animate-pulse text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Pump 45-Min Duty Cycle Engine
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Directives Q-36 to Q-56 • Rated 2250 USGPM @ 8.5 Bar
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPumpTestActive(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Select Pump */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'PMP-D-001', name: 'Diesel Engine Pump' },
                  { id: 'PMP-E-001', name: 'Electric Motor Pump' },
                  { id: 'PMP-J-001', name: 'Jockey Pump' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPumpTestData({ ...pumpTestData, pumpId: p.id })}
                    className={`p-2.5 rounded-xl text-center font-bold text-xs transition-all ${
                      pumpTestData.pumpId === p.id
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <span className="block font-mono text-[10px] opacity-80">{p.id}</span>
                    <span className="text-[11px] block">{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Time Matrix */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Q-36 Start Time</label>
                  <input
                    type="time"
                    value={pumpTestData.startTime}
                    onChange={e => setPumpTestData({ ...pumpTestData, startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Q-37 End Time (45 min)</label>
                  <input
                    type="time"
                    value={pumpTestData.endTime}
                    onChange={e => setPumpTestData({ ...pumpTestData, endTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Pressure Matrix (0, 15, 30, 45 min) */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-black uppercase tracking-wider text-slate-400 text-[10px] block">
                  Duty Pressure Log (Bar) & RPM Curves
                </span>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1">
                  <span>Interval</span>
                  <span>Suction</span>
                  <span>Discharge</span>
                  <span>RPM</span>
                </div>

                {[
                  { label: '0 Min', sKey: 'suction0', dKey: 'discharge0', rKey: 'rpm0' },
                  { label: '15 Min', sKey: 'suction15', dKey: 'discharge15', rKey: 'rpm15' },
                  { label: '30 Min', sKey: 'suction30', dKey: 'discharge30', rKey: 'rpm30' },
                  { label: '45 Min', sKey: 'suction45', dKey: 'discharge45', rKey: 'rpm45' }
                ].map(row => (
                  <div key={row.label} className="grid grid-cols-4 gap-2 items-center text-center">
                    <span className="font-bold text-slate-300 text-xs">{row.label}</span>
                    <input
                      type="text"
                      value={(pumpTestData as any)[row.sKey]}
                      onChange={e => setPumpTestData({ ...pumpTestData, [row.sKey]: e.target.value })}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-white text-xs"
                    />
                    <input
                      type="text"
                      value={(pumpTestData as any)[row.dKey]}
                      onChange={e => setPumpTestData({ ...pumpTestData, [row.dKey]: e.target.value })}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-emerald-400 font-bold text-xs"
                    />
                    <input
                      type="text"
                      value={(pumpTestData as any)[row.rKey]}
                      onChange={e => setPumpTestData({ ...pumpTestData, [row.rKey]: e.target.value })}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-center font-mono text-white text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Auxiliary Parameters (Oil, Temp, Batteries, Flow) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Q-51 Flow (USGPM)</span>
                  <input
                    type="text"
                    value={pumpTestData.flowGpm}
                    onChange={e => setPumpTestData({ ...pumpTestData, flowGpm: e.target.value })}
                    className="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white font-bold"
                  />
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Q-52 Engine Temp (°C)</span>
                  <input
                    type="text"
                    value={pumpTestData.temp}
                    onChange={e => setPumpTestData({ ...pumpTestData, temp: e.target.value })}
                    className="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white font-bold"
                  />
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Q-53 Oil Pr (Bar)</span>
                  <input
                    type="text"
                    value={pumpTestData.oilPr}
                    onChange={e => setPumpTestData({ ...pumpTestData, oilPr: e.target.value })}
                    className="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white font-bold"
                  />
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Q-54 Battery 1 (V)</span>
                  <input
                    type="text"
                    value={pumpTestData.bat1}
                    onChange={e => setPumpTestData({ ...pumpTestData, bat1: e.target.value })}
                    className="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 font-bold"
                  />
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Q-55 Battery 2 (V)</span>
                  <input
                    type="text"
                    value={pumpTestData.bat2}
                    onChange={e => setPumpTestData({ ...pumpTestData, bat2: e.target.value })}
                    className="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 font-bold"
                  />
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Q-56 Load %</span>
                  <input
                    type="text"
                    value={pumpTestData.load}
                    onChange={e => setPumpTestData({ ...pumpTestData, load: e.target.value })}
                    className="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
              <button
                onClick={() => setPumpTestActive(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Close
              </button>

              <button
                onClick={handleSubmitPumpDuty}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Certify 45-Min Duty Run</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
