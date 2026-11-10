import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  X, 
  ShieldAlert, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  User, 
  Activity, 
  FileText, 
  AlertTriangle, 
  Flame, 
  CheckCircle, 
  Eye, 
  KeyRound, 
  Lock, 
  RotateCcw, 
  ShieldCheck,
  Send,
  Building,
  HelpCircle
} from 'lucide-react';
import { AppleHaptics } from '../../services/appleHaptics';
import { 
  SblLiveSyncService, 
  SBL_REAL_ENG_TICKETS, 
  SblEngTicket, 
  EngPortalStats,
  SblPermissionUser,
  SBL_PERMISSIONS
} from '../../services/liveDataService';

export const MobileEngineeringWorkspace: React.FC = () => {
  const [tickets, setTickets] = useState<SblEngTicket[]>(
    SblLiveSyncService.liveEngList.length > 0 ? SblLiveSyncService.liveEngList : SBL_REAL_ENG_TICKETS
  );
  const [stats, setStats] = useState<EngPortalStats>(SblLiveSyncService.liveEngStats);
  const [view, setView] = useState<'board' | 'vision'>('board');
  const [visionLens, setVisionLens] = useState<'Maintenance' | 'CapEx'>('Maintenance');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [syncStatusText, setSyncStatusText] = useState<string>('SYSTEM ACTIVE');

  // Custom Identity-First Notifications
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'WIP' | 'Resolved' | 'Closed' | 'CapEx'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Urgent' | 'Routine' | 'Project'>('All');
  const [sortOrder, setSortOrder] = useState<'Newest' | 'Oldest'>('Newest');

  // Modals & Active Actions
  const [selectedTicket, setSelectedTicket] = useState<SblEngTicket | null>(null);
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [activeAction, setActiveAction] = useState<{
    id: string;
    type: 'start' | 'resolve' | 'close' | 'reopen' | 'return' | 'update';
    dept: string;
    machine?: string;
  }>({ id: '', type: 'start', dept: '' });

  // PIN Modal Input State
  const [pin, setPin] = useState('');
  const [manpower, setManpower] = useState(1);
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  // New Ticket Form State
  const [selectedJobType, setSelectedJobType] = useState<'Breakdown' | 'Modification'>('Breakdown');
  const [reqComplainer, setReqComplainer] = useState('Budhi Parkash');
  const [reqMachine, setReqMachine] = useState('');
  const [reqDept, setReqDept] = useState('Production');
  const [reqPriority, setReqPriority] = useState<'Urgent' | 'Routine'>('Routine');
  const [reqDesc, setReqDesc] = useState('');
  const [hodPin, setHodPin] = useState('');

  // Toast auto-dismiss
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    if (type === 'success') AppleHaptics.success();
    else AppleHaptics.error();
  };

  // Initial live cloud sync
  useEffect(() => {
    handleCloudSync(false);
  }, []);

  const handleCloudSync = async (triggerHaptic = true) => {
    if (triggerHaptic) AppleHaptics.light();
    setIsSyncing(true);
    setSyncStatusText('SYNCING CLOUD...');

    try {
      const res = await SblLiveSyncService.fetchLiveEngineeringRecords();
      if (res.success && res.tickets.length > 0) {
        setTickets(res.tickets);
        setStats(res.stats);
        setSyncStatusText('SYSTEM ACTIVE');
        setLastSyncTime(new Date().toLocaleTimeString());
        if (triggerHaptic) AppleHaptics.success();
        showFeedback(`Synchronized ${res.tickets.length} tickets from Sheet`, 'success');
      } else {
        setSyncStatusText('AUTHENTICATED CACHE');
      }
    } catch {
      setSyncStatusText('OFFLINE (CACHED)');
      showFeedback("Working in fast offline authenticated mode", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Native CSV Export Engine matching DASHBOARD.HTML
  const handleExportCSV = () => {
    AppleHaptics.click();
    if (filteredTickets.length === 0) {
      showFeedback("No data available to export", "error");
      return;
    }

    const headers = [
      "Ticket_ID",
      "Status",
      "Priority",
      "Machine_Area",
      "Requesting_Dept",
      "Reported_By",
      "Logged_Date",
      "Risk_Flag",
      "Problem_Narrative",
      "Deployed_Manpower",
      "Man_Hours",
      "Closure_SignOff"
    ];
    const csvRows = [headers.join(',')];

    filteredTickets.forEach(t => {
      const safeNarrative = `"${String(t.desc || '').replace(/"/g, '""')}"`;
      const safeSignOff = `"${String(t.comments || '').replace(/"/g, '""')}"`;

      const cleanRow = [
        t.id,
        t.status,
        t.priority,
        `"${String(t.machine || '').replace(/"/g, '""')}"`,
        t.department,
        `"${String(t.complainer || '').replace(/"/g, '""')}"`,
        `"${String(t.date || '').replace(/"/g, '""')}"`,
        `"${String(t.riskFlag || '').replace(/"/g, '""')}"`,
        safeNarrative,
        t.manpower,
        t.leadTimeHours,
        safeSignOff
      ];
      csvRows.push(cleanRow.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SBL_Engineering_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback("Board View Data Exported Successfully", "success");
  };

  // Open PIN Modal
  const openPinModal = (
    id: string, 
    type: 'start' | 'resolve' | 'close' | 'reopen' | 'return' | 'update', 
    dept: string,
    machine?: string
  ) => {
    AppleHaptics.click();
    setActiveAction({ id, type, dept, machine });
    setPin('');
    setReason('');
    setRemarks('');
    setManpower(1);
    setShowPinModal(true);
  };

  // Handle PIN Actions matching CODE.GS
  const handlePinAction = async (subType: 'info' | 'cancel' | null = null) => {
    if (!pin || pin.trim().length === 0) {
      showFeedback("Authorization PIN Required", "error");
      return;
    }

    if (['reopen', 'return', 'update'].includes(activeAction.type) && (!reason || reason.trim().length < 5)) {
      showFeedback("Detailed remarks required (min 5 chars)", "error");
      return;
    }

    try {
      let actionKey: any = activeAction.type;
      if (activeAction.type === 'return') {
        actionKey = subType === 'cancel' ? 'return_cancel' : 'return_info';
      }

      const res = await SblLiveSyncService.executeEngineeringAction(actionKey, {
        ticketId: activeAction.id,
        pin,
        manpower,
        remarks,
        reason
      });

      setShowPinModal(false);
      setPin('');
      setReason('');
      setRemarks('');
      setTickets([...SblLiveSyncService.liveEngList]);
      setStats({ ...SblLiveSyncService.liveEngStats });
      showFeedback(res.message, "success");
    } catch (err: any) {
      showFeedback(err.message || "Action verification failed", "error");
    }
  };

  // Submit New Job matching submitComplaint in CODE.GS
  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqMachine.trim() || !reqDesc.trim()) {
      showFeedback("Machine and Description are mandatory", "error");
      return;
    }

    try {
      const res = await SblLiveSyncService.executeEngineeringAction('new_ticket', {
        pin: selectedJobType === 'Modification' ? hodPin : '1234',
        jobType: selectedJobType,
        hodPin: selectedJobType === 'Modification' ? hodPin : undefined,
        complainer: reqComplainer,
        machine: reqMachine,
        dept: reqDept,
        priority: selectedJobType === 'Modification' ? 'Project' : reqPriority,
        desc: reqDesc
      });

      setShowNewJobModal(false);
      setSelectedJobType('Breakdown');
      setReqMachine('');
      setReqDesc('');
      setHodPin('');
      setStatusFilter('Open');
      setSortOrder('Newest');
      setTickets([...SblLiveSyncService.liveEngList]);
      setStats({ ...SblLiveSyncService.liveEngStats });
      showFeedback(res.message, "success");
    } catch (err: any) {
      showFeedback(err.message || "Failed to create ticket", "error");
    }
  };

  // Filtered & Chronologically Sorted Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        t.id.toLowerCase().includes(q) ||
        t.machine.toLowerCase().includes(q) ||
        t.complainer.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q) ||
        t.engineer.toLowerCase().includes(q) ||
        (t.liveFeed && t.liveFeed.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'All' ? true : t.status === statusFilter;
      const matchPriority = priorityFilter === 'All' ? true : t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    }).sort((a, b) => {
      if (sortOrder === 'Oldest') return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id);
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortOrder]);

  // Current active lens metrics
  const activeLensMetrics = visionLens === 'Maintenance' ? stats.maintenance : stats.capexLens;

  return (
    <div className="space-y-4 p-2.5 sm:p-4 pb-28 text-slate-100 max-w-5xl mx-auto">
      {/* 0. CUSTOM IDENTITY-FIRST TOAST SYSTEM */}
      {notification.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-2xl flex items-center gap-3 animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertOctagon className="w-5 h-5 shrink-0" />
          )}
          <div className="flex flex-col">
            <span>{notification.message}</span>
            <span className="text-[9px] opacity-80 font-bold">Industrial Engineering System V10.0</span>
          </div>
        </div>
      )}

      {/* 1. HEADER CARD WITH LOGO & ATTRIBUTION */}
      <div className="ios-card p-4 text-center relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 text-left">
            <img 
              src="https://lh3.googleusercontent.com/d/1fVvoUClB-z32WwaNeMOWVEzAYBlehdHL" 
              alt="SBL Industrial Logo" 
              className="h-10 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
              onClick={() => {
                setView('board');
                setStatusFilter('Open');
                setSearchQuery('');
              }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div className="h-9 w-[1.5px] bg-slate-800 hidden sm:block" />
            <div>
              <h1 className="text-sm font-black uppercase text-slate-100 tracking-tight leading-tight">
                ENGINEERING
              </h1>
              <h2 className="text-sm font-black uppercase text-blue-500 tracking-tight leading-tight">
                WORKFLOW PORTAL
              </h2>
            </div>
          </div>

          {/* Sync Trigger & Live Status */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-0.5">
              <span className={`w-2 h-2 rounded-full ${syncStatusText === 'SYSTEM ACTIVE' ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
              <span className={syncStatusText === 'SYSTEM ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}>
                {syncStatusText}
              </span>
            </div>
            <button
              onClick={() => handleCloudSync(true)}
              disabled={isSyncing}
              className={`text-[9px] font-bold tracking-tight transition-all flex items-center gap-1 px-2.5 py-1 rounded-full uppercase border ${
                isSyncing 
                  ? 'text-blue-400 bg-blue-950/50 border-blue-800' 
                  : 'text-slate-300 bg-slate-800 hover:text-blue-400 border-slate-700 active:scale-95'
              }`}
              title="Force Database Synchronization"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isSyncing ? 'SYNCING...' : `SYNC: ${lastSyncTime}`}</span>
            </button>
          </div>
        </div>

        {/* View Switcher: Board vs Vision */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
          <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                AppleHaptics.selection();
                setView('board');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                view === 'board' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => {
                AppleHaptics.selection();
                setView('vision');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                view === 'vision' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vision
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-emerald-950"
              title="Download current filtered view to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">EXPORT</span>
            </button>

            <button
              onClick={() => {
                AppleHaptics.light();
                setShowNewJobModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-900/40 uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW TICKET</span>
            </button>
          </div>
        </div>
      </div>

      {view === 'board' ? (
        /* BOARD VIEW */
        <div className="space-y-3.5">
          {/* Advanced Filtering Toolbar */}
          <div className="ios-card p-3 space-y-2.5 bg-slate-900/90 border border-slate-800">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Machine / ID */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Machine / Ticket ID / Complainer..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
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

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    AppleHaptics.click();
                    setStatusFilter(e.target.value as any);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="All">All Records ({tickets.length})</option>
                  <option value="Open">Unassigned Breakdowns ({stats.open})</option>
                  <option value="CapEx">Pending CapEx / Project ({stats.capex})</option>
                  <option value="WIP">In Progress ({stats.wip})</option>
                  <option value="Resolved">Resolved ({stats.resolved})</option>
                  <option value="Closed">Closed ({stats.closed})</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="sm:w-36">
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    AppleHaptics.click();
                    setPriorityFilter(e.target.value as any);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="All">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Routine">Routine</option>
                  <option value="Project">Project</option>
                </select>
              </div>

              {/* Timeline Sort */}
              <div className="sm:w-36">
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    AppleHaptics.click();
                    setSortOrder(e.target.value as any);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Filter Meta Bar */}
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono font-bold">
                  {filteredTickets.length} Sync
                </span>
                <span>MATCHING TICKETS</span>
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {stats.safetyFlags} High Risk Safety Flags
              </span>
            </div>
          </div>

          {/* Tickets Feed List */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="ios-card p-12 text-center text-slate-400 border border-slate-800">
                <Wrench className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">
                  SYSTEM ONLINE
                </h3>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                  Awaiting engineering inputs or database synchronization...
                </p>
              </div>
            ) : (
              filteredTickets.map((row) => {
                const isUrgent = row.priority.toLowerCase() === 'urgent';
                const isClosed = row.status.toLowerCase() === 'closed';
                const isOpen = row.status.toLowerCase() === 'open';
                const isWip = row.status.toLowerCase() === 'wip';
                const isResolved = row.status.toLowerCase() === 'resolved';
                const isCapex = row.status.toLowerCase() === 'capex';

                // Status Pill styling matching DASHBOARD.HTML
                const pillClass = 
                  isOpen ? 'bg-[#ffeaa7] text-[#d35400]' :
                  isWip ? 'bg-[#81ecec] text-[#008b8b] animate-pulse' :
                  isResolved ? 'bg-[#55efc4] text-[#00b894]' :
                  isCapex ? 'bg-[#e0b4ff] text-[#5f27cd]' :
                  'bg-[#dfe6e9] text-[#636e72]';

                const agingColor = row.slaFailed && !isClosed ? 'text-red-500' : 'text-slate-300';

                return (
                  <div
                    key={row.id}
                    className={`ios-card p-3.5 border-l-4 transition-all bg-slate-900/90 border border-slate-800 hover:border-slate-700 ${
                      isUrgent && !isClosed 
                        ? 'border-l-red-500 bg-red-950/10' 
                        : isWip 
                        ? 'border-l-cyan-500' 
                        : isOpen 
                        ? 'border-l-amber-500' 
                        : isResolved 
                        ? 'border-l-emerald-500' 
                        : isCapex 
                        ? 'border-l-purple-500' 
                        : 'border-l-slate-600'
                    }`}
                  >
                    {/* Header Row: Ticket ID, Date, Status, Aging */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                          isUrgent && !isClosed ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-950 text-white border-slate-800'
                        }`}>
                          {row.id}
                        </span>

                        <span className="text-[10px] font-bold text-slate-400">
                          {row.date}
                        </span>

                        {row.priority === 'Project' && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            🏗️ CAPEX PROJECT
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Aging Cell */}
                        <div className="text-right">
                          <div className={`font-black text-xs font-mono tracking-tight ${agingColor}`}>
                            🕒 {row.agingText}
                          </div>
                          <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">
                            {isResolved || isClosed ? 'Total Time' : 'Pending'}
                          </div>
                        </div>

                        {/* Status Pill */}
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${pillClass}`}>
                          {row.status}
                        </span>
                      </div>
                    </div>

                    {/* Machine & Requesting Dept */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">
                        {row.machine}
                      </h4>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Building className="w-3 h-3 text-blue-400" /> {row.department}
                      </span>
                    </div>

                    {/* Risk Alert Indicator */}
                    {row.isHighRisk && !isClosed && (
                      <div className="mb-2 p-1.5 rounded-lg bg-red-950/60 border border-red-500/60 text-red-300 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>⚠️ HIGH RISK DETECTED — Safety Protocol Oversight Mandated</span>
                      </div>
                    )}

                    {/* Problem Narrative */}
                    <p className={`text-xs leading-relaxed ${isUrgent && !isClosed ? 'text-red-200 font-bold' : 'text-slate-300 font-medium'}`}>
                      {row.desc}
                    </p>

                    {/* Embedded Engineering Live Feed (Col 20) */}
                    {row.liveFeed && (
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {row.liveFeed}
                      </div>
                    )}

                    {/* Rejection History Ledger (Col 18) */}
                    {row.rejectionLedger && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-950/30 border border-rose-900/60 text-[10px] font-bold text-rose-300 whitespace-pre-wrap leading-relaxed">
                        {row.rejectionLedger}
                      </div>
                    )}

                    {/* Start / Resolution Remarks Ledger (Col 19) */}
                    {row.remarksLedger && (
                      <div className="mt-2 p-2 rounded-xl bg-blue-950/30 border border-blue-900/60 text-[10px] font-bold text-blue-300 whitespace-pre-wrap leading-relaxed">
                        {row.remarksLedger}
                      </div>
                    )}

                    {/* Meta: Complainer & Assigned Engineer */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-1.5">
                      <div className="flex items-center gap-1">
                        <span>Reported by: <b className="text-slate-300">{row.complainer}</b></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Engineer: <b className="text-blue-300">{row.engineer || 'Ajay Kumar'}</b></span>
                        {row.manpower > 0 && <span className="text-slate-500 font-mono">({row.manpower} tech)</span>}
                      </div>
                    </div>

                    {/* ACTIONS ROW MATCHING DASHBOARD.HTML */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {row.pdfUrl ? (
                          <a
                            href={row.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => AppleHaptics.click()}
                            className="py-1 px-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all"
                          >
                            <FileText className="w-3 h-3 text-blue-400" />
                            <span>DOWNLOAD REPORT</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-500 uppercase px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                            {isClosed ? 'NO PDF' : 'JOB IN FLIGHT'}
                          </span>
                        )}

                        <button
                          onClick={() => {
                            AppleHaptics.light();
                            setSelectedTicket(row);
                          }}
                          className="py-1 px-2 rounded-xl bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center gap-1 active:scale-95"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </div>

                      {/* AUTHENTIC TRIAGE ACTION BUTTONS */}
                      <div className="flex items-center gap-1.5">
                        {/* Open / CapEx: RETURN & START WORK */}
                        {(isOpen || isCapex) && (
                          <>
                            <button
                              onClick={() => openPinModal(row.id, 'return', row.department, row.machine)}
                              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] uppercase tracking-wider border border-slate-700 active:scale-95 transition-all"
                            >
                              RETURN
                            </button>
                            <button
                              onClick={() => openPinModal(row.id, 'start', row.department, row.machine)}
                              className="px-3.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-blue-900/40"
                            >
                              START WORK
                            </button>
                          </>
                        )}

                        {/* WIP: UPDATE & RESOLVE */}
                        {isWip && (
                          <>
                            <button
                              onClick={() => openPinModal(row.id, 'update', row.department, row.machine)}
                              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] uppercase tracking-wider border border-slate-700 active:scale-95 transition-all"
                            >
                              UPDATE
                            </button>
                            <button
                              onClick={() => openPinModal(row.id, 'resolve', row.department, row.machine)}
                              className="px-3.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-cyan-900/40"
                            >
                              RESOLVE
                            </button>
                          </>
                        )}

                        {/* Resolved: SIGN-OFF & REJECT */}
                        {isResolved && (
                          <>
                            <button
                              onClick={() => openPinModal(row.id, 'close', row.department, row.machine)}
                              className="px-3.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-emerald-900/40"
                            >
                              SIGN-OFF
                            </button>
                            <button
                              onClick={() => openPinModal(row.id, 'reopen', row.department, row.machine)}
                              className="px-3 py-1 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 font-black text-[10px] uppercase tracking-wider active:scale-95 transition-all"
                            >
                              REJECT
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* DUAL-LENS LEAN ANALYTICS VISION */
        <div className="space-y-4">
          {/* LENS TOGGLE SWITCH */}
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => {
                  AppleHaptics.selection();
                  setVisionLens('Maintenance');
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                  visionLens === 'Maintenance' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔧 Maintenance
              </button>
              <button
                onClick={() => {
                  AppleHaptics.selection();
                  setVisionLens('CapEx');
                }}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
                  visionLens === 'CapEx' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏗️ CapEx / Projects
              </button>
            </div>
          </div>

          {/* 4 DYNAMIC KPI CARDS MATCHING DASHBOARD.HTML */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Card 1: Unassigned / Pending CapEx */}
            <div 
              onClick={() => {
                setView('board');
                setStatusFilter(visionLens === 'Maintenance' ? 'Open' : 'CapEx');
              }}
              className="ios-card p-3 text-center border-t-4 border-t-amber-500 bg-slate-900/90 cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {visionLens === 'Maintenance' ? 'UNASSIGNED JOBS' : 'PENDING CAPEX'}
              </span>
              <div className="text-2xl md:text-3xl font-black text-amber-500 font-mono mt-1">
                {visionLens === 'Maintenance' ? activeLensMetrics.statusCounts.Open : activeLensMetrics.statusCounts.CapEx}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {visionLens === 'Maintenance' ? 'Awaiting Triage' : 'Under HOD Review'}
              </span>
            </div>

            {/* Card 2: Work / Project In Progress */}
            <div 
              onClick={() => {
                setView('board');
                setStatusFilter('WIP');
              }}
              className="ios-card p-3 text-center border-t-4 border-t-cyan-500 bg-slate-900/90 cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {visionLens === 'Maintenance' ? 'WORK IN PROGRESS' : 'PROJECT IN PROGRESS'}
              </span>
              <div className="text-2xl md:text-3xl font-black text-cyan-400 font-mono mt-1 animate-pulse">
                {activeLensMetrics.statusCounts.WIP}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Active Execution
              </span>
            </div>

            {/* Card 3: Pending Approval / Sign-off */}
            <div 
              onClick={() => {
                setView('board');
                setStatusFilter('Resolved');
              }}
              className="ios-card p-3 text-center border-t-4 border-t-emerald-500 bg-slate-900/90 cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                {visionLens === 'Maintenance' ? 'PENDING APPROVAL' : 'PENDING SIGN-OFF'}
              </span>
              <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono mt-1">
                {activeLensMetrics.statusCounts.Resolved}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Sign-Off Required
              </span>
            </div>

            {/* Card 4: Safety Flags */}
            <div className="ios-card p-3 text-center border-t-4 border-t-rose-500 bg-slate-900/90">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                SAFETY FLAGS
              </span>
              <div className="text-2xl md:text-3xl font-black text-rose-500 font-mono mt-1">
                {activeLensMetrics.safety}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ⚠️ High Risk Active
              </span>
            </div>
          </div>

          {/* EFFICIENCY MATRIX & SLA CONTAINER */}
          <div className="ios-card p-4 bg-slate-900/90 border border-slate-800 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${visionLens === 'Maintenance' ? 'bg-emerald-500' : 'bg-purple-500'}`} />

            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white">
                  <ShieldCheck className={`w-4 h-4 ${visionLens === 'Maintenance' ? 'text-emerald-400' : 'text-purple-400'}`} />
                  EFFICIENCY MATRIX
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {visionLens === 'Maintenance' ? 'Digital TPM Integrity Monitor' : 'CapEx Pipeline Integrity'}
                </p>
              </div>

              <div className={`text-4xl md:text-5xl font-black tracking-tighter ${
                visionLens === 'Maintenance' ? 'text-emerald-400' : 'text-purple-400'
              }`}>
                {activeLensMetrics.efficiency}%
              </div>
            </div>

            {/* DYNAMIC SLA DISCLAIMER BOX */}
            <div className={`p-3 rounded-xl border mb-3 ${
              visionLens === 'Maintenance' 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' 
                : 'bg-purple-950/40 border-purple-800 text-purple-200'
            }`}>
              <p className="text-[10px] leading-relaxed font-bold uppercase tracking-wider text-center">
                *Target vs Actual Efficiency: Calculated as % of jobs meeting Service Level Agreement (SLA).
                <br />
                {visionLens === 'Maintenance' ? (
                  <span className="text-emerald-400 font-black">Urgent Threshold: 4 Hours | Routine Threshold: 24 Hours</span>
                ) : (
                  <span className="text-purple-400 font-black">CapEx Projects: Assessed against individual project timelines</span>
                )}
              </p>
            </div>

            {/* MTTR and Labor Intensity Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-center">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Mean Time To Repair
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {activeLensMetrics.mttr} <span className="text-xs font-normal text-slate-500">hrs</span>
                </div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Avg Hours / Resolve
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Total Labor Intensity
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {activeLensMetrics.mth}
                </div>
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Actual Man-Hours (MTH)
                </div>
              </div>
            </div>

            {/* TOTAL & CLOSED TICKETS STRIP */}
            <div className={`flex items-center justify-around rounded-xl p-3 border ${
              visionLens === 'Maintenance' 
                ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300' 
                : 'bg-purple-950/20 border-purple-900 text-purple-300'
            }`}>
              <div className="text-center">
                <div className="text-[9px] font-black uppercase tracking-wider opacity-70">
                  Total Tickets Logged
                </div>
                <div className="text-xl font-black text-white">
                  {activeLensMetrics.totalJobs}
                </div>
              </div>
              <div className="w-[1px] h-8 bg-slate-700 opacity-60" />
              <div className="text-center">
                <div className="text-[9px] font-black uppercase tracking-wider opacity-70">
                  Total Tickets Closed
                </div>
                <div className="text-xl font-black text-white">
                  {activeLensMetrics.closedJobs}
                </div>
              </div>
            </div>
          </div>

          {/* DEPLOYMENT TIMELINE CHART CONTAINER */}
          <div className="ios-card p-4 bg-slate-900/90 border border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-white">
              <Activity className={`w-4 h-4 ${visionLens === 'Maintenance' ? 'text-blue-400' : 'text-purple-400'}`} />
              {visionLens === 'Maintenance' ? 'TPM Deployment Timeline' : 'CapEx Deployment Timeline'}
            </h4>

            {/* Visual SVG Timeline Bar Display */}
            <div className="space-y-2 pt-2">
              <div className="flex items-end justify-between gap-1.5 h-32 px-2 pb-1 border-b border-slate-800">
                {activeLensMetrics.graphLabels.map((lbl, idx) => {
                  const val = parseFloat(activeLensMetrics.graphValues[idx] || '0') || 0;
                  const maxVal = Math.max(...activeLensMetrics.graphValues.map(v => parseFloat(v) || 0), 10);
                  const heightPercent = Math.max(8, Math.min(100, Math.round((val / maxVal) * 100)));

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                      <span className="text-[8px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {val}h
                      </span>
                      <div 
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[28px] rounded-t-md transition-all ${
                          visionLens === 'Maintenance' 
                            ? (idx % 2 === 0 ? 'bg-blue-600' : 'bg-blue-400') 
                            : (idx % 2 === 0 ? 'bg-purple-600' : 'bg-purple-400')
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider px-1">
                {activeLensMetrics.graphLabels.map((lbl, idx) => (
                  <span key={idx} className="truncate max-w-[45px] text-center">{lbl}</span>
                ))}
              </div>

              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center mt-2 pt-2 border-t border-slate-800/80">
                Recent Daily Man-Hours (MTH) Utilization Aggregate
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. PIN SECURITY & AUTHORIZATION MODAL MATCHING DASHBOARD.HTML */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl p-5 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-blue-950/60 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-800">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 inline-block mb-1">
                PHASE: {activeAction.type.toUpperCase()}
              </span>
              <h3 className="text-sm font-black uppercase text-white">
                Authorization Gateway
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Ticket: <b className="text-slate-200 font-mono">{activeAction.id}</b>
              </p>
            </div>

            {/* START WORK: Manpower & Action Plan */}
            {activeAction.type === 'start' && (
              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Engineering Manpower Deployed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={manpower}
                    onChange={(e) => setManpower(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Action Plan / Start Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Briefly state parts, toolkits, or strategy..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* RESOLVE: Corrective Action Remarks */}
            {activeAction.type === 'resolve' && (
              <div className="text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Resolution Remarks / Corrective Action *
                </label>
                <textarea
                  required
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Describe repair performed, components swapped..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* REOPEN / REJECT: Rejection Reason (Min 5 chars) */}
            {activeAction.type === 'reopen' && (
              <div className="text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-rose-400 block mb-1">
                  Rejection Reason (Min 5 Chars) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this work order being rejected back to Open?..."
                  className="w-full bg-slate-950 border border-rose-900 rounded-xl p-2.5 text-xs text-rose-200 outline-none focus:border-rose-500"
                />
              </div>
            )}

            {/* RETURN: Reason for Info Req or Cancellation */}
            {activeAction.type === 'return' && (
              <div className="text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  Hold Note or Cancellation Reason (Min 5 Chars) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for info request or cancellation..."
                  className="w-full bg-slate-950 border border-amber-900 rounded-xl p-2.5 text-xs text-amber-200 outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* UPDATE: Trench Live Update Note */}
            {activeAction.type === 'update' && (
              <div className="text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-1">
                  Engineering Update Note (Min 5 Chars) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe ongoing status or spare part delay..."
                  className="w-full bg-slate-950 border border-blue-900 rounded-xl p-2.5 text-xs text-blue-200 outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* 4-DIGIT PIN INPUT */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Input Secret 4-Digit PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full bg-slate-950 border-2 border-blue-600 rounded-xl py-2.5 text-center text-2xl font-mono tracking-[0.5em] text-white outline-none focus:border-blue-400"
              />
            </div>

            {/* BUTTONS */}
            <div className="space-y-2 pt-1">
              {activeAction.type === 'return' ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePinAction('info')}
                    className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-wider active:scale-95 transition-all shadow-md"
                  >
                    REQUEST INFO
                  </button>
                  <button
                    onClick={() => handlePinAction('cancel')}
                    className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-black text-rose-300 border border-rose-900 font-black uppercase text-[10px] tracking-wider active:scale-95 transition-all shadow-md"
                  >
                    CANCEL TICKET
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handlePinAction()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider active:scale-95 transition-all shadow-lg shadow-blue-900/40"
                >
                  VERIFY & SIGN
                </button>
              )}

              <button
                onClick={() => setShowPinModal(false)}
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest block mx-auto py-1"
              >
                Abort Operation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEW TICKET MODAL WITH HOD AUTHORIZATION GATE */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="ios-sheet w-full max-w-lg p-5 max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="ios-grabber sm:hidden" />

            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-xs font-black uppercase text-white">⚡ CREATE JOB TICKET</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Industrial Fault Registration Protocol</p>
                </div>
              </div>
              <button onClick={() => setShowNewJobModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="space-y-3.5 text-xs text-left">
              {/* CATEGORY SELECTOR */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Request Category
                </label>
                <select
                  value={selectedJobType}
                  onChange={(e) => {
                    AppleHaptics.click();
                    setSelectedJobType(e.target.value as any);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-blue-500"
                >
                  <option value="Breakdown">🔧 MAINTENANCE: Machine Breakdown / Fault</option>
                  <option value="Modification">🏗️ PROJECT: New Modification / Setup (CapEx)</option>
                </select>
              </div>

              {/* DYNAMIC HOD AUTHORIZATION GATE (Only renders when 'Modification' is selected) */}
              {selectedJobType === 'Modification' && (
                <div className="p-3.5 rounded-xl bg-purple-950/40 border-2 border-purple-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-black text-xs uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>HOD AUTHORIZATION GATE (MANDATORY)</span>
                  </div>
                  <p className="text-[10px] text-purple-300 leading-relaxed font-semibold">
                    Mandatory: Department HOD PIN required to authorize and register CapEx engineering modifications.
                  </p>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-purple-400 block mb-1">
                      Department HOD 4-Digit PIN *
                    </label>
                    <input
                      required
                      type="password"
                      maxLength={4}
                      value={hodPin}
                      onChange={(e) => setHodPin(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-slate-950 border-2 border-purple-700 rounded-xl py-2 px-3 text-center text-xl font-mono tracking-[0.4em] text-white outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              )}

              {/* PRIORITY CLASS (When Breakdown) */}
              {selectedJobType === 'Breakdown' && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Priority Class
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Routine', 'Urgent'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          AppleHaptics.click();
                          setReqPriority(p);
                        }}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                          reqPriority === p
                            ? (p === 'Urgent' ? 'bg-red-600 text-white border-red-500 shadow-md' : 'bg-blue-600 text-white border-blue-500 shadow-md')
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {p === 'Urgent' ? '🚨 Urgent (SLA 4h)' : '🔧 Routine (SLA 24h)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MACHINE / EQUIPMENT */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Machine / Equipment / Location *
                </label>
                <input
                  required
                  type="text"
                  value={reqMachine}
                  onChange={(e) => setReqMachine(e.target.value)}
                  placeholder="e.g. HSD-04 Grinding Bay, Bead Mill GBM-26..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              {/* REQUESTING DEPARTMENT */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Requesting Department
                </label>
                <select
                  value={reqDept}
                  onChange={(e) => setReqDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-blue-500 font-semibold"
                >
                  <option>Production</option>
                  <option>Maintenance</option>
                  <option>Quality Control</option>
                  <option>Store</option>
                  <option>Utility</option>
                  <option>Safety / EHS</option>
                  <option>Dispatch</option>
                  <option>Administration</option>
                  <option>R&D</option>
                </select>
              </div>

              {/* PROBLEM NARRATIVE */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Problem Narrative *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  placeholder="Describe failure symptoms, tripping, mechanical play, leaks..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              {/* REPORTED BY */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                  Reported By (Requester Name)
                </label>
                <input
                  type="text"
                  value={reqComplainer}
                  onChange={(e) => setReqComplainer(e.target.value)}
                  placeholder="e.g. Budhi Parkash / Ajay Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-900/40"
                >
                  DISPATCH JOB TICKET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. TICKET SAFETY & DETAILS MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="ios-sheet w-full max-w-md p-5 max-h-[85vh] overflow-y-auto space-y-3 text-xs bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="ios-grabber sm:hidden" />

            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400">{selectedTicket.id}</span>
                <h3 className="text-sm font-bold text-white">{selectedTicket.machine}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Problem Narrative</span>
              <p className="text-white font-medium leading-relaxed">{selectedTicket.desc}</p>
              
              <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <span>📍 <b>Department:</b> {selectedTicket.department}</span>
                <span>👤 <b>Reported by:</b> {selectedTicket.complainer}</span>
                <span>🕒 <b>Logged Date:</b> {selectedTicket.date}</span>
                <span>🕒 <b>Aging:</b> {selectedTicket.agingText}</span>
                <span>👷 <b>Engineer Assigned:</b> {selectedTicket.engineer || 'Ajay Kumar'}</span>
                <span>⏱️ <b>Labor Hours:</b> {selectedTicket.leadTimeHours} hrs</span>
                {selectedTicket.comments && <span>💬 <b>Closure Sign-Off:</b> {selectedTicket.comments}</span>}
              </div>
            </div>

            {selectedTicket.liveFeed && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-300">
                <span className="text-[10px] font-bold uppercase text-blue-400 block">Engineering Live Feed</span>
                <p className="text-[11px] whitespace-pre-wrap leading-relaxed">{selectedTicket.liveFeed}</p>
              </div>
            )}

            {selectedTicket.rejectionLedger && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/60 space-y-1 text-rose-300">
                <span className="text-[10px] font-bold uppercase text-rose-400 block">Rejection History Ledger</span>
                <p className="text-[11px] whitespace-pre-wrap leading-relaxed">{selectedTicket.rejectionLedger}</p>
              </div>
            )}

            {selectedTicket.isHighRisk && (
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-[11px]">
                <b>⚠️ Safety Risk Flag:</b> This breakdown has been flagged for elevated safety risk. Verify LOTO and isolation protocols prior to commencing work.
              </div>
            )}

            {selectedTicket.pdfUrl && (
              <a
                href={selectedTicket.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => AppleHaptics.click()}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/40"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Official Engineering Work Order PDF</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}

            <button
              onClick={() => setSelectedTicket(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 5. FOOTER WITH BRAND ATTRIBUTION MATCHING DASHBOARD.HTML */}
      <footer className="pt-6 pb-2 text-center border-t border-slate-800/60 space-y-1.5">
        <div className="flex items-center justify-center gap-3">
          <img
            src="https://lh3.googleusercontent.com/d/1fVvoUClB-z32WwaNeMOWVEzAYBlehdHL"
            alt="Logo"
            className="h-6 opacity-40 grayscale"
          />
          <div className="h-4 w-[1px] bg-slate-800" />
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
            Digital System v10.0
          </span>
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">
          Created, Developed and Maintained by Budhi Parkash
        </p>
        <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest opacity-80">
          Performance Architecture • Lean Maintenance System
        </p>
      </footer>
    </div>
  );
};
