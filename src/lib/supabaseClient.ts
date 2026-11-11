// ==============================================================================
// UNIVERSAL MULTI-TENANT SUPABASE & DATA CLIENT
// Single Source of Truth for Web, iOS, & Android
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import masterData from './sbl_master_data.json';
import {
  Company,
  Facility,
  TelemetrySnapshot,
  PtwPermit,
  MocRecord,
  PssrReview,
  CapaAction,
  HazopStudy,
  EsgMetric,
  SafetyObservation,
  FiveSAudit,
  FpsAsset,
  KaizenProposal,
  LmsCourse,
  MachineRegistry,
  StatutoryCompliance,
  MockDrill,
  OhcRecord
} from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-ehs-tenant.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-enterprise-v1';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// In-memory / persistent multi-tenant cache initialized from migrated backlog
let localStore = { ...masterData };

export class UniversalEhsApi {
  private static companyId = '00000000-0000-0000-0000-000000000001';

  public static setCompanyId(id: string) {
    this.companyId = id;
  }

  public static getCompanyId(): string {
    return this.companyId;
  }

  public static getTenant(): Company {
    const list = localStore.companies as any[];
    return list.find(c => c.id === this.companyId) || list[0];
  }

  public static getCompanies(): Company[] {
    return localStore.companies as any[];
  }

  public static getFacilities(companyId = this.companyId): Facility[] {
    return (localStore.facilities as any[]).filter(f => f.company_id === companyId);
  }

  public static getTelemetry(companyId = this.companyId): TelemetrySnapshot {
    const list = (localStore.ehs_telemetry_snapshots as any[]).filter(s => s.company_id === companyId);
    return list[list.length - 1] || (localStore.ehs_telemetry_snapshots as any[])[0];
  }

  public static getPtwPermits(companyId = this.companyId): PtwPermit[] {
    return (localStore.ptw_permits as any[]).filter(p => p.company_id === companyId);
  }

  public static getMocRecords(companyId = this.companyId): MocRecord[] {
    return (localStore.moc_records as any[]).filter(m => m.company_id === companyId);
  }

  public static getPssrReviews(companyId = this.companyId): PssrReview[] {
    return (localStore.pssr_reviews as any[]).filter(p => p.company_id === companyId);
  }

  public static getCapaActions(companyId = this.companyId): CapaAction[] {
    return (localStore.capa_actions as any[]).filter(c => c.company_id === companyId);
  }

  public static getHazopStudies(companyId = this.companyId): HazopStudy[] {
    return (localStore.hazop_studies as any[]).filter(h => h.company_id === companyId);
  }

  public static getEsgMetrics(companyId = this.companyId): EsgMetric[] {
    return (localStore.esg_environmental_metrics as any[]).filter(e => e.company_id === companyId);
  }

  public static getSafetyObservations(companyId = this.companyId): SafetyObservation[] {
    return (localStore.safety_observations as any[]).filter(o => o.company_id === companyId);
  }

  public static getFiveSAudits(companyId = this.companyId): FiveSAudit[] {
    return (localStore.five_s_audits as any[]).filter(a => a.company_id === companyId);
  }

  public static getFpsAssets(companyId = this.companyId): FpsAsset[] {
    return (localStore.fps_assets as any[]).filter(a => a.company_id === companyId);
  }

  public static getKaizenProposals(companyId = this.companyId): KaizenProposal[] {
    return (localStore.kaizen_proposals as any[]).filter(k => k.company_id === companyId);
  }

  public static getLmsCourses(companyId = this.companyId): LmsCourse[] {
    return (localStore.lms_courses as any[]).filter(c => c.company_id === companyId);
  }

  public static getEquipment(companyId = this.companyId): MachineRegistry[] {
    return (localStore.equipment_registry as any[]).filter(e => e.company_id === companyId);
  }

  public static getStatutoryCompliances(companyId = this.companyId): StatutoryCompliance[] {
    return (localStore.statutory_compliances as any[]).filter(s => s.company_id === companyId);
  }

  public static getMockDrills(companyId = this.companyId): MockDrill[] {
    return (localStore.mock_drills as any[]).filter(d => d.company_id === companyId);
  }

  public static getOhcRecords(companyId = this.companyId): OhcRecord[] {
    return (localStore.ohc_medical_records as any[]).filter(o => o.company_id === companyId);
  }

  public static createRecord<T extends { id?: string }>(tableName: string, record: T): T {
    const fullRecord: any = {
      id: record.id || `REC-${Date.now()}`,
      company_id: this.companyId,
      created_at: new Date().toISOString(),
      ...record
    };

    if ((localStore as any)[tableName]) {
      (localStore as any)[tableName].unshift(fullRecord);
    }
    return fullRecord;
  }
}
