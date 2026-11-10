export interface MetricBreakdown {
  label: string;
  count: number;
  color?: string;
  bg?: string;
}

export interface PTWMetrics {
  total: number;
  highRisk: number;
  today?: number;
  yesterday: {
    total: number;
    hot: number;
    confined: number;
    height: number;
    cold: number;
  };
  pending?: number;
  rejected?: number;
  mtd?: number;
  ytd?: number;
  activeRequests?: number;
  breakdown: MetricBreakdown[];
}

export interface KaizenMetrics {
  total: number;
  pending: number;
  pendingHod?: number;
  pendingAssessor?: number;
  completed?: number;
  totalSystemScore?: number;
  trend?: string;
  breakdown: MetricBreakdown[];
}

export interface LMSMetrics {
  compliance: number;
  breakdown: MetricBreakdown[];
}

export interface IncidentsMetrics {
  totalActive: number;
  breakdown: MetricBreakdown[];
  yesterday: {
    total: number;
    act: number;
    condition: number;
    nearMiss: number;
  };
}

export interface CriticalHazard {
  id: string;
  source: string;
  desc: string;
  capa: string;
  assignedTo: string;
  dueDate: string;
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
}

export interface ComplianceMatrixItem {
  closed: number;
  wip: number;
  open: number;
  total: number;
  breakdown: Record<string, number>;
}

export interface WorkspaceLink {
  id: string;
  name: string;
  type: string;
  icon: string;
  url: string;
  color: string;
  bg: string;
  border: string;
  category: string;
  formatNumber?: string;
  revNumber?: string;
  revDate?: string;
  badge?: string;
}

export interface EnvironmentalTelemetry {
  power: {
    gridKWh: number;
    gridChange: number;
    dg750Liters: number;
    dg750Change: number;
    dg400Liters: number;
    dg400Change: number;
  };
  fluids: {
    freshWaterKL: number;
    etpDischargeKL: number;
  };
  voc: {
    value: number; // in mg/m3
    status: 'Safe' | 'Elevated' | 'Warning';
  };
  waste: {
    usedOilLiters: number;
    wastePaintKg: number;
    drumsCount: number;
    etpSludgeKg: number;
  };
}

export interface MasterTelemetry {
  globalRiskScore: number;
  metrics: {
    ptw: PTWMetrics;
    kaizen: KaizenMetrics;
    lms: LMSMetrics;
    incidents: IncidentsMetrics;
  };
  complianceMatrix: Record<string, ComplianceMatrixItem>;
  criticalHazards: CriticalHazard[];
  environmental: EnvironmentalTelemetry;
  lastUpdated: string;
}

export interface UserProfile {
  employeeCode: string;
  name: string;
  role: string;
  department?: string;
  designation?: string;
  facility: string;
  isAuthenticated: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'JARVIS';
  text: string;
  timestamp: string;
}
