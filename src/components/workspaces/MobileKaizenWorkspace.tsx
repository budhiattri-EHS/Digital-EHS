import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  X, 
  TrendingUp, 
  ShieldCheck, 
  ThumbsUp, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  DollarSign,
  Zap,
  AlertCircle,
  Check,
  Building,
  User,
  Tag,
  ChevronRight,
  Share2,
  FileText
} from 'lucide-react';
import { AppleHaptics } from '../../services/appleHaptics';
import { KaizenRecord, KAIZEN_CATEGORIES, KAIZEN_DEPARTMENTS, calculateKaizenScore, HOD_DIRECTORY, ASSESSOR_DIRECTORY } from '../../data/kaizenData';
import { kaizenService } from '../../services/kaizenService';

type PipelineTab = 'all' | 'pending-hod' | 'in-progress' | 'verified' | 'leaderboard';

export const MobileKaizenWorkspace: React.FC = () => {
  const [kaizens, setKaizens] = useState<KaizenRecord[]>([]);
  const [activeTab, setActiveTab] = useState<PipelineTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Kaizen Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [empName, setEmpName] = useState('Budhi Parkash');
  const [empCode, setEmpCode] = useState('E0414');
  const [empEmail, setEmpEmail] = useState('B.Parkash@sblcoatings.com');
  const [empDept, setEmpDept] = useState('Production');
  const [teamMembers, setTeamMembers] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Cost Saving', 'EHS improvement']);
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [proposedImprovement, setProposedImprovement] = useState('');
  const [expectedBenefits, setExpectedBenefits] = useState('');
  const [implementationSteps, setImplementationSteps] = useState('');
  const [zeroResources, setZeroResources] = useState(true);
  const [resourcesNeeded, setResourcesNeeded] = useState('');
  const [claimedCostSaving, setClaimedCostSaving] = useState<string>('');
  const [claimedProdPct, setClaimedProdPct] = useState<string>('');
  const [claimedQualityPct, setClaimedQualityPct] = useState<string>('');
  const [claimedSpaceM2, setClaimedSpaceM2] = useState<string>('');

  // HOD Approval Modal State
  const [approvingKaizen, setApprovingKaizen] = useState<KaizenRecord | null>(null);
  const [hodActionType, setHodActionType] = useState<'approve' | 'reject'>('approve');
  const [hodReviewerName, setHodReviewerName] = useState('Budhi Parkash (HOD)');
  const [hodComments, setHodComments] = useState('');

  // Assessor Verification Modal State
  const [scoringKaizen, setScoringKaizen] = useState<KaizenRecord | null>(null);
  const [assessorEmail, setAssessorEmail] = useState('B.Parkash@sblcoatings.com');
  const [verifyCostSaving, setVerifyCostSaving] = useState('15');
  const [verifyProdPct, setVerifyProdPct] = useState('5');
  const [verifyQualityPct, setVerifyQualityPct] = useState('');
  const [verifySpaceM2, setVerifySpaceM2] = useState('');
  const [verifyEhs, setVerifyEhs] = useState(true);
  const [verifyPsychosocial, setVerifyPsychosocial] = useState(false);
  const [assessorComments, setAssessorComments] = useState('Verified on plant shopfloor. Standard operational benefits confirmed.');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const list = kaizenService.getKaizens();
    setKaizens([...list]);
  };

  const handleSyncWithSheet = async () => {
    AppleHaptics.light();
    setIsSyncing(true);
    const res = await kaizenService.syncWithGoogleSheet();
    setIsSyncing(false);
    if (res.success) {
      refreshData();
      showToast(`✓ Google Sheet Synced: ${res.count} Kaizens active!`);
    } else {
      showToast(`⚡ Working in High-Speed Local Mode (33 real Kaizens loaded).`);
    }
  };

  const stats = useMemo(() => {
    return kaizenService.getSummaryStats();
  }, [kaizens]);

  // Filtered Kaizens
  const filteredKaizens = useMemo(() => {
    return kaizens.filter(k => {
      // Pipeline Tab Filter
      if (activeTab === 'pending-hod' && k.status !== 'Pending HOD Approval' && k.status !== 'Submitted') {
        return false;
      }
      if (activeTab === 'in-progress' && k.status !== 'Approved - Implementation in Progress') {
        return false;
      }
      if (activeTab === 'verified' && k.status !== 'Completed & Verified') {
        return false;
      }

      // Department Filter
      if (selectedDept !== 'All' && k.department !== selectedDept) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'All') {
        const catLower = (k.category || '').toLowerCase();
        if (!catLower.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchId = k.id.toLowerCase().includes(q);
        const matchTitle = (k.title || '').toLowerCase().includes(q);
        const matchName = (k.name || '').toLowerCase().includes(q);
        const matchProblem = (k.problem || '').toLowerCase().includes(q);
        const matchDept = (k.department || '').toLowerCase().includes(q);
        if (!matchId && !matchTitle && !matchName && !matchProblem && !matchDept) {
          return false;
        }
      }

      return true;
    });
  }, [kaizens, activeTab, selectedCategory, selectedDept, searchQuery]);

  // Calculate live preview score for submission modal
  const livePreviewScore = useMemo(() => {
    return calculateKaizenScore({
      categories: selectedCategories,
      costSavingRsThousand: parseFloat(claimedCostSaving) || undefined,
      productivityPct: parseFloat(claimedProdPct) || undefined,
      qualityFailureRatePct: parseFloat(claimedQualityPct) || undefined,
      spaceSavingM2: parseFloat(claimedSpaceM2) || undefined,
      ehsBenefit: selectedCategories.some(c => c.toLowerCase().includes('ehs')),
      psychosocialBenefit: selectedCategories.some(c => c.toLowerCase().includes('psychosocial')),
      noResourcesRequired: zeroResources
    });
  }, [selectedCategories, claimedCostSaving, claimedProdPct, claimedQualityPct, claimedSpaceM2, zeroResources]);

  // Handle Submit Form
  const handleSubmitKaizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problem.trim() || !proposedImprovement.trim()) {
      showToast('⚠️ Please fill in the Title, Problem description, and Proposed Improvement.');
      return;
    }

    AppleHaptics.success();

    const res = await kaizenService.submitKaizen({
      employeeName: empName,
      employeeCode: empCode,
      email: empEmail,
      department: empDept,
      categories: selectedCategories,
      title: title,
      problem: problem,
      proposedImprovement: proposedImprovement,
      expectedBenefits: expectedBenefits || 'Continuous workplace improvement.',
      teamMembers: teamMembers,
      resourcesNeeded: zeroResources ? 'NO' : resourcesNeeded || 'Minor tooling',
      implementationSteps: implementationSteps || 'Step 1: Planning, Step 2: Implementation, Step 3: Verification',
      claimedImpact: {
        costSavingRsThousand: parseFloat(claimedCostSaving) || undefined,
        productivityPct: parseFloat(claimedProdPct) || undefined,
        qualityFailureRatePct: parseFloat(claimedQualityPct) || undefined,
        spaceSavingM2: parseFloat(claimedSpaceM2) || undefined,
        ehsBenefit: selectedCategories.some(c => c.toLowerCase().includes('ehs')),
        psychosocialBenefit: selectedCategories.some(c => c.toLowerCase().includes('psychosocial'))
      }
    });

    refreshData();
    setShowSubmitModal(false);
    setTitle('');
    setProblem('');
    setProposedImprovement('');
    setExpectedBenefits('');
    setClaimedCostSaving('');
    showToast(`✓ Kaizen ${res.kaizen.id} Submitted & Written to Google Sheet!`);
  };

  // Handle HOD Approval / Rejection
  const handleConfirmHodAction = async () => {
    if (!approvingKaizen) return;
    AppleHaptics.success();

    if (hodActionType === 'approve') {
      await kaizenService.approveKaizen(
        approvingKaizen.id,
        hodReviewerName,
        hodComments || 'Approved by HOD for immediate shopfloor execution.'
      );
      showToast(`✓ Kaizen ${approvingKaizen.id} Approved & Written to Google Sheet!`);
    } else {
      await kaizenService.rejectKaizen(
        approvingKaizen.id,
        hodReviewerName,
        hodComments || 'Needs revision before resubmission.'
      );
      showToast(`⚠️ Kaizen ${approvingKaizen.id} Marked Rejected in Google Sheet.`);
    }

    refreshData();
    setApprovingKaizen(null);
  };

  // Handle Committee Verification
  const handleConfirmVerification = async () => {
    if (!scoringKaizen) return;
    AppleHaptics.success();

    const verifiedObj = {
      'Cost Saving': verifyCostSaving || '',
      'Productivity Improvement': verifyProdPct || '',
      'Quality Improvement': verifyQualityPct || '',
      'Space Saving': verifySpaceM2 || '',
      'EHS improvement': verifyEhs ? 'Yes' : '',
      'Psychosocial Improvement': verifyPsychosocial ? 'Yes' : ''
    };

    const finalScore = calculateKaizenScore({
      categories: scoringKaizen.category.split(',').map(c => c.trim()),
      costSavingRsThousand: parseFloat(verifyCostSaving) || undefined,
      productivityPct: parseFloat(verifyProdPct) || undefined,
      qualityFailureRatePct: parseFloat(verifyQualityPct) || undefined,
      spaceSavingM2: parseFloat(verifySpaceM2) || undefined,
      ehsBenefit: verifyEhs,
      psychosocialBenefit: verifyPsychosocial,
      noResourcesRequired: scoringKaizen.resourceStatus?.toUpperCase() === 'NO'
    });

    await kaizenService.verifyAndScoreKaizen(
      scoringKaizen.id,
      assessorEmail,
      JSON.stringify(verifiedObj),
      finalScore,
      assessorComments
    );

    refreshData();
    setScoringKaizen(null);
    showToast(`✓ Kaizen ${scoringKaizen.id} Verified with Score ${finalScore} in Google Sheet!`);
  };

  // Leaderboard data
  const leaderboard = useMemo(() => {
    const deptScores: Record<string, { total: number; verified: number; score: number }> = {};
    const submitterScores: Record<string, { name: string; dept: string; total: number; score: number }> = {};

    kaizens.forEach(k => {
      const d = k.department || 'General';
      if (!deptScores[d]) deptScores[d] = { total: 0, verified: 0, score: 0 };
      deptScores[d].total += 1;
      if (k.status === 'Completed & Verified') deptScores[d].verified += 1;
      deptScores[d].score += k.kaizenScore || 0;

      const subName = k.name || 'Anonymous';
      if (!submitterScores[subName]) submitterScores[subName] = { name: subName, dept: d, total: 0, score: 0 };
      submitterScores[subName].total += 1;
      submitterScores[subName].score += k.kaizenScore || 0;
    });

    return {
      depts: Object.entries(deptScores).sort((a, b) => b[1].score - a[1].score),
      submitters: Object.values(submitterScores).sort((a, b) => b.score - a.score).slice(0, 8)
    };
  }, [kaizens]);

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
      <div className="ios-card-elevated p-4 border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Lightbulb className="w-6 h-6 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Continuous Improvement Kaizen Hub
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v15.0 Master
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Format No. 01 • Two-Way Google Sheet Automation & SOP Scoring
              </p>
            </div>
          </div>

          {/* Sync & Submit Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncWithSheet}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 active:scale-95 transition-all text-xs font-bold shadow-sm"
              title="Sync live from Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
            </button>

            <button
              onClick={() => {
                AppleHaptics.light();
                setShowSubmitModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Kaizen</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('pending-hod');
          }}
          className={`p-3 rounded-2xl text-left transition-all border ${
            activeTab === 'pending-hod'
              ? 'bg-amber-950/40 border-amber-500/80 ring-2 ring-amber-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-amber-400">Pending HOD</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
            {stats.pendingHod}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting HOD Sign-Off</div>
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('in-progress');
          }}
          className={`p-3 rounded-2xl text-left transition-all border ${
            activeTab === 'in-progress'
              ? 'bg-blue-950/40 border-blue-500/80 ring-2 ring-blue-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-blue-400">In Progress</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-300 font-mono">
            {stats.inProgress}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active Implementation</div>
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('verified');
          }}
          className={`p-3 rounded-2xl text-left transition-all border ${
            activeTab === 'verified'
              ? 'bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-emerald-400">Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
            {stats.completed}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Verified & Audited</div>
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('leaderboard');
          }}
          className={`p-3 rounded-2xl text-left transition-all border ${
            activeTab === 'leaderboard'
              ? 'bg-purple-950/40 border-purple-500/80 ring-2 ring-purple-500/20'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase text-purple-400">Total Score</span>
            <Award className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
            {stats.totalScore} <span className="text-xs font-sans text-slate-400">Pts</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Avg: {stats.avgScore} pts / Kaizen</div>
        </button>
      </div>

      {/* Pipeline Navigation Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('all');
          }}
          className={`py-2 px-3 rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Kaizens ({stats.total})
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('pending-hod');
          }}
          className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'pending-hod'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending HOD Approval</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-mono">
            {stats.pendingHod}
          </span>
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('in-progress');
          }}
          className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'in-progress'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>In Progress ({stats.inProgress})</span>
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('verified');
          }}
          className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'verified'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verified ({stats.completed})</span>
        </button>

        <button
          onClick={() => {
            AppleHaptics.light();
            setActiveTab('leaderboard');
          }}
          className={`py-2 px-3 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Leaderboard</span>
        </button>
      </div>

      {/* Search & Department Selector */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Kaizen ID, submitter, title, problem..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
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

        <select
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500 shrink-0"
        >
          <option value="All">All Depts</option>
          {KAIZEN_DEPARTMENTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
        {['All', 'Cost Saving', 'EHS improvement', 'Productivity Improvement', 'Quality Improvement', 'Space Saving', 'Psychosocial Improvement'].map(cat => (
          <button
            key={cat}
            onClick={() => {
              AppleHaptics.light();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat === 'All' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* LEADERBOARD VIEW */}
      {activeTab === 'leaderboard' ? (
        <div className="space-y-4">
          {/* Department Rankings */}
          <div className="ios-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  Department Kaizen Rankings
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">SOP Appendix B Scoring</span>
            </div>

            <div className="space-y-2">
              {leaderboard.depts.map(([dept, data], idx) => (
                <div key={dept} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      idx === 1 ? 'bg-slate-700 text-slate-200' :
                      idx === 2 ? 'bg-amber-800/30 text-amber-400' : 'bg-slate-900 text-slate-500'
                    }`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-white block">{dept}</span>
                      <span className="text-[10px] text-slate-400">
                        {data.verified} Verified • {data.total} Total Submissions
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-purple-400 font-mono">{data.score}</span>
                    <span className="text-[10px] text-slate-500 block">Points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Innovators */}
          <div className="ios-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  Top Innovators & Contributors
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Employee Hall of Fame</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {leaderboard.submitters.map((sub, idx) => (
                <div key={sub.name} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐'}</span>
                    <div>
                      <span className="font-bold text-white block truncate max-w-[150px]">{sub.name}</span>
                      <span className="text-[10px] text-slate-400">{sub.dept}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-300">{sub.score} Pts</span>
                    <span className="text-[10px] text-slate-500 block">{sub.total} Kaizens</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* KAIZEN LIST CARDS */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              {activeTab === 'pending-hod' ? 'Pending HOD Approval Queue' :
               activeTab === 'in-progress' ? 'Active Kaizen Implementations' :
               activeTab === 'verified' ? 'Verified & Scored Kaizens' : 'All Kaizen Proposals'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Showing {filteredKaizens.length} Kaizens
            </span>
          </div>

          {filteredKaizens.length === 0 ? (
            <div className="ios-card p-8 text-center text-slate-400">
              <Lightbulb className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-sm text-slate-200">Zero Kaizens Found</p>
              <p className="text-xs mt-1">No Kaizen proposals match your active filter.</p>
            </div>
          ) : (
            filteredKaizens.map(k => {
              const isPendingHod = k.status === 'Pending HOD Approval' || k.status === 'Submitted';
              const isApprovedWip = k.status === 'Approved - Implementation in Progress';
              const isVerified = k.status === 'Completed & Verified';
              const isRejected = k.status === 'Rejected';

              return (
                <div key={k.id} className="ios-card p-4 space-y-2.5 border-slate-800 hover:border-slate-700 transition-colors">
                  {/* Top Header: ID, Category Badges, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          {k.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-800">
                          {k.department}
                        </span>
                        {k.category.split(',').map((c, i) => (
                          <span key={i} className="text-[9px] font-semibold text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            {c.trim()}
                          </span>
                        ))}
                      </div>

                      <h4 className="font-extrabold text-sm text-white pt-0.5 leading-snug">
                        {k.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase font-mono ${
                        isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        isApprovedWip ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        isPendingHod ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {isVerified ? '✓ Verified' : isApprovedWip ? 'In Progress' : isPendingHod ? 'Pending HOD' : 'Rejected'}
                      </span>

                      {k.kaizenScore > 0 && (
                        <div className="text-xs font-mono font-bold text-purple-400 mt-1">
                          Score: {k.kaizenScore} Pts
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Problem & Proposed Solution */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                        Problem / Current State
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                        {k.problem || 'Standard shopfloor friction observed.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                        Proposed Improvement
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                        {k.proposedImprovement || 'Continuous improvement workflow implemented.'}
                      </p>
                    </div>
                  </div>

                  {/* Expected Benefits & Submitter Footnote */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <div>
                      <span>By: <b className="text-white">{k.name}</b> ({k.email || k.department})</span>
                      {k.timestamp && <span className="text-slate-500 ml-1.5">• {k.timestamp}</span>}
                    </div>

                    {k.hodApprovalDate && (
                      <span className="text-emerald-400 font-medium">
                        ✓ {k.hodApprovalDate} {k.hodName ? `(${k.hodName})` : ''}
                      </span>
                    )}
                  </div>

                  {/* HOD Action Bar (If Pending HOD Approval) */}
                  {isPendingHod && (
                    <div className="pt-2 flex items-center gap-2 border-t border-amber-500/20">
                      <button
                        onClick={() => {
                          AppleHaptics.light();
                          setApprovingKaizen(k);
                          setHodActionType('approve');
                          setHodComments('Approved by HOD. Resources assigned for immediate implementation.');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Write to Sheet</span>
                      </button>

                      <button
                        onClick={() => {
                          AppleHaptics.light();
                          setApprovingKaizen(k);
                          setHodActionType('reject');
                          setHodComments('Requires revision on technical feasibility.');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 border border-rose-500/30 font-bold text-xs active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Assessor Verification Bar (If Approved In-Progress) */}
                  {isApprovedWip && (
                    <div className="pt-2 flex items-center justify-between border-t border-blue-500/20">
                      <span className="text-[11px] text-blue-300 font-semibold">
                        Implementation complete? Audit & assign points:
                      </span>
                      <button
                        onClick={() => {
                          AppleHaptics.light();
                          setScoringKaizen(k);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs active:scale-95 transition-all shadow-md flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Verify & Score (Committee)</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUBMISSION MODAL (FORMAT NO. 01) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Kaizen Suggestion & Assessment Form
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Format No. 01 • Writes Directly to Linked Google Sheet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitKaizen} className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Submitter Details */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  1. Submitter & Department Information
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Employee Name</label>
                    <input
                      type="text"
                      value={empName}
                      onChange={e => setEmpName(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Employee Code</label>
                    <input
                      type="text"
                      value={empCode}
                      onChange={e => setEmpCode(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={empEmail}
                      onChange={e => setEmpEmail(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Department</label>
                    <select
                      value={empDept}
                      onChange={e => setEmpDept(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                    >
                      {KAIZEN_DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Team Members (Optional)</label>
                  <input
                    type="text"
                    value={teamMembers}
                    onChange={e => setTeamMembers(e.target.value)}
                    placeholder="e.g. Sunil Patel, Ravinder Thakur"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Improvement Categories */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  2. Improvement Categories (Tick all relevant)
                </span>

                <div className="flex flex-wrap gap-1.5">
                  {KAIZEN_CATEGORIES.map(cat => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          AppleHaptics.light();
                          if (isSelected) {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat));
                          } else {
                            setSelectedCategories([...selectedCategories, cat]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {isSelected ? `✓ ${cat}` : cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suggestion Core */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  3. Kaizen Proposal & Solution
                </span>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Suggestion Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Clear, punchy headline of your improvement..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Current State / Problem Description</label>
                  <textarea
                    rows={2}
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                    required
                    placeholder="What friction, risk, delay, or waste is currently happening?"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Proposed Improvement / Solution</label>
                  <textarea
                    rows={2}
                    value={proposedImprovement}
                    onChange={e => setProposedImprovement(e.target.value)}
                    required
                    placeholder="What specific modification or procedure solves the problem?"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Expected Benefits</label>
                  <input
                    type="text"
                    value={expectedBenefits}
                    onChange={e => setExpectedBenefits(e.target.value)}
                    placeholder="e.g. Saves ₹25,000/yr, eliminates fume hazard, saves 15 min per batch"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Quantifiable Benefit Estimates & Scoring Matrix */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    4. Quantifiable Estimates & Live Score Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold text-xs border border-purple-500/30">
                    Est. Score: {livePreviewScore} Pts
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cost Saving (₹ in Thousands)</label>
                    <input
                      type="number"
                      value={claimedCostSaving}
                      onChange={e => setClaimedCostSaving(e.target.value)}
                      placeholder="e.g. 50 (for ₹50k)"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Productivity Increase (%)</label>
                    <input
                      type="number"
                      value={claimedProdPct}
                      onChange={e => setClaimedProdPct(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Quality Failure Reduction (%)</label>
                    <input
                      type="number"
                      value={claimedQualityPct}
                      onChange={e => setClaimedQualityPct(e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Space Saving (m² freed)</label>
                    <input
                      type="number"
                      value={claimedSpaceM2}
                      onChange={e => setClaimedSpaceM2(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Zero Resources Special Condition */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Zero Resources Required</span>
                    <span className="text-[10px] text-slate-400">Self-implemented with in-house materials (+3 Bonus Pts)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZeroResources(!zeroResources)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      zeroResources ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {zeroResources ? '✓ YES (Self-Done)' : 'Resources Needed'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Submit Kaizen & Write to Google Sheet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HOD APPROVAL / REJECTION MODAL */}
      {approvingKaizen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  HOD Review & Authorization
                </h3>
              </div>
              <button
                onClick={() => setApprovingKaizen(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <div>Kaizen ID: <b className="text-amber-400 font-mono">{approvingKaizen.id}</b></div>
              <div>Title: <b className="text-white">{approvingKaizen.title}</b></div>
              <div>Submitter: <b className="text-slate-300">{approvingKaizen.name}</b> ({approvingKaizen.department})</div>
            </div>

            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setHodActionType('approve');
                  setHodComments('Approved by HOD. Resources assigned for immediate implementation.');
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  hodActionType === 'approve' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                ✓ Approve (Proceed to WIP)
              </button>
              <button
                onClick={() => {
                  setHodActionType('reject');
                  setHodComments('Requires revision on technical feasibility.');
                }}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  hodActionType === 'reject' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                ✕ Reject / Revise
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Reviewing HOD Name</label>
              <input
                type="text"
                value={hodReviewerName}
                onChange={e => setHodReviewerName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">HOD Comments / Instructions</label>
              <textarea
                rows={2}
                value={hodComments}
                onChange={e => setHodComments(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setApprovingKaizen(null)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHodAction}
                className={`flex-1 py-2.5 rounded-xl font-black text-white shadow-md active:scale-95 transition-all ${
                  hodActionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {hodActionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSESSOR VERIFICATION & SCORING MODAL */}
      {scoringKaizen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <h3 className="font-black text-sm text-white uppercase tracking-wider">
                  Committee Verification & Scoring
                </h3>
              </div>
              <button
                onClick={() => setScoringKaizen(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <div>Kaizen ID: <b className="text-amber-400 font-mono">{scoringKaizen.id}</b></div>
                <div>Title: <b className="text-white">{scoringKaizen.title}</b></div>
                <div>Submitter: <b className="text-slate-300">{scoringKaizen.name}</b> ({scoringKaizen.department})</div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Verify Measured Benefits (SOP Appendix B Matrix)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Cost Saving (₹k)</label>
                    <input
                      type="number"
                      value={verifyCostSaving}
                      onChange={e => setVerifyCostSaving(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Productivity Increase (%)</label>
                    <input
                      type="number"
                      value={verifyProdPct}
                      onChange={e => setVerifyProdPct(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-300">EHS / Safety Standard Achieved</span>
                  <button
                    type="button"
                    onClick={() => setVerifyEhs(!verifyEhs)}
                    className={`px-3 py-1 rounded-lg font-bold text-xs ${verifyEhs ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {verifyEhs ? '✓ Yes (3 Pts)' : 'No'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Assessor Comments / Audit Log</label>
                <textarea
                  rows={2}
                  value={assessorComments}
                  onChange={e => setAssessorComments(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
              <button
                onClick={() => setScoringKaizen(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerification}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Certify Score & Write to Google Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
