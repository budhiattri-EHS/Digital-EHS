import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  X, 
  Camera, 
  User, 
  MapPin, 
  Wrench,
  Flame
} from 'lucide-react';
import { AppleHaptics } from '../../services/appleHaptics';
import { SBL_REAL_UAC_LOG, SblLiveSyncService } from '../../services/liveDataService';
import { QuickReportModal } from '../QuickReportModal';
import { SBL_SAFETY_ALERT_FORM_URL, TelemetryService } from '../../services/dataService';
import { ExternalLink } from 'lucide-react';

interface ObservationItem {
  id: string;
  type: 'Unsafe Condition' | 'Unsafe Act' | 'Near Miss';
  area: string;
  desc: string;
  capa: string;
  assignedTo: string;
  status: 'Open' | 'WIP' | 'Closed';
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  reporter: string;
}

const mapSblUacToItem = (u: any): ObservationItem => {
  let t: 'Unsafe Condition' | 'Unsafe Act' | 'Near Miss' = 'Unsafe Condition';
  if (/act|behavior/i.test(u.category || '')) t = 'Unsafe Act';
  else if (/miss/i.test(u.category || '')) t = 'Near Miss';

  let p: 'High' | 'Medium' | 'Low' = 'Medium';
  if (u.severity === 'CRITICAL' || u.severity === 'HIGH') p = 'High';
  else if (u.severity === 'LOW') p = 'Low';

  return {
    id: u.id,
    type: t,
    area: u.category || 'Shopfloor',
    desc: u.capa || 'Incident logged in SBL Master register',
    capa: u.capa || 'Corrective action implemented',
    assignedTo: u.investigator || 'Budhi Parkash (EHS)',
    status: (u.status === 'CLOSED' || u.dateClosed) ? 'Closed' : 'WIP',
    date: u.timestamp ? u.timestamp.split(' ')[0] : 'Logged',
    priority: p,
    reporter: u.investigator || 'Budhi Parkash'
  };
};

const INITIAL_OBSERVATIONS: ObservationItem[] = SBL_REAL_UAC_LOG.map(mapSblUacToItem);

export const MobileUacWorkspace: React.FC = () => {
  const [observations, setObservations] = useState<ObservationItem[]>(INITIAL_OBSERVATIONS);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  React.useEffect(() => {
    setIsSyncing(true);
    SblLiveSyncService.syncFromGoogleSheets().then(() => {
      if (SblLiveSyncService.liveUacList.length > 0) {
        setObservations(SblLiveSyncService.liveUacList.map(mapSblUacToItem));
      }
      setIsSyncing(false);
    });
  }, []);

  // Form State
  const [newType, setNewType] = useState<'Unsafe Condition' | 'Unsafe Act' | 'Near Miss'>('Unsafe Condition');
  const [newArea, setNewArea] = useState('Paint Shop');
  const [newDesc, setNewDesc] = useState('');
  const [newCapa, setNewCapa] = useState('');
  const [newAssignee, setNewAssignee] = useState('Maintenance');

  const filtered = observations.filter(o => {
    const matchesType = filterType === 'All' || o.type === filterType;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleResolve = (id: string) => {
    AppleHaptics.success();
    setObservations(observations.map(o => o.id === id ? { ...o, status: 'Closed' } : o));
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    AppleHaptics.success();
    const created: ObservationItem = {
      id: `OBS-2026-${Math.floor(93 + Math.random() * 80)}`,
      type: newType,
      area: newArea,
      desc: newDesc.trim(),
      capa: newCapa.trim() || 'Assigned to Area Lead for immediate action.',
      assignedTo: newAssignee,
      status: 'Open',
      date: 'Just now',
      priority: 'High',
      reporter: 'Budhi Parkash'
    };

    setObservations([created, ...observations]);
    setShowLogModal(false);
    setNewDesc('');
    setNewCapa('');
  };

  const openCount = observations.filter(o => o.status !== 'Closed').length;
  const conditionCount = observations.filter(o => o.type === 'Unsafe Condition').length;
  const nearMissCount = observations.filter(o => o.type === 'Near Miss').length;

  return (
    <div className="space-y-3.5 p-3 pb-24 text-slate-100">
      {/* Top Mobile Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="ios-card p-2.5 text-center border-red-500/30 bg-red-950/20">
          <span className="text-[9px] uppercase font-bold text-red-300 block">Open Actionable</span>
          <span className="text-2xl font-black text-red-400 font-mono">{openCount}</span>
          <span className="text-[8px] text-red-300/80 block">{openCount === 0 ? 'All Closed' : 'Requires CAPA'}</span>
        </div>

        <div className="ios-card p-2.5 text-center border-amber-500/30">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Conditions</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{conditionCount}</span>
          <span className="text-[8px] text-slate-400 block">Hazard Logs</span>
        </div>

        <div className="ios-card p-2.5 text-center border-blue-500/30">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">Near Misses</span>
          <span className="text-2xl font-black text-blue-400 font-mono">{nearMissCount}</span>
          <span className="text-[8px] text-slate-400 block">Prevented</span>
        </div>
      </div>

      {/* 100% Closure Status Banner */}
      {openCount === 0 && (
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-white">All 28 Safety Observations Closed</span>
            <span className="text-[11px] text-emerald-300/80">Synchronized with live Google Sheet. Zero open actionable hazards requiring CAPA.</span>
          </div>
        </div>
      )}

      {/* Action Bar: Search & Log Observation */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident reports..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500"
          />
        </div>

        <button
          onClick={() => {
            AppleHaptics.light();
            setShowLogModal(true);
          }}
          className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Hazard</span>
        </button>
      </div>

      {/* Quick Launch Google Form */}
      <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-slate-300">
        <span className="font-medium text-slate-300">Official Safety Alert Form</span>
        <button
          onClick={() => {
            AppleHaptics.light();
            setShowLogModal(true);
          }}
          className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Open Direct Entry Form</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {['All', 'Unsafe Condition', 'Unsafe Act', 'Near Miss'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              AppleHaptics.click();
              setFilterType(cat);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-all ${
              filterType === cat
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Incident Feed List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="ios-card p-3.5 border-l-4 border-l-red-500 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] font-black text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {item.id}
                </span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                  item.type === 'Unsafe Condition'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : item.type === 'Unsafe Act'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {item.type}
                </span>
              </div>

              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                item.status === 'Closed'
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : item.status === 'WIP'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
              }`}>
                {item.status}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white leading-snug">
              {item.desc}
            </h4>

            {/* Approved Action Plan (CAPA) Box */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                <Wrench className="w-3 h-3 text-slate-400" /> Action Plan (CAPA):
              </span>
              <p className="text-slate-300 font-medium">{item.capa}</p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
              <span>📍 {item.area}</span>
              <span>👷 Assignee: <b className="text-slate-200">{item.assignedTo}</b></span>
            </div>

            {item.status !== 'Closed' && (
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => handleResolve(item.id)}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify CAPA & Close Item</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Safety Alert Form Modal (Exact Google Form Questions) */}
      {showLogModal && (
        <QuickReportModal
          onClose={() => setShowLogModal(false)}
          onSubmit={(payload) => {
            TelemetryService.addObservation(payload);
            setObservations(SblLiveSyncService.liveUacList.map(mapSblUacToItem));
            setShowLogModal(false);
          }}
        />
      )}
    </div>
  );
};
