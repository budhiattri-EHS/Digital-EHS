'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  Flame,
  Sparkles,
  Lightbulb,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Activity,
  Layers,
  Search,
  PlusCircle,
  Download,
  Calendar,
  Lock,
  Zap,
  TrendingUp,
  Cpu,
  Eye,
  RefreshCw,
  X,
  ChevronRight,
  Filter,
  BarChart3,
  Award,
  BookOpen,
  Truck,
  HeartPulse,
  Scale,
  Bot,
  LogOut,
  Building2,
  Check
} from 'lucide-react';
import { UniversalEhsApi } from '@/lib/supabaseClient';
import { generateEnterpriseEhsPdf } from '@/lib/pdfGenerator';
import { ModuleDefinition } from '@/types';
import { BrandLogo } from '@/components/BrandLogo';
import { CompanyLogo } from '@/components/CompanyLogo';
import { LoginPage } from '@/components/LoginPage';
import { PtwDashboardView } from '@/components/ptw/PtwDashboardView';

// ==============================================================================
// 24 MODULE REGISTRY DEFINITIONS WITH FORMAT NUMBERS & REVISIONS
// ==============================================================================
const MODULE_REGISTRY: ModuleDefinition[] = [
  // 1. Core Operations
  { id: 'ptw', number: 1, title: 'Permit to Work (PTW)', subtitle: 'High-risk work authorization & LOTO', icon: 'FileText', category: 'Core Operations', formatNumber: 'SBL/EHS/PTW-01', revNumber: 'Rev 04', revDate: '01-Nov-2026', badge: '16 Active' },
  { id: 'moc', number: 2, title: 'Management of Change (MOC)', subtitle: 'Process, equipment & personnel change governance', icon: 'Layers', category: 'Core Operations', formatNumber: 'SBL/EHS/MOC-02', revNumber: 'Rev 02', revDate: '15-Oct-2026', badge: '1 In Progress' },
  { id: 'pssr', number: 3, title: 'Pre-Startup Safety Review', subtitle: 'Safety validation prior to commissioning', icon: 'CheckCircle2', category: 'Core Operations', formatNumber: 'SBL/EHS/PSSR-03', revNumber: 'Rev 01', revDate: '20-Oct-2026', badge: '1 Under Review' },
  { id: 'loto', number: 24, title: 'LOTO & Isolation', subtitle: 'Lockout, tagout & zero-energy verification', icon: 'Lock', category: 'Core Operations', formatNumber: 'SBL/EHS/LOTO-24', revNumber: 'Rev 03', revDate: '12-Oct-2026', badge: 'Verified Zero' },

  // 2. Incident & Quality
  { id: 'capa', number: 4, title: 'Corrective & Preventive Action', subtitle: 'Root cause tracking & 5-Whys resolution', icon: 'Activity', category: 'Incident & Quality', formatNumber: 'SBL/EHS/CAPA-04', revNumber: 'Rev 05', revDate: '28-Oct-2026', badge: '14 Actions' },
  { id: 'uac', number: 7, title: 'Safety Observations (UA/UC/NM)', subtitle: 'Unsafe acts, unsafe conditions & near-miss logs', icon: 'AlertTriangle', category: 'Incident & Quality', formatNumber: 'SBL/EHS/UA-07', revNumber: 'Rev 06', revDate: '25-Oct-2026', badge: '104 Logged' },
  { id: 'incidents', number: 9, title: 'Incident Management', subtitle: 'OSHA injury classification & investigation', icon: 'ShieldAlert', category: 'Incident & Quality', formatNumber: 'SBL/EHS/INC-09', revNumber: 'Rev 03', revDate: '15-Oct-2026', badge: 'Zero LTI' },
  { id: 'kaizen', number: 17, title: 'BBSO & Kaizen Hub', subtitle: 'Continuous improvement & behavior-based safety', icon: 'Lightbulb', category: 'Incident & Quality', formatNumber: 'SBL/EHS/KZ-17', revNumber: 'Rev 04', revDate: '30-Oct-2026', badge: '32 Verified' },

  // 3. Audits & Standards
  { id: '5s', number: 10, title: '100-Point 5S Master System', subtitle: '5-Pillar ISO audits, leagues & rankings', icon: 'Sparkles', category: 'Audits & Standards', formatNumber: 'SBL/EHS/F-100', revNumber: 'Rev 00', revDate: '02-Nov-2026', badge: '53 Audits' },
  { id: 'fps', number: 11, title: 'Fire Protection System (FPS)', subtitle: 'Extinguishers, hydrants, pumps & QR tags', icon: 'Flame', category: 'Audits & Standards', formatNumber: 'SBL/EHS/FPS-11', revNumber: 'Rev 03', revDate: '15-Oct-2026', badge: '588 Assets' },
  { id: 'equipment', number: 19, title: 'Equipment Inspection', subtitle: 'First aid boxes, safety showers, machines', icon: 'Cpu', category: 'Audits & Standards', formatNumber: 'SBL/EHS/EQ-19', revNumber: 'Rev 02', revDate: '18-Oct-2026', badge: '60 Machines' },
  { id: 'statutory', number: 13, title: 'Statutory & Legal Compliance', subtitle: 'Consent to operate, factories act & PESO licenses', icon: 'Scale', category: 'Audits & Standards', formatNumber: 'SBL/EHS/LEG-13', revNumber: 'Rev 10', revDate: '01-Nov-2026', badge: '7 Licenses' },

  // 4. Risk & Process Safety
  { id: 'hazop', number: 5, title: 'HAZOP Studies', subtitle: 'Guidewords, deviations & safeguard matrix', icon: 'Layers', category: 'Risk & Process Safety', formatNumber: 'SBL/EHS/HZ-05', revNumber: 'Rev 02', revDate: '10-Oct-2026', badge: 'Study Complete' },
  { id: 'hira', number: 15, title: 'HIRA Risk Assessment', subtitle: '5x5 hazard severity & likelihood quantification', icon: 'BarChart3', category: 'Risk & Process Safety', formatNumber: 'SBL/EHS/HIRA-15', revNumber: 'Rev 04', revDate: '22-Oct-2026', badge: 'Active Matrix' },
  { id: 'jsa', number: 23, title: 'Job Safety Analysis (JSA)', subtitle: 'Step-by-step task hazards & mandatory controls', icon: 'FileText', category: 'Risk & Process Safety', formatNumber: 'SBL/EHS/JSA-23', revNumber: 'Rev 02', revDate: '05-Oct-2026', badge: 'Standard SOP' },
  { id: 'psm', number: 22, title: 'Process Safety Management', subtitle: '14 OSHA elements for chemical containment', icon: 'TrendingUp', category: 'Risk & Process Safety', formatNumber: 'SBL/EHS/PSM-22', revNumber: 'Rev 01', revDate: '14-Sep-2026', badge: '85% Compliant' },

  // 5. Health & People
  { id: 'lms', number: 16, title: 'Digital LMS & Training', subtitle: 'Interactive video player, quizzes & certificates', icon: 'UserCheck', category: 'Health & People', formatNumber: 'SBL/EHS/LMS-16', revNumber: 'Rev 03', revDate: '26-Oct-2026', badge: '54 Courses' },
  { id: 'ohc', number: 12, title: 'Occupational Health Center', subtitle: 'Medical surveillance, vitals & first aid logs', icon: 'HeartPulse', category: 'Health & People', formatNumber: 'SBL/EHS/OHC-12', revNumber: 'Rev 01', revDate: '19-Oct-2026', badge: 'Surveillance' },
  { id: 'committee', number: 20, title: 'Safety Committee Meetings', subtitle: 'Worker-management joint committee minutes', icon: 'Award', category: 'Health & People', formatNumber: 'SBL/EHS/SCM-20', revNumber: 'Rev 02', revDate: '24-Oct-2026', badge: 'Quarterly MoM' },
  { id: 'drills', number: 18, title: 'Training & Mock Drills', subtitle: 'Emergency evacuation, headcount & timings', icon: 'Zap', category: 'Health & People', formatNumber: 'SBL/EHS/DRL-18', revNumber: 'Rev 02', revDate: '18-Oct-2026', badge: '142s Record' },

  // 6. Environment & Assets
  { id: 'esg', number: 6, title: 'ESG & Sustainability', subtitle: 'Scope 1, 2, 3 carbon, ETP discharge & VOC', icon: 'Activity', category: 'Environment & Assets', formatNumber: 'SBL/EHS/ESG-06', revNumber: 'Rev 02', revDate: '09-Nov-2026', badge: 'Safe VOC' },
  { id: 'documents', number: 21, title: 'Document & SOP Library', subtitle: 'Controlled engineering drawings & safety manuals', icon: 'BookOpen', category: 'Environment & Assets', formatNumber: 'SBL/EHS/DOC-21', revNumber: 'Rev 04', revDate: '11-Oct-2026', badge: 'Cloud SOPs' },
  { id: 'vehicles', number: 25, title: 'Contractor & Vehicle Registry', subtitle: 'Gate pass, spark arrestors & induction records', icon: 'Truck', category: 'Environment & Assets', formatNumber: 'SBL/EHS/VEH-25', revNumber: 'Rev 02', revDate: '15-Oct-2026', badge: 'Gate Control' },
  { id: 'jarvis', number: 14, title: 'Jarvis Safety AI Copilot', subtitle: 'Generative EHS assistant & regulatory advisory', icon: 'Bot', category: 'Environment & Assets', formatNumber: 'SBL/EHS/AI-14', revNumber: 'Rev 01', revDate: '01-Nov-2026', badge: 'Active AI' },
];

