import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Search, 
  CheckCircle2, 
  X, 
  ExternalLink,
  RefreshCw,
  Download,
  Eye,
  FileText,
  MapPin,
  Building,
  User,
  ShieldAlert
} from 'lucide-react';
import { AppleHaptics } from '../../services/appleHaptics';
import { 
  SblLiveSyncService, 
  SBL_REAL_PTW_LIST, 
  SblPtwRecord, 
  PtwStats 
} from '../../services/liveDataService';

export const MobilePtwWorkspace: React.FC = () => {
  const [permits, setPermits] = useState<SblPtwRecord[]>(SblLiveSyncService.livePtwList.length > 0 ? SblLiveSyncService.livePtwList : SBL_REAL_PTW_LIST);
  const [stats, setStats] = useState<PtwStats>(SblLiveSyncService.livePtwStats);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [syncStatusText, setSyncStatusText] = useState<string>('SECURE CONNECTION');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Closed' | 'Rejected'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedPermit, setSelectedPermit] = useState<SblPtwRecord | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Issue modal fields
  const [newType, setNewType] = useState('Hot Work');
  const [newLocation, setNewLocation] = useState('Unit 3 - Production Extn');
  const [newVendor, setNewVendor] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newRequestor, setNewRequestor] = useState('Budhi Parkash');

  // Initial live fetch
  useEffect(() => {
    handleCloudSync(false);
  }, []);

  const handleCloudSync = async (triggerHaptic = true) => {
    if (triggerHaptic) AppleHaptics.light();
    setIsSyncing(true);
    setSyncStatusText('SYNCING CLOUD...');

    try {
      const res = await SblLiveSyncService.fetchLivePtwRecords();
      if (res.success && res.permits.length > 0) {
        setPermits(res.permits);
        setStats(res.stats);
        setSyncStatusText('SECURE CONNECTION');
        setLastSyncTime(new Date().toLocaleTimeString());
        if (triggerHaptic) AppleHaptics.success();
      } else {
        setSyncStatusText('AUTHENTICATED CACHE');
      }
    } catch {
      setSyncStatusText('OFFLINE (CACHED)');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCSV = () => {
    AppleHaptics.click();
    if (permits.length === 0) return;

    let csv = "Permit Number,Type,Vendor,Location,Status,Requestor,Validity,Description,PDF Link\n";
    filteredPermits.forEach(p => {
      const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
      csv += `${escape(p.id)},${escape(p.permitType)},${escape(p.vendor)},${escape(p.area)},${escape(p.status)},${escape(p.requestor)},${escape(p.validity)},${escape(p.desc)},${escape(p.pdfUrl)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SBL_PTW_KPI_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    AppleHaptics.success();
  };

  const handleIssuePermit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    AppleHaptics.success();
    const nextId = `PTW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1821 + Math.random() * 50)}`;
    const created: SblPtwRecord = {
      id: nextId,
      permitType: newType,
      isHighRisk: newType !== 'General / Cold',
      status: 'Approved',
      area: newLocation,
      desc: newDesc.trim(),
      vendor: newVendor.trim() || 'SBL Maintenance',
      requestor: newRequestor.trim() || 'Budhi Parkash',
      startDate: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      endDate: '5:30 pm',
      validity: `${new Date().toLocaleDateString('en-IN', { dateStyle: 'short' })}, 9:00 am - 5:30 pm`,
      pdfUrl: '',
      emergencyContact: '+91 98765 43210 (Budhi Parkash - EHS)',
      hazards: [newType, 'Plant Operating Area Boundary'],
      controls: ['LOTO and safety isolation confirmed', 'Certified PPE issued and worn']
    };

    setPermits([created, ...permits]);
    setShowIssueModal(false);
    setNewDesc('');
    setNewVendor('');
  };

  const handleClosePermit = (id: string) => {
    AppleHaptics.click();
    setPermits(permits.map(p => p.id === id ? { ...p, status: 'Closed' } : p));
    if (selectedPermit?.id === id) {
      setSelectedPermit({ ...selectedPermit, status: 'Closed' });
    }
  };

  // Filter logic
  const filteredPermits = permits.filter(p => {
    const s = searchQuery.toLowerCase();
    const textMatch = !searchQuery || 
      p.id.toLowerCase().includes(s) ||
      p.vendor.toLowerCase().includes(s) ||
      p.area.toLowerCase().includes(s) ||
      p.desc.toLowerCase().includes(s) ||
      p.requestor.toLowerCase().includes(s);

    const statusLower = (p.status || '').toLowerCase();
    let statusMatch = true;
    if (statusFilter === 'Pending') statusMatch = statusLower.includes('pending');
    else if (statusFilter === 'Approved') statusMatch = statusLower.includes('approved') || statusLower.includes('active');
    else if (statusFilter === 'Closed') statusMatch = statusLower.includes('closed') || statusLower.includes('expired');
    else if (statusFilter === 'Rejected') statusMatch = statusLower.includes('reject') || statusLower.includes('revoke');

    let typeMatch = true;
    if (typeFilter !== 'All') {
      typeMatch = p.permitType.toLowerCase().includes(typeFilter.toLowerCase());
    }

    return textMatch && statusMatch && typeMatch;
  });

  return (
    <div className="space-y-4 p-3 pb-24 text-slate-100 max-w-4xl mx-auto">
      {/* 1. Header Card with Brand Attribution */}
      <div className="ios-card p-4 text-center relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div className="flex justify-center mb-2.5">
          <img 
            src="https://lh3.googleusercontent.com/d/1qHnrfpJzV2XcKIlDCUYTwJZQczgX7uBG" 
            alt="SBL Specialty Coatings" 
            className="h-10 object-contain drop-shadow"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        </div>

        <h1 className="text-lg font-black tracking-tight uppercase text-white">
          PERMIT TO WORK - DASHBOARD
        </h1>
        <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest mt-0.5">
          Created, Developed and Maintained by Mr. Budhi Parkash
        </p>

        {/* Sync Status Badge */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400">
          <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
          <span>{syncStatusText}</span>
          <span className="text-slate-400 font-mono font-normal">({lastSyncTime})</span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={() => handleCloudSync(true)}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-300'}`} />
            <span>SYNC CLOUD</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-900/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT KPI</span>
          </button>

          <button
            onClick={() => {
              AppleHaptics.light();
              setShowIssueModal(true);
            }}
            className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-900/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ISSUE PTW</span>
          </button>

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSdrnuPz8L4-AUu0PGQqe4xveZ0Mmy2pXU77bE_Al9iugsDVtQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => AppleHaptics.click()}
            className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>GOOGLE FORM</span>
          </a>
        </div>
      </div>

      {/* 2. Real KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        {/* Card 1: Pending Approval */}
        <div className="ios-card p-3.5 text-center border-t-4 border-t-amber-500 bg-slate-900/90 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            PENDING APPROVAL
          </span>
          <div className="text-3xl font-black text-amber-500 font-mono mt-1">
            {stats.pending}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Awaiting Area Incharge / EHS
          </span>
        </div>

        {/* Card 2: Revoked / Rejected */}
        <div className="ios-card p-3.5 text-center border-t-4 border-t-red-500 bg-slate-900/90 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            REVOKED / REJECTED
          </span>
          <div className="text-3xl font-black text-red-500 font-mono mt-1">
            {stats.rejected}
          </div>
          <span className="text-[10px] text-red-300/80 block mt-0.5">
            Safety Violation / Incomplete
          </span>
        </div>

        {/* Card 3: Total Approved Executions (spans 2 cols on tablet/desktop) */}
        <div className="ios-card p-3.5 md:col-span-2 border-t-4 border-t-emerald-500 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 shadow-sm">
          <div className="text-center mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
              TOTAL APPROVED EXECUTIONS
            </span>
          </div>
          <div className="grid grid-cols-4 text-center divide-x divide-slate-800">
            <div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                {stats.today}
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Today</span>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                {stats.yesterday}
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Yesterday</span>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                {stats.mtd}
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400">MTD</span>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                {stats.ytd.toLocaleString()}
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400">YTD</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search and Status Filter Row */}
      <div className="ios-card p-3 space-y-2.5 bg-slate-900/90 border border-slate-800">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search registry */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registry by Permit #, Vendor, Location, or Description..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter dropdown */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                AppleHaptics.click();
                setStatusFilter(e.target.value as any);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 font-semibold"
            >
              <option value="ALL">All Records</option>
              <option value="Pending">Pending / In-Route</option>
              <option value="Approved">Approved / Active</option>
              <option value="Closed">Closed / Completed</option>
              <option value="Rejected">Rejected / Revoked</option>
            </select>
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['All', 'Hot Work', 'Height Work', 'Confined Space', 'Line Breaking', 'Excavation', 'Hoisting', 'General / Cold'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                AppleHaptics.click();
                setTypeFilter(cat);
              }}
              className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap active:scale-95 transition-all text-[11px] ${
                typeFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Registry Count */}
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-800/60">
          <span>SHOWING {filteredPermits.length} OF {permits.length} REGISTERED PERMITS</span>
          {stats.today === 0 && (
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 0 Active Permits on Floor Today
            </span>
          )}
        </div>
      </div>

      {/* 4. Permits Registry Feed */}
      <div className="space-y-2.5">
        {filteredPermits.length === 0 ? (
          <div className="ios-card p-8 text-center text-slate-400 border border-slate-800">
            <ClipboardCheck className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-300 uppercase">NO MATCHING PERMITS FOUND</p>
            <p className="text-[11px] text-slate-500 mt-1">Adjust search terms or reset filters to view registry records.</p>
          </div>
        ) : (
          filteredPermits.map((permit) => {
            const isApproved = permit.status.toLowerCase().includes('approved') || permit.status.toLowerCase().includes('active');
            const isPending = permit.status.toLowerCase().includes('pending');
            const isRejected = permit.status.toLowerCase().includes('reject') || permit.status.toLowerCase().includes('revoke');

            const typeColor = 
              permit.permitType.includes('Hot') ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
              permit.permitType.includes('Height') ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
              permit.permitType.includes('Confined') ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
              permit.permitType.includes('Line') ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              permit.permitType.includes('Excavation') ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
              permit.permitType.includes('Hoisting') ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
              'bg-slate-800 text-slate-300 border-slate-700';

            return (
              <div
                key={permit.id}
                className={`ios-card p-3.5 border-l-4 transition-all bg-slate-900/90 border border-slate-800 hover:border-slate-700 ${
                  isApproved ? 'border-l-emerald-500 shadow-md shadow-emerald-950/20' :
                  isPending ? 'border-l-amber-500' :
                  isRejected ? 'border-l-red-500' :
                  'border-l-slate-600 opacity-90'
                }`}
              >
                {/* Header row: ID, Type badge, Status badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[11px] font-black text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {permit.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${typeColor} flex items-center gap-1`}>
                      {permit.permitType.includes('Hot') && <Flame className="w-2.5 h-2.5 text-orange-400" />}
                      {permit.permitType}
                    </span>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isApproved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                    isPending ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse' :
                    isRejected ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {permit.status}
                  </span>
                </div>

                {/* Work Description */}
                <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed">
                  {permit.desc}
                </h4>

                {/* Meta details: Vendor, Location, Requestor, Validity */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate"><b>{permit.vendor}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{permit.area}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Req: <b className="text-slate-300 font-medium">{permit.requestor}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-300">{permit.validity}</span>
                  </div>
                </div>

                {/* Touch Action Controls */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {permit.pdfUrl ? (
                      <a
                        href={permit.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => AppleHaptics.click()}
                        className="py-1 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/40 font-bold text-[11px] flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <FileText className="w-3 h-3 text-blue-400" />
                        <span>VIEW PDF</span>
                        <ExternalLink className="w-2.5 h-2.5 ml-0.5 text-blue-400" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 bg-slate-950 rounded border border-slate-800">
                        PDF PENDING
                      </span>
                    )}

                    <button
                      onClick={() => {
                        AppleHaptics.light();
                        setSelectedPermit(permit);
                      }}
                      className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center gap-1 active:scale-95"
                    >
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>Details</span>
                    </button>
                  </div>

                  {isApproved && (
                    <button
                      onClick={() => handleClosePermit(permit.id)}
                      className="py-1 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1 active:scale-95"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>⚡ Close Permit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Issue New Permit Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="ios-sheet w-full max-w-md p-5 max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="ios-grabber sm:hidden"></div>

            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-xs font-black uppercase text-white">Issue Plant Maintenance PTW</h3>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssuePermit} className="space-y-3 text-xs text-left">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Permit Class</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Hot Work', 'Height Work', 'Confined Space', 'Line Breaking', 'Excavation', 'General / Cold'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        AppleHaptics.click();
                        setNewType(t);
                      }}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                        newType === t
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Area / Location</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Unit 3 - Production Extn, R&D..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Work Description *</label>
                <textarea
                  required
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Pipe insulation and support fabrication..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Contractor / Performing Team</label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  placeholder="e.g. Jot Electrical / SBL Maintenance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Requestor Name</label>
                <input
                  type="text"
                  value={newRequestor}
                  onChange={(e) => setNewRequestor(e.target.value)}
                  placeholder="e.g. Budhi Parkash / Tarun Bansal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-900/40"
                >
                  Authorize & Issue Live Permit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. View Permit Safety Details Modal */}
      {selectedPermit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="ios-sheet w-full max-w-md p-5 max-h-[85vh] overflow-y-auto space-y-3 text-xs bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="ios-grabber sm:hidden"></div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400">{selectedPermit.id}</span>
                <h3 className="text-sm font-bold text-white">{selectedPermit.permitType} Safety Registry</h3>
              </div>
              <button onClick={() => setSelectedPermit(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Work Description</span>
              <p className="text-white font-medium leading-relaxed">{selectedPermit.desc}</p>
              <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <span>📍 <b>Location:</b> {selectedPermit.area}</span>
                <span>🏢 <b>Vendor:</b> {selectedPermit.vendor}</span>
                <span>👤 <b>Requestor:</b> {selectedPermit.requestor}</span>
                <span>🕒 <b>Validity:</b> {selectedPermit.validity}</span>
                <span>📞 <b>Emergency:</b> {selectedPermit.emergencyContact || '+91 98765 43210 (Budhi Parkash - EHS)'}</span>
              </div>
            </div>

            {selectedPermit.pdfUrl && (
              <a
                href={selectedPermit.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => AppleHaptics.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/40"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Official Stamped PDF (Google Drive)</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}

            <button
              onClick={() => setSelectedPermit(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
