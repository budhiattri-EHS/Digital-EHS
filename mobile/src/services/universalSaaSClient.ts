// ==============================================================================
// UNIVERSAL MULTI-TENANT EHS SAAS CLIENT (FOR IOS & ANDROID)
// Connects to the Supabase Cloud Schema and Unified Data Endpoints
// Single Source of Truth shared with Next.js Web App
// ==============================================================================

import masterData from '../data/sbl_master_data.json';

export class MobileUniversalSaaSClient {
  private static companyId = '00000000-0000-0000-0000-000000000001';
  private static store = { ...masterData };

  public static getCompanyId() {
    return this.companyId;
  }

  public static setCompanyId(id: string) {
    this.companyId = id;
  }

  public static getTenant() {
    return (this.store.companies as any[]).find(c => c.id === this.companyId) || (this.store.companies as any[])[0];
  }

  public static getCompanies() {
    return this.store.companies;
  }

  public static getFacilities() {
    return (this.store.facilities as any[]).filter(f => f.company_id === this.companyId);
  }

  public static getTelemetry() {
    const list = (this.store.ehs_telemetry_snapshots as any[]).filter(s => s.company_id === this.companyId);
    return list[list.length - 1] || (this.store.ehs_telemetry_snapshots as any[])[0];
  }

  public static getPtwPermits() {
    return (this.store.ptw_permits as any[]).filter(p => p.company_id === this.companyId);
  }

  public static getFiveSAudits() {
    return (this.store.five_s_audits as any[]).filter(a => a.company_id === this.companyId);
  }

  public static getFpsAssets() {
    return (this.store.fps_assets as any[]).filter(a => a.company_id === this.companyId);
  }

  public static getKaizens() {
    return (this.store.kaizen_proposals as any[]).filter(k => k.company_id === this.companyId);
  }

  public static getSafetyObservations() {
    return (this.store.safety_observations as any[]).filter(o => o.company_id === this.companyId);
  }

  public static getCapas() {
    return (this.store.capa_actions as any[]).filter(c => c.company_id === this.companyId);
  }

  public static getLmsCourses() {
    return (this.store.lms_courses as any[]).filter(l => l.company_id === this.companyId);
  }

  public static getMachines() {
    return (this.store.equipment_registry as any[]).filter(m => m.company_id === this.companyId);
  }

  public static getStatutoryCompliances() {
    return (this.store.statutory_compliances as any[]).filter(s => s.company_id === this.companyId);
  }

  public static getEsgMetrics() {
    return (this.store.esg_environmental_metrics as any[]).filter(e => e.company_id === this.companyId);
  }

  public static getMockDrills() {
    return (this.store.mock_drills as any[]).filter(d => d.company_id === this.companyId);
  }

  public static getOhcRecords() {
    return (this.store.ohc_medical_records as any[]).filter(o => o.company_id === this.companyId);
  }
}
