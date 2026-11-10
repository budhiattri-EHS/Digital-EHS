import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Calendar,
  Building,
  User,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Eye,
  FileText,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { AppleHaptics } from '../../services/appleHaptics';
import {
  FiveSAuditRecord,
  FiveSLeague,
  FiveSSite,
  FIVE_S_PILLARS,
  SBL_SITES,
  LABS_DEPARTMENTS,
  OPERATIONS_DEPARTMENTS,
  AUDITOR_DEFAULT_PIN,
  SBL_5S_TARGET_PERCENT
} from '../../data/fiveSData';
import { fiveSService, ScoreCalculationResult, LeagueStanding } from '../../services/fiveSService';
import { generateEnterpriseEhsPdf } from '../../utils/pdfGenerator';
import { MobileUniversalSaaSClient } from '../../services/universalSaaSClient';

type WorkspaceTab = 'standings' | 'pillars' | 'history';

export const MobileFiveSWorkspace: React.FC = () => {
  const [audits, setAudits] = useState<FiveSAuditRecord[]>(() => fiveSService.getAudits());
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('standings');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<FiveSAuditRecord | null>(null);

  // Sheet Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    // Reload verified authentic records from service
    setAudits(fiveSService.getAudits());
  }, []);

  const handleSyncWithSheet = async () => {
    AppleHaptics.selection();
    setIsSyncing(true);
    setSyncStatus('Connecting to Google Sheet gid=615973331...');
    try {
      const res = await fiveSService.syncWithGoogleSheet();
      setAudits(fiveSService.getAudits());
      setSyncStatus(res.message);
      if (res.success) {
        AppleHaptics.success();
      } else {
        AppleHaptics.warning();
      }
    } catch (e: any) {
      setSyncStatus('Sync error: ' + (e.message || e));
      AppleHaptics.error();
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 7000);
    }
  };

  // New Audit Flow Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Audit Form State
  const [site, setSite] = useState<FiveSSite>('Unit-2');
  const [league, setLeague] = useState<FiveSLeague>('Labs League');
  const [department, setDepartment] = useState<string>('SQA');
  const [auditor, setAuditor] = useState<string>('Budhi Parkash');
  const [auditee, setAuditee] = useState<string>('');
  const [auditDate, setAuditDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [scores, setScores] = useState<Record<string, number | 'NA'>>({});
  const [activePillarIdx, setActivePillarIdx] = useState<number>(0);
  const [photos, setPhotos] = useState<{ name: string; mimeType: string; data: string; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const liveScoreResult: ScoreCalculationResult = useMemo(() => {
    return fiveSService.calculateScore(scores);
  }, [scores]);

  const champions = useMemo(() => {
    return fiveSService.getChampions();
  }, [audits]);

  const plantAverage = useMemo(() => {
    return fiveSService.getPlantAverage();
  }, [audits]);

  const pillarAverages = useMemo(() => {
    return fiveSService.getPillarAverages();
  }, [audits]);

  const standings = useMemo(() => {
    const l = selectedLeagueFilter === 'All' ? undefined : (selectedLeagueFilter as FiveSLeague);
    return fiveSService.getLeagueStandings(l);
  }, [audits, selectedLeagueFilter]);

  const filteredAudits = useMemo(() => {
    return audits.filter(a => {
      const matchLeague = selectedLeagueFilter === 'All' || a.league === selectedLeagueFilter;
      const matchSearch =
        !searchQuery ||
        a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.auditor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.remarks.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLeague && matchSearch;
    });
  }, [audits, selectedLeagueFilter, searchQuery]);

  // Available departments for the selected league
  const availableDepts = useMemo(() => {
    return league === 'Labs League' ? LABS_DEPARTMENTS : OPERATIONS_DEPARTMENTS;
  }, [league]);

  // Update department when league changes
  const handleLeagueChange = (newLeague: FiveSLeague) => {
    AppleHaptics.selection();
    setLeague(newLeague);
    setDepartment(newLeague === 'Labs League' ? LABS_DEPARTMENTS[0] : OPERATIONS_DEPARTMENTS[0]);
  };

  // Quick Action: Mark all 50 items as 2 (100% baseline)
  const handleQuickMarkAllCompliant = () => {
    AppleHaptics.success();
    const fullScores: Record<string, number | 'NA'> = {};
    FIVE_S_PILLARS.forEach(pillar => {
      pillar.questions.forEach((_, qIdx) => {
        fullScores[`${pillar.name}_${qIdx}`] = 2;
      });
    });
    setScores(fullScores);
  };

  // Set individual question score
  const handleSetQuestionScore = (pillarName: string, qIdx: number, val: number | 'NA') => {
    AppleHaptics.click();
    setScores(prev => ({
      ...prev,
      [`${pillarName}_${qIdx}`]: val
    }));
  };

  // PIN Verification
  const handleVerifyPin = () => {
    if (enteredPin === AUDITOR_DEFAULT_PIN || enteredPin === '1907') {
      AppleHaptics.success();
      setIsPinAuthenticated(true);
      setPinError(false);
    } else {
      AppleHaptics.error();
      setPinError(true);
    }
  };

  const handleBypassPin = () => {
    AppleHaptics.success();
    setEnteredPin('1907');
    setIsPinAuthenticated(true);
  };

  // Handle Photo Selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      AppleHaptics.click();
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const base64Data = res.split(',')[1];
          setPhotos(prev => [
            ...prev,
            {
              name: file.name,
              mimeType: file.type,
              data: base64Data,
              preview: res
            }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Submit Audit
  const handleSubmitAudit = async () => {
    const answeredCount = Object.keys(scores).length;
    if (answeredCount < 50) {
      AppleHaptics.error();
      alert(`ISO 5S COMPLIANCE ERROR: ${answeredCount}/50 items scored. Please score all 50 questions (use 'NA' if non-applicable).`);
      return;
    }

    if (!auditee.trim()) {
      AppleHaptics.error();
      alert('Please enter Zone Owner / Auditee Name.');
      return;
    }

    setIsSubmitting(true);
    AppleHaptics.selection();

    try {
      const newRec = await fiveSService.submitAudit({
        site,
        league,
        department,
        auditor,
        auditee,
        auditDate,
        scores,
        remarks: remarks || 'Standard 5S audit completed as per ISO checklist.',
        photosBase64: photos.map(p => ({ name: p.name, mimeType: p.mimeType, data: p.data }))
      });

      AppleHaptics.success();
      setAudits(fiveSService.getAudits());
      setIsAuditModalOpen(false);
      resetAuditForm();
      alert(`5S Audit ${newRec.id} for ${department} saved successfully with Score: ${newRec.totalScore}%!`);
    } catch (e: any) {
      alert(`Submission error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAuditForm = () => {
    setScores({});
    setRemarks('');
    setPhotos([]);
    setIsPinAuthenticated(false);
    setEnteredPin('');
    setActivePillarIdx(0);
  };

  return (
    <div className="space-y-3 pb-8 text-slate-100">
      {/* HEADER BANNER */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">Format SBL/EHS/F-100</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">100-Point System</span>
            </div>
            <h2 className="text-base font-black text-white leading-tight">SBL 100-Point 5S Master System</h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncWithSheet}
            disabled={isSyncing}
            className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
            title="Sync with Google Sheet gid=615973331"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Start Audit CTA */}
          <button
            onClick={() => {
              AppleHaptics.selection();
              setIsAuditModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 active:scale-95 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Audit</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-xs text-purple-200 flex items-center gap-2 shadow-lg">
          <RefreshCw className={`w-3.5 h-3.5 text-purple-400 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="flex-1 text-[11px] font-medium">{syncStatus}</span>
          <button onClick={() => setSyncStatus(null)} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP KPI QUAD STRIP */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {/* Plant 5S Average */}
        <div className="ios-card p-2 border-purple-500/30">
          <span className="text-[9px] text-purple-400 font-bold block uppercase">Plant Avg</span>
          <span className="text-lg font-black text-purple-300 font-mono">{plantAverage}%</span>
          <span className="text-[8px] text-slate-400 block font-bold">Goal 85%</span>
        </div>

        {/* Total Audits */}
        <div className="ios-card p-2">
          <span className="text-[9px] text-blue-400 font-bold block uppercase">Audits</span>
          <span className="text-lg font-black text-blue-300 font-mono">{audits.length}</span>
          <span className="text-[8px] text-slate-400 block font-bold">Logged</span>
        </div>

        {/* Labs League Leader */}
        <div className="ios-card p-2 bg-gradient-to-b from-blue-950/30 to-slate-900 border-blue-500/30">
          <span className="text-[9px] text-blue-300 font-bold block uppercase truncate">Labs Champion</span>
          <span className="text-xs font-black text-white truncate block">{champions.labsLeader.dept}</span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">{champions.labsLeader.score}%</span>
        </div>

        {/* Operations League Leader */}
        <div className="ios-card p-2 bg-gradient-to-b from-emerald-950/30 to-slate-900 border-emerald-500/30">
          <span className="text-[9px] text-emerald-300 font-bold block uppercase truncate">Ops Champion</span>
          <span className="text-xs font-black text-white truncate block">{champions.opsLeader.dept}</span>
          <span className="text-[9px] font-mono text-emerald-400 font-bold">{champions.opsLeader.score}%</span>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center ios-segmented p-0.5 w-full text-[11px] font-bold">
        <button
          onClick={() => {
            AppleHaptics.selection();
            setActiveTab('standings');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'standings' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Standings</span>
        </button>

        <button
          onClick={() => {
            AppleHaptics.selection();
            setActiveTab('pillars');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pillars' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>5 Pillars Radar</span>
        </button>

        <button
          onClick={() => {
            AppleHaptics.selection();
            setActiveTab('history');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Audit Log ({audits.length})</span>
        </button>
      </div>

      {/* LEAGUE FILTER STRIP (For Standings & History) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex gap-1.5">
          {['All', 'Labs League', 'Operations League'].map(lg => (
            <button
              key={lg}
              onClick={() => {
                AppleHaptics.selection();
                setSelectedLeagueFilter(lg);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                selectedLeagueFilter === lg
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {lg}
            </button>
          ))}
        </div>

        {activeTab === 'history' && (
          <div className="relative max-w-[140px] w-full">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-[10px] text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* TAB 1: STANDINGS & LEAGUE LEADERBOARD */}
      {activeTab === 'standings' && (
        <div className="space-y-2.5">
          {standings.map(item => {
            const isTop3 = item.rank <= 3;
            const isCompliant = item.latestScore >= SBL_5S_TARGET_PERCENT;

            return (
              <div
                key={item.department}
                className={`ios-card p-3 flex items-center justify-between border-l-4 transition-all ${
                  item.rank === 1
                    ? 'border-l-amber-400 bg-amber-950/10'
                    : item.rank === 2
                    ? 'border-l-slate-300 bg-slate-900/60'
                    : item.rank === 3
                    ? 'border-l-amber-700/60 bg-slate-900/40'
                    : isCompliant
                    ? 'border-l-emerald-500/60'
                    : 'border-l-rose-500/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      item.rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : item.rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{item.department}</h4>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.league === 'Labs League' ? 'Labs' : 'Ops'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Last Audited: {item.auditDate} by {item.auditor}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-black font-mono block ${
                      isCompliant ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {item.latestScore}%
                  </span>
                  <span
                    className={`text-[8px] font-bold uppercase block ${
                      isCompliant ? 'text-emerald-500' : 'text-rose-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: 5 PILLARS RADAR BREAKDOWN */}
      {activeTab === 'pillars' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider mb-2 flex items-center justify-between">
              <span>Plant-Wide 5S Pillar Health</span>
              <span className="text-[10px] font-normal text-slate-400">Target: 85%</span>
            </h3>

            <div className="space-y-2.5 pt-1">
              {FIVE_S_PILLARS.map((p, idx) => {
                const keys = ['sort', 'set', 'shine', 'standard', 'sustain'] as const;
                const score = pillarAverages[keys[idx]];
                const isTargetMet = score >= SBL_5S_TARGET_PERCENT;

                return (
                  <div key={p.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{p.name}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({p.japanese})</span>
                      </div>
                      <span
                        className={`font-black font-mono ${
                          isTargetMet ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {score}%
                      </span>
                    </div>

                    {/* Progress Bar with 85% Target Line */}
                    <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTargetMet ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                      {/* SBL Target Marker at 85% */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-sm z-10"
                        style={{ left: '85%' }}
                        title="SBL Standard Target: 85%"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pillars Knowledge Cards */}
          <div className="grid grid-cols-1 gap-2">
            {FIVE_S_PILLARS.map(p => (
              <div key={p.name} className="ios-card p-3 border-l-4 border-l-purple-500/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{p.name}</h4>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{p.japanese}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">{p.meaning}</p>
                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>10 Checklist Items (20 Max Points)</span>
                  <span className="text-purple-400 font-bold">Standard SBL-100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT HISTORY & ISO CERTIFICATES */}
      {activeTab === 'history' && (
        <div className="space-y-2.5">
          {filteredAudits.length === 0 ? (
            <div className="ios-card p-8 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">No 5S audits found matching this filter.</p>
            </div>
          ) : (
            filteredAudits.map(item => {
              const isCompliant = item.totalScore >= SBL_5S_TARGET_PERCENT;

              return (
                <div
                  key={item.id}
                  className={`ios-card p-3 space-y-2 border-l-4 ${
                    isCompliant ? 'border-l-emerald-500' : 'border-l-amber-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-black text-purple-400">{item.id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                          {item.site}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 font-bold">
                          {item.league}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{item.department}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs ${
                          isCompliant ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.totalScore}%
                      </div>
                      <span className="text-[8px] text-slate-400 block font-bold uppercase mt-0.5">
                        {isCompliant ? 'PASS (>=85%)' : 'ACTION REQ'}
                      </span>
                    </div>
                  </div>

                  {/* 5 Pillar Mini Bar */}
                  <div className="grid grid-cols-5 gap-1 text-[9px] text-center pt-1">
                    <div className="bg-slate-900 p-1 rounded">
                      <span className="text-slate-400 block text-[8px]">Sort</span>
                      <strong className="text-rose-400">{item.sortScore}</strong>/20
                    </div>
                    <div className="bg-slate-900 p-1 rounded">
                      <span className="text-slate-400 block text-[8px]">Set</span>
                      <strong className="text-amber-400">{item.setScore}</strong>/20
                    </div>
                    <div className="bg-slate-900 p-1 rounded">
                      <span className="text-slate-400 block text-[8px]">Shine</span>
                      <strong className="text-emerald-400">{item.shineScore}</strong>/20
                    </div>
                    <div className="bg-slate-900 p-1 rounded">
                      <span className="text-slate-400 block text-[8px]">Std</span>
                      <strong className="text-blue-400">{item.standardScore}</strong>/20
                    </div>
                    <div className="bg-slate-900 p-1 rounded">
                      <span className="text-slate-400 block text-[8px]">Sust</span>
                      <strong className="text-purple-400">{item.sustainScore}</strong>/20
                    </div>
                  </div>

                  {/* Remarks */}
                  {item.remarks && (
                    <div className="text-[10px] text-slate-300 bg-slate-900/60 p-1.5 rounded border border-slate-800">
                      <strong className="text-amber-300">Auditor Notes:</strong> {item.remarks}
                    </div>
                  )}

                  {/* Footer & Actions */}
                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <div>
                      <span>By: <strong className="text-slate-200">{item.auditor}</strong></span>
                      <span className="mx-1">•</span>
                      <span>{item.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.reportUrl && (
                        <a
                          href={item.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => AppleHaptics.selection()}
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View PDF</span>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          AppleHaptics.click();
                          setSelectedReport(item);
                        }}
                        className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        <span>ISO Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* AUDIT EXECUTION MODAL (PIN AUTHENTICATED) */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">100-Point 5S Audit Execution</h3>
                  <p className="text-[10px] text-purple-400 font-mono">Format SBL/EHS/F-100</p>
                </div>
              </div>

              <button
                onClick={() => {
                  AppleHaptics.light();
                  setIsAuditModalOpen(false);
                }}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SCREEN 1: PIN AUTHENTICATION GATE */}
            {!isPinAuthenticated ? (
              <div className="p-6 text-center space-y-4 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
                  <Lock className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-base font-black text-white">Auditor Authentication Required</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the 4-digit Auditor PIN (or tap quick-auth) to begin ISO audit.
                  </p>
                </div>

                <div className="max-w-[200px] mx-auto">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={enteredPin}
                    onChange={e => {
                      setEnteredPin(e.target.value);
                      if (e.target.value.length === 4) {
                        if (e.target.value === '1907') {
                          AppleHaptics.success();
                          setIsPinAuthenticated(true);
                          setPinError(false);
                        } else {
                          AppleHaptics.error();
                          setPinError(true);
                        }
                      }
                    }}
                    className={`w-full bg-slate-950 border-2 rounded-xl text-center text-2xl font-mono tracking-widest p-2 text-white outline-none ${
                      pinError ? 'border-rose-500' : 'border-slate-700 focus:border-purple-500'
                    }`}
                  />
                  {pinError && <p className="text-[10px] text-rose-400 font-bold mt-1">Invalid PIN. (Default: 1907)</p>}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleVerifyPin}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs active:scale-95 transition-all shadow"
                  >
                    Authenticate with PIN
                  </button>
                  <button
                    onClick={handleBypassPin}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-purple-300 border border-purple-500/30 text-xs font-bold active:scale-95 transition-all"
                  >
                    Quick-Auth (Lead Auditor: Budhi Parkash)
                  </button>
                </div>
              </div>
            ) : (
              /* SCREEN 2: 5S AUDIT FORM & 50-QUESTION CHECKLIST */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* STICKY LIVE SCORE HUD */}
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <span className="text-[8px] text-slate-400 uppercase font-bold block">Live Score</span>
                      <span
                        className={`text-2xl font-black font-mono leading-none ${
                          liveScoreResult.isCompliant ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {liveScoreResult.totalPercentage}%
                      </span>
                    </div>

                    <div className="border-l border-slate-800 pl-3">
                      <span className="text-[9px] text-purple-300 font-bold block">
                        {liveScoreResult.earned}/{liveScoreResult.maxApplicable} Points
                      </span>
                      <span
                        className={`text-[8px] font-bold uppercase ${
                          liveScoreResult.isCompliant ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {liveScoreResult.isCompliant ? '✓ Target Met (>=85%)' : 'Under Target (<85%)'}
                      </span>
                    </div>
                  </div>

                  {/* 1-Tap Mark All Compliant (Best UX Ever) */}
                  <button
                    onClick={handleQuickMarkAllCompliant}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                    title="Pre-fills all 50 questions as 2 (100%), allowing you to adjust only deductions"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quick Fill (All 2s)</span>
                  </button>
                </div>

                {/* SCROLLABLE AUDIT BODY */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {/* METADATA FORM */}
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Site Location</label>
                        <select
                          value={site}
                          onChange={e => setSite(e.target.value as FiveSSite)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                        >
                          {SBL_SITES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">League</label>
                        <select
                          value={league}
                          onChange={e => handleLeagueChange(e.target.value as FiveSLeague)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                        >
                          <option value="Labs League">Labs League</option>
                          <option value="Operations League">Operations League</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Department</label>
                        <select
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs font-bold text-purple-300"
                        >
                          {availableDepts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Zone Owner / Auditee</label>
                        <input
                          type="text"
                          placeholder="e.g. Area Supervisor"
                          value={auditee}
                          onChange={e => setAuditee(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Auditor</label>
                        <input
                          type="text"
                          value={auditor}
                          onChange={e => setAuditor(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Audit Date</label>
                        <input
                          type="date"
                          value={auditDate}
                          onChange={e => setAuditDate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-purple-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PILLAR SELECTOR TABS */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold shrink-0">
                    {FIVE_S_PILLARS.map((p, pIdx) => {
                      const keys = ['sort', 'set', 'shine', 'standard', 'sustain'] as const;
                      const scoreVal = liveScoreResult.pillarScores[keys[pIdx]];
                      const isSelected = activePillarIdx === pIdx;

                      return (
                        <button
                          key={p.name}
                          onClick={() => {
                            AppleHaptics.selection();
                            setActivePillarIdx(pIdx);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800'
                          }`}
                        >
                          <span>{p.name.split(' ')[0]}</span>
                          <span className="text-[9px] font-mono opacity-80">({scoreVal}/20)</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ACTIVE PILLAR QUESTIONS LIST */}
                  {(() => {
                    const currentPillar = FIVE_S_PILLARS[activePillarIdx];
                    return (
                      <div className="space-y-2">
                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white block">{currentPillar.name}</span>
                            <span className="text-[10px] text-slate-400">{currentPillar.meaning}</span>
                          </div>
                          <span className="text-[10px] font-bold text-purple-400">10 Questions</span>
                        </div>

                        {currentPillar.questions.map((q, qIdx) => {
                          const key = `${currentPillar.name}_${qIdx}`;
                          const currentVal = scores[key];

                          return (
                            <div key={qIdx} className="ios-card p-2.5 space-y-2">
                              <div className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {qIdx + 1}
                                </span>
                                <p className="text-[11px] text-slate-200 leading-snug">{q}</p>
                              </div>

                              {/* 4 Score Buttons: 0, 1, 2, NA */}
                              <div className="flex items-center gap-2 pl-7">
                                {[
                                  { val: 0, label: '0 Fail', color: 'bg-rose-600 text-white border-rose-500' },
                                  { val: 1, label: '1 Partial', color: 'bg-amber-600 text-white border-amber-500' },
                                  { val: 2, label: '2 Pass', color: 'bg-emerald-600 text-white border-emerald-500' },
                                  { val: 'NA' as const, label: 'NA', color: 'bg-slate-600 text-white border-slate-500' }
                                ].map(btn => {
                                  const isSelected = currentVal === btn.val;
                                  return (
                                    <button
                                      key={String(btn.val)}
                                      onClick={() => handleSetQuestionScore(currentPillar.name, qIdx, btn.val)}
                                      className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-black border transition-all active:scale-95 ${
                                        isSelected
                                          ? `${btn.color} shadow-md`
                                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                      }`}
                                    >
                                      {btn.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* REMARKS & NON-CONFORMANCES */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">
                      Audit Remarks & Non-Conformances
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      placeholder="Explain any point deductions, required corrective actions, or commendations..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white text-xs resize-none"
                    />
                  </div>

                  {/* PHOTO EVIDENCE ATTACHMENT */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Camera className="w-3 h-3 text-purple-400" />
                        <span>Visual Photographic Evidence</span>
                      </span>
                      <span className="text-slate-500">{photos.length} Attached</span>
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white file:font-bold file:text-[10px] bg-slate-950 p-1.5 rounded-xl border border-slate-800 cursor-pointer"
                    />

                    {photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pt-1">
                        {photos.map((p, i) => (
                          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                            <img src={p.preview} alt="Evidence" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* MODAL COMMIT FOOTER */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Total Evaluated</span>
                    <span className="text-sm font-black text-white font-mono">
                      {Object.keys(scores).length}/50 Scored
                    </span>
                  </div>

                  <button
                    onClick={handleSubmitAudit}
                    disabled={isSubmitting}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting & Saving...' : 'Commit 5S Audit & Save'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ISO CERTIFICATE & AUDIT REPORT VIEWER MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-slate-900">
            {/* Header */}
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-900 uppercase">ISO Audit Verification: {selectedReport.id}</span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Generated HTML Report Content */}
            <div
              className="flex-1 overflow-y-auto p-4 text-xs"
              dangerouslySetInnerHTML={{
                __html: fiveSService.generateIsoReportHtml(selectedReport)
              }}
            />

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-500 font-bold">
                Format SBL/EHS/F-100 • Rev 00 • ISO 5S Matrix
              </span>
              <button
                onClick={() => {
                  AppleHaptics.success();
                  const tenant = MobileUniversalSaaSClient.getTenant();
                  generateEnterpriseEhsPdf({
                    companyName: tenant?.name || 'SBL Specialty Coatings Private Limited',
                    formatNumber: 'SBL/EHS/F-100',
                    revNumber: 'Rev 00',
                    revDate: '02-Nov-2026',
                    docId: selectedReport.id,
                    status: 'Audited & Approved',
                    title: `100-Point 5S Master Audit - ${selectedReport.department}`,
                    facility: selectedReport.site || 'Lalru Unit-3',
                    metadata: {
                      'Audit ID': selectedReport.id,
                      'Audit Date': selectedReport.date,
                      'Department': selectedReport.department,
                      'League': selectedReport.league,
                      'Auditor': selectedReport.auditor || 'Lead 5S Auditor',
                      'Total Score': `${selectedReport.totalScore} / 100`,
                      'Percentage': `${selectedReport.totalScore}%`,
                      'Result': selectedReport.totalScore >= 70 ? 'PASS (Target Achieved)' : 'ACTION REQUIRED'
                    },
                    tableHeaders: ['Pillar', 'Description', 'Score', 'Max', '% Achieved'],
                    tableRows: [
                      ['1S - Seiri (Sort)', 'Quarantine & disposal of unneeded items', selectedReport.sortScore, 20, `${Math.round((selectedReport.sortScore / 20) * 100)}%`],
                      ['2S - Seiton (Set)', 'Systematic demarcation & storage', selectedReport.setScore, 20, `${Math.round((selectedReport.setScore / 20) * 100)}%`],
                      ['3S - Seiso (Shine)', 'Cleaning with inspection & oil sweep', selectedReport.shineScore, 20, `${Math.round((selectedReport.shineScore / 20) * 100)}%`],
                      ['4S - Seiketsu (Standardize)', 'Visual controls, shadow boards & SOPs', selectedReport.standardScore, 20, `${Math.round((selectedReport.standardScore / 20) * 100)}%`],
                      ['5S - Shitsuke (Sustain)', 'Discipline, training & daily habits', selectedReport.sustainScore, 20, `${Math.round((selectedReport.sustainScore / 20) * 100)}%`]
                    ],
                    observationsNotes: selectedReport.remarks || 'Audit verified against ISO 9001 / ISO 45001 / ISO 14001 world-class 5S manufacturing standards.'
                  });
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all shadow"
              >
                Download Official PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
