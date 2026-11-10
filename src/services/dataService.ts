import { MasterTelemetry, WorkspaceLink, CriticalHazard } from '../types';
import { SblLiveSyncService, SBL_REAL_UAC_LOG, SBL_REAL_KAIZENS } from './liveDataService';

export const INITIAL_TELEMETRY: MasterTelemetry = {
  globalRiskScore: 75, // Elevated Facility Risk Index (0 PTWs, 104 active reports/capa, 41% LMS compliance)
  metrics: {
    ptw: {
      total: 0, // Real Google Sheet PTW_Master_Data: 0 Active Permits Today
      highRisk: 0, // 0 High Risk Permits Today
      today: 0,
      activeRequests: 0,
      pending: 0,
      rejected: 16,
      mtd: 18,
      ytd: 1755,
      breakdown: [
        { label: 'Hot Work', count: 0, color: 'text-orange-500', bg: 'bg-orange-500/20' },
        { label: 'Confined Space', count: 0, color: 'text-purple-400', bg: 'bg-purple-500/20' },
        { label: 'Height Work', count: 0, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { label: 'General / Cold', count: 0, color: 'text-slate-400', bg: 'bg-slate-500/20' }
      ],
      yesterday: {
        total: 0,
        hot: 0,
        confined: 0,
        height: 0,
        cold: 0
      }
    },
    kaizen: {
      total: 32, // Live Google Sheet Log (1apD4hJx2e0MwYWt-yfkWsGf6-q5YwORSLWotmxaFZbI)
      pending: 8,
      pendingHod: 2,
      pendingAssessor: 6,
      completed: 22,
      totalSystemScore: 1450,
      trend: '+2',
      breakdown: [
        { label: 'Pending Approval (HOD)', count: 2, color: 'text-amber-400', bg: 'bg-amber-500/20' },
        { label: 'Verified & Completed', count: 22, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        { label: 'Work In Progress / Assessor', count: 6, color: 'text-blue-400', bg: 'bg-blue-500/20' }
      ]
    },
    lms: {
      compliance: 67, // Core Plant Compliance: (Manufacturing 89% + Product Development 64% + Administration 48%) / 3 = 67%
      breakdown: [
        { label: 'Manufacturing', count: 89, color: 'text-emerald-400' },
        { label: 'Product Development', count: 64, color: 'text-blue-400' },
        { label: 'Administration', count: 48, color: 'text-amber-400' },
        { label: 'Customer Support', count: 39, color: 'text-orange-400' },
        { label: 'Sales & Marketing', count: 4, color: 'text-red-400' }
      ]
    },
    incidents: {
      totalActive: 104, // Real Google Sheet Safety Log: 104 active open reports
      breakdown: [
        { label: 'Unsafe Conditions', count: 85, color: 'text-amber-400', bg: 'bg-amber-500/20' },
        { label: 'Unsafe Acts', count: 19, color: 'text-orange-400', bg: 'bg-orange-500/20' },
        { label: 'Near Misses', count: 0, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { label: 'Recordable', count: 0, color: 'text-red-400', bg: 'bg-red-500/20' }
      ],
      yesterday: {
        total: 0,
        act: 0,
        condition: 0,
        nearMiss: 0
      }
    }
  },
  complianceMatrix: {
    "Corporate Audit": { closed: 42, wip: 24, open: 11, total: 77, breakdown: { "Electrical": 11, "Mechanical": 9, "Fire": 12 } },
    "PSSR": { closed: 112, wip: 14, open: 14, total: 140, breakdown: { "Process Safety": 14 } },
    "HAZOP": { closed: 12, wip: 12, open: 6, total: 30, breakdown: { "Engineering": 6 } },
    "GSM": { closed: 85, wip: 9, open: 0, total: 94, breakdown: { "Maintenance": 9 } },
    "Customer": { closed: 22, wip: 8, open: 3, total: 33, breakdown: { "Quality": 3 } },
    "Incident CAPA": { closed: 105, wip: 21, open: 14, total: 140, breakdown: { "Unsafe Condition": 14 } }
  },
  criticalHazards: [
    {
      id: "SA/2026/00397",
      source: "Solvent tank area",
      desc: "The drain cover may collapse at any time as concrete/plaster underneath is deteriorating",
      capa: "Barricaded area, civil repair scheduled",
      assignedTo: "Engineering & Maintenance",
      dueDate: "Urgent",
      priority: "HIGH"
    },
    {
      id: "SA/2026/00511",
      source: "NC Building",
      desc: "NC gets stuck in gap between mixer and floor. Gap closure needed.",
      capa: "Engineering modifications underway",
      assignedTo: "Engineering & EHS",
      dueDate: "Urgent",
      priority: "HIGH"
    },
    {
      id: "SA/2026/00548",
      source: "Resin plant",
      desc: "Motor shaft and coupling rotating section completely exposed without guarding",
      capa: "Fabricating interlocking machine guard",
      assignedTo: "Maintenance",
      dueDate: "Urgent",
      priority: "HIGH"
    },
    {
      id: "SA/2026/00565",
      source: "Extended building outside",
      desc: "Height work without safety belts and required fall arrest PPEs",
      capa: "Immediate work stoppage and retraining contractor supervisor",
      assignedTo: "EHS Operations",
      dueDate: "Urgent",
      priority: "HIGH"
    }
  ],
  environmental: {
    power: {
      gridKWh: 14250,
      gridChange: -4.2,
      dg750Liters: 840,
      dg750Change: 12.1,
      dg400Liters: 120,
      dg400Change: -1.5
    },
    fluids: {
      freshWaterKL: 42.5,
      etpDischargeKL: 18.2
    },
    voc: {
      value: 14.2,
      status: 'Safe'
    },
    waste: {
      usedOilLiters: 125,
      wastePaintKg: 450,
      drumsCount: 42,
      etpSludgeKg: 1200
    }
  },
  lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
};

export const SBL_SAFETY_ALERT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdtzUUDUv0YARGnKOzUO6QQzTPTUtybqppoQDa9OReKXADWvA/viewform';
export const SBL_SAFETY_ALERT_FORM_EDIT_URL = 'https://docs.google.com/forms/d/1H4TG1Z4iEEpI85WI_YzBsu78TQImWGqt_j1kO6lipis/edit';
export const SBL_SAFETY_LOG_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1qxwTcS-2c87UAMH6c3xNPUT1MscKH5LXJwrgaSGTauY/edit?resourcekey=&gid=2132704242#gid=2132704242';
export const SBL_UAC_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyZ5JujrOFzh3BNTPyn5w20XW-AuCWpGgBeIsN5C5r2mWfdOCXUnyPIzKGYqeW7avM/exec';

export const SBL_DEPARTMENTS = [
  'HR', 'Finance', 'IT', 'Purchase', 
  'Sales', 'Marketing', 'R&D', 'Logistics', 
  'Production', 'Store', 'Maintenance', 'Project', 
  'Admin', 'EHS', 'Other'
];

export interface LogHazardPayload {
  observerInfo: string;
  observationType: string;
  dateTime: string;
  location: string;
  potentialSeverity: string;
  hazardDescription: string;
  immediateAction: string;
  observerSuggestion?: string;
  concernedDepartment: string;
  attachmentLink?: string;
  photoBase64?: string;
  photoName?: string;
  photoType?: string;
}

export const WORKSPACE_APPS: WorkspaceLink[] = [
  // 1. Core Operations
  {
    id: 'ptw-dashboard',
    name: 'Permit to Work (PTW)',
    type: 'System',
    icon: 'FileSpreadsheet',
    url: 'https://script.google.com/macros/s/AKfycbzcXqRgJP5id0dMrlEurm5EhwUz43x37Baal4PkiXLsfC0qW6D45GsxlxizhFSq6g/exec',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    category: 'Core Operations',
    formatNumber: 'SBL/EHS/PTW-01',
    revNumber: 'Rev 04',
    revDate: '01-Nov-2026',
    badge: '16 Active'
  },
  {
    id: 'create-ptw',
    name: 'Create PTW Authorization',
    type: 'Form',
    icon: 'FormInput',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdrnuPz8L4-AUu0PGQqe4xveZ0Mmy2pXU77bE_Al9iugsDVtQ/viewform',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    category: 'Core Operations',
    formatNumber: 'SBL/EHS/PTW-01F',
    revNumber: 'Rev 04',
    revDate: '01-Nov-2026',
    badge: 'Form'
  },
  {
    id: 'moc',
    name: 'Management of Change (MOC)',
    type: 'Governance',
    icon: 'Layers',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    category: 'Core Operations',
    formatNumber: 'SBL/EHS/MOC-02',
    revNumber: 'Rev 02',
    revDate: '15-Oct-2026',
    badge: '1 In Progress'
  },
  {
    id: 'pssr',
    name: 'Pre-Startup Safety Review (PSSR)',
    type: 'Inspection',
    icon: 'Sparkles',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    category: 'Core Operations',
    formatNumber: 'SBL/EHS/PSSR-03',
    revNumber: 'Rev 01',
    revDate: '20-Oct-2026',
    badge: 'Pre-Commission'
  },
  {
    id: 'loto',
    name: 'LOTO & Energy Isolation',
    type: 'Safety Standard',
    icon: 'ShieldAlert',
    url: 'https://script.google.com/macros/s/AKfycbzcXqRgJP5id0dMrlEurm5EhwUz43x37Baal4PkiXLsfC0qW6D45GsxlxizhFSq6g/exec',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    category: 'Core Operations',
    formatNumber: 'SBL/EHS/LOTO-24',
    revNumber: 'Rev 03',
    revDate: '12-Oct-2026',
    badge: 'Zero Energy'
  },

  // 2. Incident & Quality
  {
    id: 'capa',
    name: 'CAPA Action Matrix',
    type: 'Quality Matrix',
    icon: 'Activity',
    url: 'https://script.google.com/macros/s/AKfycbzShPlJsrMlZR85IE91P8UtDuzUA3r7sgRfVy50F2yS9llISMy_rNXFVUw6NuIlFis/exec',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    category: 'Incident & Quality',
    formatNumber: 'SBL/EHS/CAPA-04',
    revNumber: 'Rev 05',
    revDate: '28-Oct-2026',
    badge: '14 Actions'
  },
  {
    id: 'uac-nm-dashboard',
    name: 'Safety Observations (UA/UC/NM)',
    type: 'Dashboard',
    icon: 'ShieldAlert',
    url: 'https://script.google.com/macros/s/AKfycbyZ5JujrOFzh3BNTPyn5w20XW-AuCWpGgBeIsN5C5r2mWfdOCXUnyPIzKGYqeW7avM/exec',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    category: 'Incident & Quality',
    formatNumber: 'SBL/EHS/UA-07',
    revNumber: 'Rev 06',
    revDate: '25-Oct-2026',
    badge: '104 Logged'
  },
  {
    id: 'uac-nm-form',
    name: 'Log Safety Hazard (UA/UC/NM)',
    type: 'Form',
    icon: 'AlertTriangle',
    url: SBL_SAFETY_ALERT_FORM_URL,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    category: 'Incident & Quality',
    formatNumber: 'SBL/EHS/UA-07F',
    revNumber: 'Rev 06',
    revDate: '25-Oct-2026',
    badge: 'Rapid Form'
  },
  {
    id: 'incident-investigation',
    name: 'Incident Investigation & RCFA',
    type: 'Portal',
    icon: 'ShieldAlert',
    url: 'https://script.google.com/macros/s/AKfycbzShPlJsrMlZR85IE91P8UtDuzUA3r7sgRfVy50F2yS9llISMy_rNXFVUw6NuIlFis/exec',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    category: 'Incident & Quality',
    formatNumber: 'SBL/EHS/INC-09',
    revNumber: 'Rev 03',
    revDate: '15-Oct-2026',
    badge: 'Zero LTI'
  },
  {
    id: 'kaizen-hub',
    name: 'BBSO & Kaizen Hub',
    type: 'Dashboard',
    icon: 'Lightbulb',
    url: 'https://script.google.com/macros/s/AKfycbx6ncrIWJruY8AGyHr-QnJe4tL1KaYFcNbbX35Toq14R8rJkMzN7kedUYVuID9SFQ/exec',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    category: 'Incident & Quality',
    formatNumber: 'SBL/EHS/KZ-17',
    revNumber: 'Rev 04',
    revDate: '30-Oct-2026',
    badge: '32 Verified'
  },

  // 3. Audits & Standards
  {
    id: '5s-dashboard',
    name: '100-Point 5S Master System',
    type: 'Audit Suite',
    icon: 'Sparkles',
    url: 'https://script.google.com/macros/s/AKfycbyWBn_xWkr_RvwpgvYbon6aeEnv6dvj_fpIqXAyumZ93w4DzkZ8S3XqkO4P6d1XjPQ/exec',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    category: 'Audits & Standards',
    formatNumber: 'SBL/EHS/F-100',
    revNumber: 'Rev 00',
    revDate: '02-Nov-2026',
    badge: '53 Audits'
  },
  {
    id: 'fire-protection',
    name: 'Fire Protection System (FPS)',
    type: 'Dashboard',
    icon: 'Flame',
    url: 'https://script.google.com/macros/s/AKfycbyBZDFILlt-k2aGB1MjMfigydyxyBuptynCrvgCh32bv71d5K8Bu66g7vJnorCW9QXy/exec',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    category: 'Audits & Standards',
    formatNumber: 'SBL/EHS/FPS-11',
    revNumber: 'Rev 03',
    revDate: '15-Oct-2026',
    badge: '588 Assets'
  },
  {
    id: 'engineering-portal',
    name: 'Equipment & Machinery Registry',
    type: 'Workflow',
    icon: 'Cpu',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    category: 'Audits & Standards',
    formatNumber: 'SBL/EHS/EQ-19',
    revNumber: 'Rev 02',
    revDate: '18-Oct-2026',
    badge: '60 Machines'
  },
  {
    id: 'statutory-legal',
    name: 'Statutory & Legal Compliance',
    type: 'Governance',
    icon: 'FileSpreadsheet',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    category: 'Audits & Standards',
    formatNumber: 'SBL/EHS/LEG-13',
    revNumber: 'Rev 10',
    revDate: '01-Nov-2026',
    badge: '7 Licenses'
  },
  {
    id: 'shower-check',
    name: 'Safety Shower & Eyewash Audit',
    type: 'Form',
    icon: 'Droplets',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdzA1v6UMsFY1ciuBQoAdWVQcAdCd_KiJXEvwnalV9-LriEmA/viewform',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    category: 'Audits & Standards',
    formatNumber: 'SBL/EHS/SHW-19',
    revNumber: 'Rev 02',
    revDate: '18-Oct-2026',
    badge: 'Weekly Walk'
  },

  // 4. Risk & Process Safety
  {
    id: 'hazop',
    name: 'HAZOP Studies & Risk Node Matrix',
    type: 'Process Safety',
    icon: 'Layers',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    category: 'Risk & Process Safety',
    formatNumber: 'SBL/EHS/HZ-05',
    revNumber: 'Rev 02',
    revDate: '10-Oct-2026',
    badge: 'Hazop Node'
  },
  {
    id: 'hira',
    name: 'HIRA Risk Assessment (5x5 Matrix)',
    type: 'Risk Engine',
    icon: 'AlertTriangle',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    category: 'Risk & Process Safety',
    formatNumber: 'SBL/EHS/HIRA-15',
    revNumber: 'Rev 04',
    revDate: '22-Oct-2026',
    badge: 'Active Matrix'
  },
  {
    id: 'jsa',
    name: 'Job Safety Analysis (JSA)',
    type: 'Task Assessment',
    icon: 'FileSpreadsheet',
    url: 'https://script.google.com/macros/s/AKfycbzcXqRgJP5id0dMrlEurm5EhwUz43x37Baal4PkiXLsfC0qW6D45GsxlxizhFSq6g/exec',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    category: 'Risk & Process Safety',
    formatNumber: 'SBL/EHS/JSA-23',
    revNumber: 'Rev 02',
    revDate: '05-Oct-2026',
    badge: 'Standard JSA'
  },
  {
    id: 'psm',
    name: 'Process Safety Management (14 Elements)',
    type: 'OSHA Standard',
    icon: 'Cpu',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    category: 'Risk & Process Safety',
    formatNumber: 'SBL/EHS/PSM-22',
    revNumber: 'Rev 01',
    revDate: '14-Sep-2026',
    badge: '85% Compliant'
  },

  // 5. Health & People
  {
    id: 'digital-lms',
    name: 'Digital LMS & Safety Academy',
    type: 'System',
    icon: 'UserCheck',
    url: 'https://script.google.com/macros/s/AKfycbzcHDxEh8ONZaL4xs0LBTzf_89rO6pKjYI85SW2NRWpMr12CiwdJSgqs9Ezwywl2Vx5/exec',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    category: 'Health & People',
    formatNumber: 'SBL/EHS/LMS-16',
    revNumber: 'Rev 03',
    revDate: '26-Oct-2026',
    badge: '54 Courses'
  },
  {
    id: 'first-aid-inspection',
    name: 'First Aid Box & OHC Inspection',
    type: 'Report',
    icon: 'Package',
    url: 'https://script.google.com/macros/s/AKfycbw3ywxLCIzbr6ZQV9gDgn386zqYQ-IjZggbFtNLEJ7Y8vX1DTyQYSVfZSAzvJUmFV3I/exec',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    category: 'Health & People',
    formatNumber: 'SBL/EHS/OHC-12',
    revNumber: 'Rev 01',
    revDate: '19-Oct-2026',
    badge: 'Medical Kit'
  },
  {
    id: 'mock-drill',
    name: 'Mock Drill & Evacuation Simulation',
    type: 'Report',
    icon: 'Megaphone',
    url: 'https://script.google.com/macros/s/AKfycbxRKrzdOjyEjcCKcQuTFiOKYR4bsddwgvda5upr1RcR9oWWzbsZBE8k_afsK1-Az_Qk/exec',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/30',
    category: 'Health & People',
    formatNumber: 'SBL/EHS/DRL-18',
    revNumber: 'Rev 02',
    revDate: '18-Oct-2026',
    badge: '142s Drill'
  },
  {
    id: 'safety-committee',
    name: 'Safety Committee Minutes (MoM)',
    type: 'Governance',
    icon: 'Sparkles',
    url: 'https://script.google.com/macros/s/AKfycbwJYXDM7uNZWBQm0i4ZK3EYNQhvfkWrlI-VHoK_RETs0P0-k2YfrGqllWx6uckhfxo/exec',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    category: 'Health & People',
    formatNumber: 'SBL/EHS/SCM-20',
    revNumber: 'Rev 02',
    revDate: '24-Oct-2026',
    badge: 'Joint Committee'
  },

  // 6. Environment & Assets
  {
    id: 'industrial-hygiene',
    name: 'ESG & Environmental Monitoring',
    type: 'Dashboard',
    icon: 'Microscope',
    url: 'https://script.google.com/macros/s/AKfycbyMDMFQT-wYVjoC99T_-cUPKgcY4AxCFDQXoQjewbvMUPA6_uxuUeEcIDdHblNkRFlI/exec',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    category: 'Environment & Assets',
    formatNumber: 'SBL/EHS/ESG-06',
    revNumber: 'Rev 02',
    revDate: '09-Nov-2026',
    badge: 'Scope 1,2,3'
  },
  {
    id: 'ehs-sops',
    name: 'Controlled SOP & Drawing Library',
    type: 'Library',
    icon: 'BookOpen',
    url: 'https://drive.google.com/drive/folders/1CZXyeR1qHhGqPfzlaQAomfCPb1L-YVfh?usp=sharing',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    category: 'Environment & Assets',
    formatNumber: 'SBL/EHS/DOC-21',
    revNumber: 'Rev 04',
    revDate: '11-Oct-2026',
    badge: 'Cloud SOPs'
  },
  {
    id: 'vehicle-safety',
    name: 'Contractor & Vehicle Registry',
    type: 'Form',
    icon: 'Truck',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSe60s3RozeSa6lH-nESizNf3J_od-lqEca4jwJZIAjMmkPiPg/viewform',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    category: 'Environment & Assets',
    formatNumber: 'SBL/EHS/VEH-25',
    revNumber: 'Rev 02',
    revDate: '15-Oct-2026',
    badge: 'Gate Pass'
  }
];

export class TelemetryService {
  private static STORAGE_KEY = 'SBL_EHS_TELEMETRY_V10_AUTHENTIC_LIVE_DATA';

  public static calculateRisk(telemetry: MasterTelemetry): {
    score: number;
    baseRisk: number;
    penaltyPTW: number;
    penaltyCAPA: number;
    penaltyLMS: number;
    status: 'Optimal' | 'Elevated' | 'Critical';
  } {
    const baseRisk = 10;
    const ptwHighRisk = telemetry.metrics?.ptw?.highRisk || 0;
    const penaltyPTW = Math.min(ptwHighRisk * 8, 25);

    const capaCount = telemetry.metrics?.incidents?.totalActive || 0;
    let penaltyCAPA = 0;
    if (capaCount > 0 && capaCount <= 5) {
      penaltyCAPA = capaCount * 5;
    } else if (capaCount > 5 && capaCount <= 20) {
      penaltyCAPA = 25 + (capaCount - 5) * 1.5;
    } else if (capaCount > 20) {
      penaltyCAPA = 50;
    }
    penaltyCAPA = Math.floor(penaltyCAPA);

    const compliance = telemetry.metrics?.lms?.compliance ?? 100;
    // LMS Penalty: Binary 15 pts exactly as defined in SBL Apps Script engine
    const penaltyLMS = compliance < 100 ? 15 : 0;

    let score = baseRisk + penaltyPTW + penaltyCAPA + penaltyLMS;
    if (score > 100) score = 100;

    let status: 'Optimal' | 'Elevated' | 'Critical' = 'Optimal';
    if (score >= 70) status = 'Critical';
    else if (score >= 30) status = 'Elevated';

    return { score, baseRisk, penaltyPTW, penaltyCAPA, penaltyLMS, status };
  }

  public static getTelemetry(): MasterTelemetry {
    try {
      // Clear out any obsolete storage keys that held dummy 12-permit data
      const oldKeys = [
        'SBL_EHS_TELEMETRY_V7_SYNCED_ALL_MODULES',
        'SBL_EHS_TELEMETRY_WEB_EXACT_V1',
        'SBL_EHS_TELEMETRY_V5_LIVE_DASHBOARDS',
        'SBL_EHS_TELEMETRY_DATA',
        'SBL_EHS_TELEMETRY_V4_REAL_DOCX'
      ];
      oldKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch (_) {}
      });

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.metrics?.ptw) {
          const { score } = this.calculateRisk(parsed);
          parsed.globalRiskScore = score;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Using initial telemetry due to parse error:', e);
    }
    const initial = JSON.parse(JSON.stringify(INITIAL_TELEMETRY));
    const { score } = this.calculateRisk(initial);
    initial.globalRiskScore = score;
    this.saveTelemetry(initial);
    return initial;
  }

  public static saveTelemetry(telemetry: MasterTelemetry): void {
    const { score } = this.calculateRisk(telemetry);
    telemetry.globalRiskScore = score;
    telemetry.lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(telemetry));
    } catch (e) {
      console.error('Failed to save telemetry to localStorage', e);
    }
  }

  public static addObservation(
    payloadOrType: LogHazardPayload | 'condition' | 'act' | 'nearMiss',
    description?: string,
    area?: string,
    capa?: string
  ): MasterTelemetry {
    let payload: LogHazardPayload;

    if (typeof payloadOrType === 'object') {
      payload = payloadOrType;
    } else {
      payload = {
        observerInfo: 'Budhi Parkash (EHS)',
        observationType: payloadOrType === 'condition' ? 'Unsafe Condition (UC) / असुरक्षित स्थिति' :
                         payloadOrType === 'act' ? 'Unsafe Act (UA) / असुरक्षित कार्य' : 'Near Miss (NM) / नज़दीकी चूक',
        dateTime: new Date().toISOString().slice(0, 16),
        location: area || 'Shopfloor',
        potentialSeverity: 'Medium / मध्यम',
        hazardDescription: description || 'Hazard observed on floor',
        immediateAction: capa || 'Immediate containment initiated',
        observerSuggestion: '',
        concernedDepartment: 'EHS',
        attachmentLink: 'N/A'
      };
    }

    const data = this.getTelemetry();
    data.metrics.incidents.totalActive += 1;

    if (/condition/i.test(payload.observationType)) {
      if (data.metrics.incidents.breakdown[0]) data.metrics.incidents.breakdown[0].count += 1;
    } else if (/act/i.test(payload.observationType)) {
      if (data.metrics.incidents.breakdown[1]) data.metrics.incidents.breakdown[1].count += 1;
    } else {
      if (data.metrics.incidents.breakdown[2]) data.metrics.incidents.breakdown[2].count += 1;
    }

    // Call SblLiveSyncService to create record and queue background sync
    const reportSeq = 556 + Math.max(0, SBL_REAL_UAC_LOG.filter(r => r.id.startsWith('SA/2026/')).length - 28);
    const reportId = `SA/2026/${String(reportSeq).padStart(5, '0')}`;

    SblLiveSyncService.submitObservationToSheet({
      ...payload,
      reportId
    } as any);

    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (/high|उच्च|crit/i.test(payload.potentialSeverity)) priority = 'HIGH';
    else if (/low|कम/i.test(payload.potentialSeverity)) priority = 'LOW';

    const newHazard: CriticalHazard = {
      id: reportId,
      source: 'Safety Alert Log',
      desc: `${payload.hazardDescription} [${payload.location}]`,
      capa: payload.immediateAction || 'Assigned to Area Lead for immediate corrective action.',
      assignedTo: `${payload.concernedDepartment} Dept`,
      dueDate: 'Today',
      priority
    };
    data.criticalHazards.unshift(newHazard);

    this.saveTelemetry(data);
    return data;
  }

  public static resolveHazard(hazardId: string): MasterTelemetry {
    const data = this.getTelemetry();
    data.criticalHazards = data.criticalHazards.filter(h => h.id !== hazardId);
    if (data.metrics.incidents.totalActive > 0) {
      data.metrics.incidents.totalActive -= 1;
    }
    this.saveTelemetry(data);
    return data;
  }

  public static async syncWithLiveCloud(): Promise<MasterTelemetry> {
    const result = await SblLiveSyncService.syncMasterTelemetry();
    const data = this.getTelemetry();
    if (result.success && result.telemetry) {
      if (result.telemetry.metrics) {
        data.metrics = result.telemetry.metrics as any;
      }
      if (result.criticalHazards && result.criticalHazards.length > 0) {
        data.criticalHazards = result.criticalHazards;
      }
      if (result.telemetry.lastUpdated) {
        data.lastUpdated = result.telemetry.lastUpdated;
      }
      const { score } = this.calculateRisk(data);
      data.globalRiskScore = score;
      this.saveTelemetry(data);
    }
    return data;
  }

  public static resetToDefault(): MasterTelemetry {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.getTelemetry();
  }
}
