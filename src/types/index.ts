// ==============================================================================
// ENTERPRISE EHS SAAS PLATFORM - UNIVERSAL TYPES (ALL 24 MODULES)
// ==============================================================================

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  subscription_tier: string;
  logo_url: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  is_active: boolean;
}

export interface Facility {
  id: string;
  company_id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  country: string;
  is_primary: boolean;
}

export interface User {
  id: string;
  company_id: string;
  facility_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  role: 'SuperAdmin' | 'PlantHead' | 'HOD' | 'EHSManager' | 'Auditor' | 'Supervisor' | 'Operator';
  avatar_url?: string;
  is_active: boolean;
}

export interface TelemetrySnapshot {
  id: string;
  company_id: string;
  facility_id: string;
  snapshot_timestamp: string;
  global_risk_score: number;
  risk_status: 'Optimal' | 'Elevated' | 'Critical';
  active_permits_count: number;
  high_risk_permits_count: number;
  open_capa_count: number;
  open_incidents_count: number;
  lms_compliance_pct: number;
  environmental_score: number;
  metrics_payload: Record<string, any>;
}

export interface PtwPermit {
  id: string;
  company_id: string;
  facility_id: string;
  permit_number: string;
  permit_type: 'Hot Work' | 'Work at Height' | 'Confined Space' | 'Electrical Work' | 'General / Cold Work' | 'Excavation';
  title: string;
  location: string;
  equipment_code?: string;
  valid_from: string;
  valid_to: string;
  status: 'Draft' | 'Pending HOD' | 'Approved' | 'Active' | 'Suspended' | 'Closed' | 'Rejected';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  loto_required: boolean;
  hazards_identified: string[];
  precautions_checklist: string[];
  report_pdf_url?: string;
}

export interface MocRecord {
  id: string;
  company_id: string;
  facility_id: string;
  moc_number: string;
  title: string;
  change_type: 'Permanent' | 'Temporary' | 'Emergency' | 'Replacement In Kind';
  category: 'Process' | 'Equipment' | 'Piping' | 'Electrical' | 'Personnel';
  description: string;
  justification: string;
  risk_level: 'Low' | 'Medium' | 'High';
  status: 'Initiated' | 'Technical Review' | 'HOD Review' | 'Approved' | 'In Implementation' | 'Pre-Commissioning' | 'Closed';
  pssr_required: boolean;
  target_completion_date: string;
}

export interface PssrReview {
  id: string;
  company_id: string;
  facility_id: string;
  pssr_number: string;
  title: string;
  equipment_name: string;
  plant_area: string;
  status: 'Pending Review' | 'Under Review' | 'Punch Items Open' | 'Approved for Startup' | 'Rejected';
}

export interface CapaAction {
  id: string;
  company_id: string;
  facility_id: string;
  capa_number: string;
  source_type: string;
  source_reference_id?: string;
  title: string;
  problem_statement: string;
  action_type: 'Corrective' | 'Preventive' | 'Containment';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department: string;
  due_date: string;
  status: 'Open' | 'WIP' | 'Pending Verification' | 'Closed' | 'Overdue';
}

export interface HazopStudy {
  id: string;
  company_id: string;
  facility_id: string;
  study_number: string;
  title: string;
  process_unit: string;
  status: 'Draft' | 'In Session' | 'Recommendations Open' | 'Completed' | 'Approved';
}

export interface EsgMetric {
  id: string;
  company_id: string;
  facility_id: string;
  record_date: string;
  scope1_dg_liters: number;
  scope1_emissions_mt: number;
  scope2_grid_kwh: number;
  scope2_emissions_mt: number;
  scope3_logistics_mt: number;
  freshwater_consumption_kl: number;
  etp_discharge_kl: number;
  voc_level_ppm: number;
  hazardous_waste_paint_kg: number;
  used_oil_liters: number;
  etp_sludge_kg: number;
  drums_disposed_count: number;
}

export interface SafetyObservation {
  id: string;
  company_id: string;
  facility_id: string;
  observation_number: string;
  observation_type: 'Unsafe Condition' | 'Unsafe Act' | 'Near Miss';
  date_time: string;
  location: string;
  concerned_department: string;
  potential_severity: 'Low' | 'Medium' | 'High' | 'Critical';
  hazard_description: string;
  immediate_action: string;
  suggested_capa?: string;
  observer_name: string;
  status: 'Logged' | 'In Progress' | 'CAPA Assigned' | 'Closed';
}

export interface FiveSAudit {
  id: string;
  company_id: string;
  facility_id: string;
  audit_number: string;
  audit_date: string;
  audit_time: string;
  league: 'Operations League' | 'Labs League';
  department: string;
  sort_score: number;
  set_score: number;
  shine_score: number;
  standard_score: number;
  sustain_score: number;
  total_score: number;
  auditor_name: string;
  auditee_name: string;
  remarks: string;
  report_pdf_url?: string;
}

export interface FpsAsset {
  id: string;
  company_id: string;
  facility_id: string;
  asset_tag: string;
  asset_type: string;
  location: string;
  zone: string;
  capacity?: string;
  last_inspection_date?: string;
  hydro_test_date?: string;
  refilling_due_date?: string;
  status: 'Operable' | 'Needs Maintenance' | 'Discharged' | 'Missing';
  qr_code_token?: string;
}

export interface KaizenProposal {
  id: string;
  company_id: string;
  facility_id: string;
  kaizen_number: string;
  title: string;
  submitter_name: string;
  submitter_employee_code: string;
  department: string;
  problem_statement: string;
  solution_implemented: string;
  benefit_type: 'Safety' | 'Quality' | 'Productivity' | 'Cost' | 'Delivery' | 'Morale' | 'Environment';
  total_score: number;
  status: 'Submitted' | 'HOD Approved' | 'Assessor Verified' | 'Completed' | 'Rejected';
  reward_points: number;
}

export interface LmsCourse {
  id: string;
  company_id: string;
  course_code: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  video_url: string;
  passing_score_pct: number;
  is_mandatory: boolean;
}

export interface MachineRegistry {
  id: string;
  company_id: string;
  facility_id: string;
  machine_code: string;
  name: string;
  category: string;
  location: string;
  capacity?: string;
  make?: string;
  status: 'In Service' | 'Under Maintenance' | 'Decommissioned';
  last_inspected_date?: string;
}

export interface StatutoryCompliance {
  id: string;
  company_id: string;
  facility_id: string;
  act_name: string;
  license_name: string;
  reference_number: string;
  issuing_authority: string;
  valid_from: string;
  valid_to: string;
  renewal_window_days: number;
  status: 'Valid' | 'Renewal in Progress' | 'Expired' | 'Submitted';
  remarks?: string;
}

export interface MockDrill {
  id: string;
  company_id: string;
  facility_id: string;
  drill_number: string;
  drill_type: string;
  drill_date: string;
  scenario_description: string;
  evacuation_time_seconds: number;
  target_time_seconds: number;
  total_participants: number;
  headcount_verified: boolean;
  drill_commander_name: string;
}

export interface OhcRecord {
  id: string;
  company_id: string;
  facility_id: string;
  record_number: string;
  patient_name: string;
  employee_code: string;
  chief_complaint: string;
  diagnosis: string;
  treatment_given: string;
  first_aid_administered: boolean;
  fitness_status: string;
  attending_staff_name: string;
}

export interface ModuleDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  category: 'Core Operations' | 'Incident & Quality' | 'Audits & Standards' | 'Risk & Process Safety' | 'Health & People' | 'Environment & Assets';
  formatNumber: string;
  revNumber: string;
  revDate: string;
  badge: string;
}
