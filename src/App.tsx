import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { RiskCard } from './components/RiskCard';
import { AlertBanner } from './components/AlertBanner';
import { TelemetryView } from './components/TelemetryView';
import { LaunchpadView } from './components/LaunchpadView';
import { ResourcesAndCapaView } from './components/ResourcesAndCapaView';
import { JarvisView } from './components/JarvisView';
import { ShiftHandoverModal } from './components/ShiftHandoverModal';
import { QuickReportModal } from './components/QuickReportModal';
import { AuthModal } from './components/AuthModal';
import { LoginScreen } from './components/LoginScreen';
import { FacilityModal } from './components/FacilityModal';
import { SettingsModal } from './components/SettingsModal';
import { InAppWorkspaceViewer } from './components/InAppWorkspaceViewer';
import { MasterTelemetry, UserProfile, WorkspaceLink } from './types';
import { TelemetryService, LogHazardPayload, WORKSPACE_APPS } from './services/dataService';
import { AuthService } from './services/authService';
import { AppleHaptics } from './services/appleHaptics';
import { 
  ClipboardCheck, 
  Lightbulb, 
  UserCheck, 
  ShieldAlert, 
  ArrowRight, 
  Activity, 
  Zap, 
  Table 
} from 'lucide-react';

export const App: React.FC = () => {
  const [telemetry, setTelemetry] = useState<MasterTelemetry>(() => TelemetryService.getTelemetry());
  
  // Restore last active tab on app resume / reload
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const savedTab = localStorage.getItem('SBL_LAST_ACTIVE_TAB');
      if (savedTab && ['dashboard', 'telemetry', 'apps', 'resources', 'jarvis'].includes(savedTab)) {
        return savedTab as TabType;
      }
    } catch (e) {}
    return 'dashboard';
  });

  const [activeFacility, setActiveFacility] = useState<string>('Lalru Unit-3');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = AuthService.getCurrentUser();
    if (saved && saved.isAuthenticated) return saved;
    return {
      employeeCode: 'E0414',
      name: 'Budhi Parkash',
      role: 'HOD (Manufacturing)',
      department: 'Manufacturing',
      designation: 'HOD',
      facility: 'Lalru Unit-3',
      isAuthenticated: true
    };
  });

  const [isAppleMode, setIsAppleMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('SBL_APPLE_MODE');
    if (saved !== null) return saved === 'true';
    return AppleHaptics.isAppleDevice();
  });

  const handleToggleAppleMode = () => {
    const next = !isAppleMode;
    setIsAppleMode(next);
    localStorage.setItem('SBL_APPLE_MODE', String(next));
  };

  // Restore active in-app workspace on app resume / reload
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceLink | null>(() => {
    try {
      const savedWs = localStorage.getItem('SBL_ACTIVE_WORKSPACE');
      if (savedWs) {
        return JSON.parse(savedWs);
      }
    } catch (e) {}
    return null;
  });

  // Lifecycle persistence: Ensure app opens at exact same page when user returns
  useEffect(() => {
    try {
      localStorage.setItem('SBL_LAST_ACTIVE_TAB', activeTab);
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    try {
      if (activeWorkspace) {
        localStorage.setItem('SBL_ACTIVE_WORKSPACE', JSON.stringify(activeWorkspace));
      } else {
        localStorage.removeItem('SBL_ACTIVE_WORKSPACE');
      }
    } catch (e) {}
  }, [activeWorkspace]);

  useEffect(() => {
    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        try {
          const savedTab = localStorage.getItem('SBL_LAST_ACTIVE_TAB');
          if (savedTab && savedTab !== activeTab && ['dashboard', 'telemetry', 'apps', 'resources', 'jarvis'].includes(savedTab)) {
            setActiveTab(savedTab as TabType);
          }
        } catch (e) {}
      }
    };
    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('pageshow', handleResume);
    return () => {
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('pageshow', handleResume);
    };
  }, [activeTab]);

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isQuickReportOpen, setIsQuickReportOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Network status monitoring & Live Google Sheets Cloud Sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      TelemetryService.syncWithLiveCloud().then(updated => {
        setTelemetry({ ...updated });
      });
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Live Cloud Sync on App Mount
    TelemetryService.syncWithLiveCloud().then(updated => {
      setTelemetry({ ...updated });
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleResolveHazard = (hazardId: string) => {
    const updated = TelemetryService.resolveHazard(hazardId);
    setTelemetry({ ...updated });
  };

  const handleQuickReportSubmit = (payload: LogHazardPayload) => {
    const updated = TelemetryService.addObservation(payload);
    setTelemetry({ ...updated });
  };

  const handleResetData = () => {
    const fresh = TelemetryService.resetToDefault();
    setTelemetry({ ...fresh });
  };

  const m = telemetry.metrics;

  // AUTHENTICATION GATE: No one can see the content of the app without login
  if (!user || !user.isAuthenticated) {
    return (
      <LoginScreen
        onLogin={(profile) => {
          setUser(profile);
        }}
        isAppleMode={isAppleMode}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isAppleMode ? 'font-ios' : 'font-sans'} selection:bg-blue-600 selection:text-white`}>
      {/* Top Mobile Bar */}
      <Header
        facility={activeFacility}
        onOpenFacilityModal={() => setIsFacilityModalOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenQuickReport={() => setIsQuickReportOpen(true)}
        isOnline={isOnline}
        isAppleMode={isAppleMode}
      />

      {/* Main Screen Content */}
      <main className="flex-1 px-4 pt-3 pb-24 max-w-lg mx-auto w-full overflow-y-auto">
        {/* TAB 1: DASHBOARD COMMAND TOWER */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Facility Risk Index Monitor Card */}
            <RiskCard
              telemetry={telemetry}
              onOpenShiftBriefing={() => setIsShiftModalOpen(true)}
              onOpenQuickReport={() => setIsQuickReportOpen(true)}
            />

            {/* Dynamic Alert Banner */}
            <AlertBanner
              telemetry={telemetry}
              onNavigateToTelemetry={() => setActiveTab('telemetry')}
              onNavigateToResources={() => setActiveTab('resources')}
            />

            {/* Quick Metrics Quad Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* PTW Chip */}
              <div
                onClick={() => {
                  AppleHaptics.selection();
                  const ws = WORKSPACE_APPS.find(a => a.id === 'ptw-dashboard');
                  if (ws) setActiveWorkspace(ws);
                  else setActiveTab('apps');
                }}
                className="mobile-card rounded-2xl p-3 cursor-pointer hover:border-blue-500/50 active:scale-95 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-red-400 bg-red-500/20 px-1 rounded">
                    {m.ptw.highRisk} Critical
                  </span>
                </div>
                <span className="text-xl font-black text-slate-100 font-mono block">
                  {m.ptw.total}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Active Permits
                </span>
              </div>

              {/* Incidents Chip */}
              <div
                onClick={() => {
                  AppleHaptics.selection();
                  const ws = WORKSPACE_APPS.find(a => a.id === 'uac-nm-dashboard');
                  if (ws) setActiveWorkspace(ws);
                  else setActiveTab('apps');
                }}
                className="mobile-card rounded-2xl p-3 cursor-pointer hover:border-red-500/50 active:scale-95 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">Active</span>
                </div>
                <span className="text-xl font-black text-red-400 font-mono block">
                  {m.incidents.totalActive}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  UA/C & Hazards
                </span>
              </div>

              {/* LMS Chip */}
              <div
                onClick={() => {
                  AppleHaptics.selection();
                  const ws = WORKSPACE_APPS.find(a => a.id === 'digital-lms');
                  if (ws) setActiveWorkspace(ws);
                  else setActiveTab('apps');
                }}
                className="mobile-card rounded-2xl p-3 cursor-pointer hover:border-emerald-500/50 active:scale-95 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400">Goal 100%</span>
                </div>
                <span className="text-xl font-black text-emerald-400 font-mono block">
                  {m.lms.compliance}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  LMS Compliance
                </span>
              </div>

              {/* Kaizen Chip */}
              <div
                onClick={() => {
                  AppleHaptics.selection();
                  const ws = WORKSPACE_APPS.find(a => a.id === 'kaizen-hub');
                  if (ws) setActiveWorkspace(ws);
                  else setActiveTab('apps');
                }}
                className="mobile-card rounded-2xl p-3 cursor-pointer hover:border-amber-500/50 active:scale-95 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold text-amber-400">Review</span>
                </div>
                <span className="text-xl font-black text-amber-400 font-mono block">
                  {m.kaizen.pending}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Kaizen Pipeline
                </span>
              </div>
            </div>

            {/* Quick Action Banner to SBL Apps */}
            <div 
              onClick={() => setActiveTab('apps')}
              className="mobile-card rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:border-blue-500/40 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">16 SBL EHS Apps & Google Forms</h4>
                  <p className="text-[10px] text-slate-400">PTW, Fire, Safety Shower, 5S, SOPs...</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY DEEP DIVE */}
        {activeTab === 'telemetry' && (
          <TelemetryView telemetry={telemetry} />
        )}

        {/* TAB 3: WORKSPACE LAUNCHPAD (16 APPS) */}
        {activeTab === 'apps' && (
          <LaunchpadView 
            onOpenQuickReport={() => setIsQuickReportOpen(true)} 
            onOpenWorkspace={(ws) => setActiveWorkspace(ws)}
          />
        )}

        {/* TAB 4: RESOURCES & CAPA MATRIX */}
        {activeTab === 'resources' && (
          <ResourcesAndCapaView
            telemetry={telemetry}
            onResolveHazard={handleResolveHazard}
          />
        )}

        {/* TAB 5: J.A.R.V.I.S. PREDICTIVE AI */}
        {activeTab === 'jarvis' && (
          <JarvisView
            telemetry={telemetry}
            facility={activeFacility}
            onOpenShiftBriefing={() => setIsShiftModalOpen(true)}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        hazardCount={telemetry.criticalHazards.length}
        isAppleMode={isAppleMode}
      />

      {/* In-App Workspace Embedded Viewer */}
      {activeWorkspace && (
        <InAppWorkspaceViewer
          workspace={activeWorkspace}
          onClose={() => setActiveWorkspace(null)}
        />
      )}

      {/* MODALS */}
      {isShiftModalOpen && (
        <ShiftHandoverModal
          telemetry={telemetry}
          facility={activeFacility}
          onClose={() => setIsShiftModalOpen(false)}
        />
      )}

      {isQuickReportOpen && (
        <QuickReportModal
          defaultObserver={user.name ? `${user.name} (${user.employeeCode})` : 'Budhi Parkash (E0414)'}
          onClose={() => setIsQuickReportOpen(false)}
          onSubmit={handleQuickReportSubmit}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          user={user}
          onLogin={(profile) => setUser(profile)}
          onLogout={() => {
            AuthService.logout();
            setUser({
              employeeCode: '',
              name: '',
              role: '',
              facility: 'Lalru Unit-3',
              isAuthenticated: false
            });
            setIsAuthModalOpen(false);
          }}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {isFacilityModalOpen && (
        <FacilityModal
          currentFacility={activeFacility}
          onSelectFacility={(fac) => setActiveFacility(fac)}
          onClose={() => setIsFacilityModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onResetData={handleResetData}
          onClose={() => setIsSettingsModalOpen(false)}
          isAppleMode={isAppleMode}
          onToggleAppleMode={handleToggleAppleMode}
        />
      )}
    </div>
  );
};