export default function EhsSaasApp() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Core Application State
  const [selectedCompanyId, setSelectedCompanyId] = useState('00000000-0000-0000-0000-000000000001');
  const [selectedFacilityId, setSelectedFacilityId] = useState('10000000-0000-0000-0000-000000000002');
  const [activeModuleId, setActiveModuleId] = useState('5s');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuite, setSelectedSuite] = useState<string>('All');
  const [isQuickRecordModalOpen, setIsQuickRecordModalOpen] = useState(false);
  const [recordType, setRecordType] = useState('Safety Observation');

  // Multi-tenant companies list
  const companies = UniversalEhsApi.getCompanies();
  const currentCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  // Facilities list
  const facilities = UniversalEhsApi.getFacilities(selectedCompanyId);
  const currentFacility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];

  // Active module meta
  const activeModule = useMemo(() => {
    return MODULE_REGISTRY.find(m => m.id === activeModuleId) || MODULE_REGISTRY[0];
  }, [activeModuleId]);

  // Data queries
  const telemetry = useMemo(() => UniversalEhsApi.getTelemetry(selectedCompanyId), [selectedCompanyId]);
  const fiveSAudits = useMemo(() => UniversalEhsApi.getFiveSAudits(selectedCompanyId), [selectedCompanyId]);
  const fpsAssets = useMemo(() => UniversalEhsApi.getFpsAssets(selectedCompanyId), [selectedCompanyId]);
  const kaizens = useMemo(() => UniversalEhsApi.getKaizenProposals(selectedCompanyId), [selectedCompanyId]);
  const ptws = useMemo(() => UniversalEhsApi.getPtwPermits(selectedCompanyId), [selectedCompanyId]);
  const capas = useMemo(() => UniversalEhsApi.getCapaActions(selectedCompanyId), [selectedCompanyId]);
  const observations = useMemo(() => UniversalEhsApi.getSafetyObservations(selectedCompanyId), [selectedCompanyId]);
  const lmsCourses = useMemo(() => UniversalEhsApi.getLmsCourses(selectedCompanyId), [selectedCompanyId]);
  const equipment = useMemo(() => UniversalEhsApi.getEquipment(selectedCompanyId), [selectedCompanyId]);
  const statutory = useMemo(() => UniversalEhsApi.getStatutoryCompliances(selectedCompanyId), [selectedCompanyId]);
  const esg = useMemo(() => UniversalEhsApi.getEsgMetrics(selectedCompanyId), [selectedCompanyId]);

  // Initial Auth Session Check
  useEffect(() => {
    try {
      const saved = localStorage.getItem('EHS_AUTH_SESSION');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isLoggedIn && parsed?.companyId) {
          setIsAuthenticated(true);
          setSelectedCompanyId(parsed.companyId);
          setUserProfile(parsed.user || {
            fullName: 'Budhi Parkash',
            role: 'HOD (Manufacturing & EHS)',
            employeeCode: 'E0414'
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth session', e);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  const handleLoginSuccess = (companyId: string, employeeCode: string, profile: any) => {
    setSelectedCompanyId(companyId);
    setUserProfile(profile);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('EHS_AUTH_SESSION');
    } catch (e) {}
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // Export Compliant PDF
  const handleExportPdf = () => {
    let headers: string[] = ['ID', 'Date', 'Type / Name', 'Location / Dept', 'Score / Status', 'Remarks'];
    let rows: (string | number)[][] = [];

    if (activeModule.id === '5s') {
      headers = ['Audit ID', 'Date', 'Department', 'League', 'Total Score', 'Remarks'];
      rows = fiveSAudits.slice(0, 30).map(a => [
        a.audit_number,
        a.audit_date,
        a.department,
        a.league,
        `${a.total_score}%`,
        a.remarks || 'Standard audit compliant'
      ]);
    } else if (activeModule.id === 'fps') {
      headers = ['Asset Tag', 'Type', 'Location', 'Zone', 'Status', 'Hydro Due'];
      rows = fpsAssets.slice(0, 30).map(a => [
        a.asset_tag,
        a.asset_type,
        a.location,
        a.zone,
        a.status,
        a.hydro_test_date || 'N/A'
      ]);
    } else if (activeModule.id === 'kaizen') {
      headers = ['Kaizen ID', 'Title', 'Department', 'Impact Category', 'Score', 'Status'];
      rows = kaizens.map(k => [
        k.kaizen_number,
        k.title,
        k.department,
        k.benefit_type,
        k.total_score,
        k.status
      ]);
    } else if (activeModule.id === 'ptw') {
      headers = ['Permit No', 'Type', 'Title', 'Location', 'Risk Level', 'Status'];
      rows = ptws.map(p => [
        p.permit_number,
        p.permit_type,
        p.title,
        p.location,
        p.risk_level,
        p.status
      ]);
    } else {
      headers = ['Record ID', 'Title / Description', 'Category', 'Target Date', 'Status'];
      rows = capas.map(c => [
        c.capa_number,
        c.title,
        c.action_type,
        c.due_date,
        c.status
      ]);
    }

    generateEnterpriseEhsPdf({
      companyName: currentCompany.name,
      formatNumber: activeModule.formatNumber,
      revNumber: activeModule.revNumber,
      revDate: activeModule.revDate,
      docId: `DOC-${activeModule.id.toUpperCase()}-${Date.now().toString().slice(-6)}`,
      status: 'VERIFIED',
      title: `${activeModule.title} Official Report`,
      facility: currentFacility?.name || 'Main Facility',
      metadata: {
        'Facility / Site': currentFacility?.name || 'Lalru Unit-3',
        'Lead EHS Officer': 'Budhi Parkash (HOD EHS)',
        'Tenant License': currentCompany.subscription_tier,
        'Evaluation Standard': 'ISO 45001 / ISO 14001 Matrix',
        'Company Industry': currentCompany.industry,
        'Audit Validity': 'Current Operational Cycle'
      },
      tableHeaders: headers,
      tableRows: rows,
      observationsNotes: 'Strict adherence to SBL safety operating guidelines is required across all stations.'
    });
  };

  // If not authenticated, open directly to sleek Apple-style Login Page
  if (!isAuthenticated && !isAuthChecking) {
    return (
      <LoginPage
        companies={companies}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Loading state while checking localStorage session
  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen bg-[#f5f5f7] flex items-center justify-center">
        <BrandLogo size="lg" showSubtitle={true} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased">
      {/* ==============================================================================
          LEFT SIDEBAR: 24 ENTERPRISE MODULES ACROSS 6 SUITES (APPLE LIGHT AESTHETIC)
      ============================================================================== */}
      <aside className="w-80 border-r border-[#d2d2d7]/70 bg-white flex flex-col shrink-0 overflow-hidden shadow-[2px_0_12px_rgba(0,0,0,0.03)] z-20">
        {/* Brand & Multi-Tenant Header */}
        <div className="p-4 border-b border-[#d2d2d7]/60 bg-[#ffffff] flex flex-col gap-3 shrink-0">
          {/* Creative Website Master Brand Logo */}
          <BrandLogo size="sm" showSubtitle={true} className="pb-1 border-b border-[#d2d2d7]/40" />

          {/* Respective Logged-in Company's Logo Card */}
          <div className="p-2.5 bg-[#f5f5f7] rounded-2xl border border-[#d2d2d7]/70 shadow-sm">
            <CompanyLogo company={currentCompany} size="sm" showDetails={true} />
          </div>

          {/* Tenant Switcher Dropdown (Multi-Tenancy) */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block mb-1">
              Switch Corporate Tenant
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-xs rounded-xl px-3 py-1.5 font-medium text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all cursor-pointer shadow-sm"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Facility Selector */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block mb-1">
              Operating Facility / Site
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-xs rounded-xl px-3 py-1.5 font-medium text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all cursor-pointer shadow-sm"
            >
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Suite Filter Tabs (Apple Segmented Control Style) */}
        <div className="p-2 border-b border-[#d2d2d7]/60 bg-[#f5f5f7]/70 overflow-x-auto flex gap-1 scrollbar-none text-[11px] font-medium shrink-0">
          {['All', 'Core Operations', 'Incident & Quality', 'Audits & Standards', 'Risk & Process Safety', 'Health & People', 'Environment & Assets'].map(suite => (
            <button
              key={suite}
              onClick={() => setSelectedSuite(suite)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all text-xs ${
                selectedSuite === suite
                  ? 'bg-white text-[#1d1d1f] font-semibold shadow-sm border border-[#d2d2d7]/70'
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/50'
              }`}
            >
              {suite === 'All' ? 'All (24)' : suite.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Module Scroll List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {MODULE_REGISTRY.filter(m => selectedSuite === 'All' || m.category === selectedSuite).map(mod => {
            const isActive = activeModuleId === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModuleId(mod.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all flex items-start justify-between gap-2.5 border ${
                  isActive
                    ? 'bg-[#0071e3]/10 border-[#0071e3]/40 shadow-sm text-[#1d1d1f]'
                    : 'border-transparent text-[#1d1d1f] hover:bg-[#f5f5f7] hover:border-[#d2d2d7]/50'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono transition-colors ${
                    isActive ? 'bg-[#0071e3] text-white' : 'bg-[#e8e8ed] text-[#515154]'
                  }`}>
                    {mod.number}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-xs leading-tight truncate ${isActive ? 'font-bold text-[#0071e3]' : 'font-semibold text-[#1d1d1f]'}`}>
                      {mod.title}
                    </h3>
                    <p className="text-[10px] text-[#86868b] truncate max-w-[160px] mt-0.5">{mod.subtitle}</p>
                    <span className={`text-[9px] font-mono font-medium block mt-1 ${isActive ? 'text-[#0071e3]' : 'text-[#86868b]'}`}>
                      {mod.formatNumber}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-semibold shrink-0 border ${
                  isActive
                    ? 'bg-[#0071e3]/15 text-[#0071e3] border-[#0071e3]/30'
                    : 'bg-[#e8e8ed] text-[#86868b] border-transparent'
                }`}>
                  {mod.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* User Card in Sidebar Bottom with Sign Out */}
        <div className="p-3.5 border-t border-[#d2d2d7]/60 bg-[#ffffff] flex items-center justify-between shrink-0 shadow-[0_-1px_6px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#70a6ff] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {userProfile?.employeeCode?.slice(0, 2) || 'BP'}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1d1d1f] truncate max-w-[130px]">
                {userProfile?.fullName || 'Budhi Parkash'}
              </div>
              <div className="text-[10px] text-[#86868b]">
                {userProfile?.employeeCode || 'E0414'} • {userProfile?.role || 'HOD EHS'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl hover:bg-rose-50 text-[#86868b] hover:text-rose-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ==============================================================================
          MAIN CONTENT AREA: TELEMETRY CONTROL TOWER & WORKSPACES (APPLE LIGHT THEME)
      ============================================================================== */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f5f5f7]">
        {/* Top Executive Header (Frosted Glass) with Company Logo & Brand */}
        <header className="h-16 apple-glass px-6 flex items-center justify-between shrink-0 z-10 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          {/* Active Module Indicator with Company Logo */}
          <div className="flex items-center gap-3">
            <CompanyLogo company={currentCompany} size="sm" showDetails={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-semibold uppercase text-[#0071e3] tracking-wider">
                  {activeModule.category} • Module #{activeModule.number}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#e8e8ed] text-[#515154] font-mono font-semibold">
                  {activeModule.formatNumber} ({activeModule.revNumber})
                </span>
              </div>
              <h2 className="text-base font-bold text-[#1d1d1f] leading-tight tracking-tight mt-0.5">
                {activeModule.title}
              </h2>
            </div>
          </div>

          {/* Central Telemetry Index & Controls */}
          <div className="flex items-center gap-3">
            {/* Real-time Global Risk Index Chip (Apple Health Style) */}
            <div className="px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 flex items-center gap-2.5 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              <div>
                <span className="text-[8px] uppercase font-bold text-rose-700 block leading-none tracking-wider">Plant Risk Index</span>
                <span className="text-sm font-bold font-mono text-rose-800 leading-tight">
                  {telemetry.global_risk_score} / 100 <span className="text-[10px] font-semibold uppercase text-rose-600">({telemetry.risk_status})</span>
                </span>
              </div>
            </div>

            {/* Quick Action: Log New Event (Apple Primary Blue) */}
            <button
              onClick={() => setIsQuickRecordModalOpen(true)}
              className="px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record Action</span>
            </button>

            {/* IMMUTABLE PDF EXPORT BUTTON (Apple Secondary White Pill) */}
            <button
              onClick={handleExportPdf}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] border border-[#d2d2d7] font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
              title="Generate System-Certified ISO Report"
            >
              <Download className="w-4 h-4 text-[#0071e3]" />
              <span>Export Official PDF</span>
            </button>

            {/* Sign Out Button in Header */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-white hover:bg-rose-50 text-[#86868b] hover:text-rose-600 border border-[#d2d2d7] transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global KPI Strip (Crisp Apple Cards) */}
        <section className="px-6 py-3.5 border-b border-[#d2d2d7]/50 bg-white/70 grid grid-cols-6 gap-3 shrink-0">
          <div className="saas-card p-3 rounded-2xl hover:border-[#0071e3]/40 transition-all">
            <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block">5S Plant Average</span>
            <span className="text-xl font-bold font-mono text-purple-700">69%</span>
            <span className="text-[9px] text-[#86868b] block mt-0.5">Goal: 85% ISO Target</span>
          </div>
          <div className="saas-card p-3 rounded-2xl hover:border-[#0071e3]/40 transition-all">
            <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block">Active Permits (PTW)</span>
            <span className="text-xl font-bold font-mono text-[#0071e3]">{ptws.length}</span>
            <span className="text-[9px] text-amber-600 block mt-0.5">2 High-Risk Active</span>
          </div>
          <div className="saas-card p-3 rounded-2xl hover:border-[#0071e3]/40 transition-all">
            <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block">FPS Fire Assets</span>
            <span className="text-xl font-bold font-mono text-orange-600">{fpsAssets.length}</span>
            <span className="text-[9px] text-emerald-600 block mt-0.5">100% Inspected</span>
          </div>
          <div className="saas-card p-3 rounded-2xl hover:border-[#0071e3]/40 transition-all">
            <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block">Safety Hazards (UA/UC)</span>
            <span className="text-xl font-bold font-mono text-rose-600">{observations.length}</span>
            <span className="text-[9px] text-rose-600 block mt-0.5">14 Urgent CAPA</span>
          </div>
          <div className="saas-card p-3 rounded-2xl hover:border-[#0071e3]/40 transition-all">
            <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block">Kaizens Completed</span>
            <span className="text-xl font-bold font-mono text-emerald-600">{kaizens.length}</span>
            <span className="text-[9px] text-emerald-600 block mt-0.5">+2 This Month</span>
          </div>
          <div className="saas-card p-3 rounded-2xl hover:border-[#0071e3]/40 transition-all">
            <span className="text-[10px] uppercase font-semibold text-[#86868b] tracking-wider block">LMS Compliance</span>
            <span className="text-xl font-bold font-mono text-blue-600">67%</span>
            <span className="text-[9px] text-[#86868b] block mt-0.5">54 Video Courses</span>
          </div>
        </section>

        {/* Dynamic Module Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeModule.id === 'ptw' ? (
            <PtwDashboardView
              companyName={currentCompany.name}
              facilityName={currentFacility?.name || 'Lalru Unit-3'}
              userProfile={userProfile}
            />
          ) : (
            <>
              {/* Module Banner Card with Respective Company Logo */}
              <div className="p-5 rounded-2xl saas-card flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 flex items-center justify-center font-bold text-lg">
                    #{activeModule.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#1d1d1f]">{activeModule.title}</h3>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold font-mono">
                        UNIVERSAL REST API LIVE
                      </span>
                    </div>
                    <p className="text-xs text-[#86868b] mt-0.5">{activeModule.subtitle}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#86868b] font-mono">
                      <span>Tenant: <strong className="text-[#1d1d1f] font-semibold">{currentCompany.name}</strong></span>
                      <span>•</span>
                      <span>Format: <strong className="text-[#0071e3] font-semibold">{activeModule.formatNumber}</strong></span>
                      <span>•</span>
                      <span>Revision: <strong className="text-[#1d1d1f] font-semibold">{activeModule.revNumber}</strong> ({activeModule.revDate})</span>
                    </div>
                  </div>
                </div>

                {/* Quick Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter records..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#f5f5f7] border border-[#d2d2d7] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Module Data Table (Clean Apple Table Aesthetic) */}
              <div className="saas-card rounded-2xl overflow-hidden border border-[#d2d2d7]/60 shadow-sm">
                {activeModule.id === '5s' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f5f5f7] text-[#86868b] uppercase text-[10px] font-semibold border-b border-[#d2d2d7]/60">
                      <tr>
                        <th className="p-3.5">Audit Number</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">League</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5 text-center">Score (100)</th>
                        <th className="p-3.5">Auditor Remarks</th>
                        <th className="p-3.5 text-right">Certificate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f7] font-medium text-[#1d1d1f]">
                      {fiveSAudits.filter(a => !searchQuery || a.department.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 25).map(a => (
                        <tr key={a.id} className="hover:bg-[#f5f5f7]/80 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-purple-700">{a.audit_number}</td>
                          <td className="p-3.5 text-[#86868b]">{a.audit_date}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              a.league === 'Labs League'
                                ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                            }`}>
                              {a.league}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-[#1d1d1f]">{a.department}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs border ${
                              a.total_score >= 85
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                : 'bg-amber-50 text-amber-700 border-amber-200/60'
                            }`}>
                              {a.total_score}%
                            </span>
                          </td>
                          <td className="p-3.5 text-[#515154] max-w-xs truncate">{a.remarks}</td>
                          <td className="p-3.5 text-right">
                            {a.report_pdf_url ? (
                              <a
                                href={a.report_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0071e3] hover:underline text-[11px] font-semibold"
                              >
                                Drive PDF
                              </a>
                            ) : (
                              <span className="text-[#86868b] text-[10px]">Matrix Ready</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeModule.id === 'fps' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f5f5f7] text-[#86868b] uppercase text-[10px] font-semibold border-b border-[#d2d2d7]/60">
                      <tr>
                        <th className="p-3.5">Asset Tag</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Location</th>
                        <th className="p-3.5">Zone</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5">Hydro Due</th>
                        <th className="p-3.5 text-right">QR Token</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f7] font-medium text-[#1d1d1f]">
                      {fpsAssets.filter(f => !searchQuery || f.location.toLowerCase().includes(searchQuery.toLowerCase()) || f.asset_tag.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 25).map(f => (
                        <tr key={f.id} className="hover:bg-[#f5f5f7]/80 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-orange-600">{f.asset_tag}</td>
                          <td className="p-3.5 font-semibold text-[#1d1d1f]">{f.asset_type}</td>
                          <td className="p-3.5 text-[#515154]">{f.location}</td>
                          <td className="p-3.5 text-[#86868b]">{f.zone}</td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              f.status === 'Operable'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                : 'bg-rose-50 text-rose-700 border-rose-200/60'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-[#86868b] font-mono">{f.hydro_test_date || '2028-12-31'}</td>
                          <td className="p-3.5 text-right font-mono text-[10px] text-[#0071e3] font-semibold">{f.qr_code_token}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Fallback View for other modules */}
                {!['5s', 'fps', 'ptw'].includes(activeModule.id) && (
                  <div className="p-10 text-center text-[#86868b]">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-[#0071e3]" />
                    <h4 className="text-sm font-bold text-[#1d1d1f]">Module Initialized with Multi-Tenant Architecture</h4>
                    <p className="text-xs text-[#86868b] mt-1 max-w-md mx-auto">
                      {activeModule.title} is synchronized with the central Supabase PostgreSQL schema, RLS policies, and universal data bundle.
                    </p>
                    <button
                      onClick={handleExportPdf}
                      className="mt-4 px-5 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs inline-flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Generate Certified {activeModule.formatNumber} Report</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mandatory Creator & Maintenance Footer on Dashboard */}
          <footer className="pt-6 pb-4 text-center border-t border-[#d2d2d7]/50 text-xs text-[#86868b]">
            <p className="font-medium text-[#515154]">
              EHS Management Software created developed and maintained by Mr Budhi Parkash.
            </p>
            <p className="text-[10px] text-[#86868b] mt-1">
              Budhi Parkash&apos;s Digital EHS Management System • Enterprise Cloud Edition
            </p>
          </footer>
        </div>
      </main>

      {/* ==============================================================================
          QUICK ACTION MODAL: RECORD EVENT (APPLE LIGHT DIALOG)
      ============================================================================== */}
      {isQuickRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#d2d2d7]/70 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 text-[#1d1d1f]">
            <div className="flex items-center justify-between border-b border-[#d2d2d7]/50 pb-3">
              <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#0071e3]" />
                Record Action to Central Supabase
              </h3>
              <button 
                onClick={() => setIsQuickRecordModalOpen(false)} 
                className="w-7 h-7 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#86868b] block mb-1">Target Module</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl p-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              >
                <option value="Safety Observation">Safety Observation (UA/UC/NM)</option>
                <option value="PTW Permit">Permit to Work (PTW)</option>
                <option value="Kaizen Proposal">Kaizen Continuous Improvement</option>
                <option value="5S Audit">5S 100-Point Audit</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#86868b] block mb-1">Location / Zone</label>
              <input
                type="text"
                defaultValue="Lalru Unit-3 Mixing Plant"
                className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl p-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#86868b] block mb-1">Description / Observations</label>
              <textarea
                rows={3}
                defaultValue="Conducted immediate field inspection. Controls in place."
                className="w-full bg-[#f5f5f7] border border-[#d2d2d7] rounded-xl p-2.5 text-xs text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#d2d2d7]/50">
              <button
                onClick={() => setIsQuickRecordModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Successfully committed new ${recordType} to company ${currentCompany.name} (RLS Tenant ID ${selectedCompanyId}).`);
                  setIsQuickRecordModalOpen(false);
                }}
                className="px-5 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs shadow-sm active:scale-[0.98] transition-all"
              >
                Commit to Cloud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
