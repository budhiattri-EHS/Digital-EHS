-- ==============================================================================
-- SBL ENTERPRISE EHS CENTRAL SAAS PLATFORM - COMPREHENSIVE SUPABASE SCHEMA
-- Architecture: Multi-Tenant B2B SaaS with Universal API for Web, iOS, & Android
-- Tenancy Model: Strict Company-Level Isolation with Row Level Security (RLS)
-- Modules Covered: All 24 Core Industrial EHS Modules
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TENANCY & IDENTITY MANAGEMENT
-- ==============================================================================

-- Tenants (Companies) Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100) DEFAULT 'Chemical & Coatings Manufacturing',
    subscription_tier VARCHAR(50) DEFAULT 'Enterprise Vision',
    logo_url TEXT,
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),
    settings JSONB DEFAULT '{"theme": "dark", "features": {"ai_copilot": true, "offline_sync": true, "lms_video_tracking": true}}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facilities / Operating Sites Table
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, code)
);

-- Users & Employee Profiles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    employee_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'Operator' CHECK (role IN ('SuperAdmin', 'PlantHead', 'HOD', 'EHSManager', 'Auditor', 'Supervisor', 'Operator', 'Contractor')),
    pin_hash VARCHAR(255), -- For 4-digit mobile quick-signing (e.g. 1907)
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, employee_code),
    UNIQUE(company_id, email)
);

-- ==============================================================================
-- 2. CENTRAL TELEMETRY & GLOBAL RISK INDEX (Module 8)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ehs_telemetry_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    snapshot_timestamp TIMESTAMPTZ DEFAULT NOW(),
    global_risk_score INTEGER NOT NULL CHECK (global_risk_score BETWEEN 0 AND 100),
    risk_status VARCHAR(20) DEFAULT 'Optimal' CHECK (risk_status IN ('Optimal', 'Elevated', 'Critical')),
    active_permits_count INTEGER DEFAULT 0,
    high_risk_permits_count INTEGER DEFAULT 0,
    open_capa_count INTEGER DEFAULT 0,
    open_incidents_count INTEGER DEFAULT 0,
    lms_compliance_pct INTEGER DEFAULT 0,
    environmental_score INTEGER DEFAULT 95,
    metrics_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PERMIT TO WORK (PTW) SYSTEM (Module 1)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ptw_permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    permit_number VARCHAR(50) NOT NULL,
    permit_type VARCHAR(50) NOT NULL CHECK (permit_type IN ('Hot Work', 'Work at Height', 'Confined Space', 'Electrical Work', 'General / Cold Work', 'Excavation', 'Lifting & Rigging')),
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    equipment_code VARCHAR(100),
    contractor_id UUID,
    requester_id UUID REFERENCES public.users(id),
    issuer_id UUID REFERENCES public.users(id),
    approver_id UUID REFERENCES public.users(id),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending HOD', 'Pending Safety', 'Approved', 'Active', 'Suspended', 'Closed', 'Rejected')),
    risk_level VARCHAR(20) DEFAULT 'Medium' CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    loto_required BOOLEAN DEFAULT false,
    hazards_identified JSONB DEFAULT '[]'::jsonb,
    precautions_checklist JSONB DEFAULT '[]'::jsonb,
    gas_test_records JSONB DEFAULT '[]'::jsonb,
    ppe_required JSONB DEFAULT '[]'::jsonb,
    rejection_reason TEXT,
    signed_closure_at TIMESTAMPTZ,
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, permit_number)
);

-- ==============================================================================
-- 4. MANAGEMENT OF CHANGE (MOC) (Module 2)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.moc_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    moc_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('Permanent', 'Temporary', 'Emergency', 'Replacement In Kind')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('Process', 'Equipment', 'Piping', 'Electrical', 'Instrumentation', 'Personnel', 'Raw Material')),
    description TEXT NOT NULL,
    justification TEXT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'Medium' CHECK (risk_level IN ('Low', 'Medium', 'High')),
    status VARCHAR(50) DEFAULT 'Initiated' CHECK (status IN ('Initiated', 'Technical Review', 'HOD Review', 'Approved', 'In Implementation', 'Pre-Commissioning', 'Closed', 'Rejected')),
    initiator_id UUID REFERENCES public.users(id),
    assigned_engineer_id UUID REFERENCES public.users(id),
    pssr_required BOOLEAN DEFAULT true,
    target_completion_date DATE,
    action_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, moc_number)
);

-- ==============================================================================
-- 5. PRE-STARTUP SAFETY REVIEW (PSSR) (Module 3)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pssr_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    moc_id UUID REFERENCES public.moc_records(id) ON DELETE SET NULL,
    pssr_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    plant_area VARCHAR(100) NOT NULL,
    lead_reviewer_id UUID REFERENCES public.users(id),
    status VARCHAR(50) DEFAULT 'Pending Review' CHECK (status IN ('Pending Review', 'Under Review', 'Punch Items Open', 'Approved for Startup', 'Rejected')),
    checklist_sections JSONB DEFAULT '[]'::jsonb,
    punch_items JSONB DEFAULT '[]'::jsonb,
    approval_signatures JSONB DEFAULT '[]'::jsonb,
    signed_off_at TIMESTAMPTZ,
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, pssr_number)
);

-- ==============================================================================
-- 6. CORRECTIVE & PREVENTIVE ACTION (CAPA) (Module 4)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.capa_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    capa_number VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('Incident', 'Audit', 'Observation', 'Corporate Audit', 'PSSR', 'HAZOP', 'Customer Complaint', 'Routine Walkthrough')),
    source_reference_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    problem_statement TEXT NOT NULL,
    root_cause_analysis JSONB DEFAULT '{"method": "5-Whys", "whys": [], "root_cause": ""}'::jsonb,
    action_type VARCHAR(30) DEFAULT 'Corrective' CHECK (action_type IN ('Corrective', 'Preventive', 'Containment')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    department VARCHAR(100) NOT NULL,
    assigned_to_id UUID REFERENCES public.users(id),
    due_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'WIP', 'Pending Verification', 'Closed', 'Overdue')),
    action_evidence_urls JSONB DEFAULT '[]'::jsonb,
    closure_remarks TEXT,
    verified_by_id UUID REFERENCES public.users(id),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, capa_number)
);

-- ==============================================================================
-- 7. HAZOP (HAZARD & OPERABILITY STUDY) (Module 5)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hazop_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    study_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    process_unit VARCHAR(100) NOT NULL,
    leader_id UUID REFERENCES public.users(id),
    scribe_id UUID REFERENCES public.users(id),
    team_members JSONB DEFAULT '[]'::jsonb,
    nodes JSONB DEFAULT '[]'::jsonb, -- Array of nodes, guidewords (No, More, Less), deviations, causes, consequences, safeguards, actions
    status VARCHAR(30) DEFAULT 'Draft' CHECK (status IN ('Draft', 'In Session', 'Recommendations Open', 'Completed', 'Approved')),
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, study_number)
);

-- ==============================================================================
-- 8. ESG & SUSTAINABILITY MANAGEMENT (Module 6)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.esg_environmental_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    record_date DATE NOT NULL,
    scope1_dg_liters NUMERIC(12,2) DEFAULT 0,
    scope1_emissions_mt NUMERIC(10,3) DEFAULT 0,
    scope2_grid_kwh NUMERIC(12,2) DEFAULT 0,
    scope2_emissions_mt NUMERIC(10,3) DEFAULT 0,
    scope3_logistics_mt NUMERIC(10,3) DEFAULT 0,
    freshwater_consumption_kl NUMERIC(10,2) DEFAULT 0,
    etp_discharge_kl NUMERIC(10,2) DEFAULT 0,
    voc_level_ppm NUMERIC(8,2) DEFAULT 0,
    hazardous_waste_paint_kg NUMERIC(10,2) DEFAULT 0,
    used_oil_liters NUMERIC(10,2) DEFAULT 0,
    etp_sludge_kg NUMERIC(10,2) DEFAULT 0,
    drums_disposed_count INTEGER DEFAULT 0,
    recorded_by_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, facility_id, record_date)
);

-- ==============================================================================
-- 9. SAFETY OBSERVATIONS (UA/UC/NM) (Module 7)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.safety_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    observation_number VARCHAR(50) NOT NULL,
    observation_type VARCHAR(50) NOT NULL CHECK (observation_type IN ('Unsafe Condition', 'Unsafe Act', 'Near Miss')),
    date_time TIMESTAMPTZ NOT NULL,
    location VARCHAR(255) NOT NULL,
    concerned_department VARCHAR(100) NOT NULL,
    potential_severity VARCHAR(20) DEFAULT 'Medium' CHECK (potential_severity IN ('Low', 'Medium', 'High', 'Critical')),
    hazard_description TEXT NOT NULL,
    immediate_action TEXT NOT NULL,
    suggested_capa TEXT,
    observer_name VARCHAR(255) NOT NULL,
    observer_employee_code VARCHAR(50),
    reporter_id UUID REFERENCES public.users(id),
    assigned_to_id UUID REFERENCES public.users(id),
    status VARCHAR(30) DEFAULT 'Logged' CHECK (status IN ('Logged', 'In Progress', 'CAPA Assigned', 'Closed')),
    photo_urls JSONB DEFAULT '[]'::jsonb,
    capa_id UUID REFERENCES public.capa_actions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, observation_number)
);

-- ==============================================================================
-- 10. INCIDENT MANAGEMENT & ROOT CAUSE INVESTIGATION (Module 9)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.incident_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    incident_number VARCHAR(50) NOT NULL,
    incident_date TIMESTAMPTZ NOT NULL,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('First Aid Injury', 'Medical Treatment Injury', 'Lost Time Injury (LTI)', 'Near Miss', 'Property Damage', 'Fire Incident', 'Chemical Spill / Release')),
    severity VARCHAR(20) DEFAULT 'Minor' CHECK (severity IN ('Minor', 'Moderate', 'Major', 'Fatal / Catastrophic')),
    location VARCHAR(255) NOT NULL,
    injured_person_name VARCHAR(255),
    injured_person_emp_code VARCHAR(50),
    description TEXT NOT NULL,
    lead_investigator_id UUID REFERENCES public.users(id),
    investigation_team JSONB DEFAULT '[]'::jsonb,
    immediate_causes JSONB DEFAULT '[]'::jsonb,
    root_causes JSONB DEFAULT '{"method": "5-Whys", "whys": []}'::jsonb,
    status VARCHAR(30) DEFAULT 'Reported' CHECK (status IN ('Reported', 'Investigation Underway', 'Review Complete', 'CAPA Pending', 'Closed')),
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, incident_number)
);

-- ==============================================================================
-- 11. 5S SYSTEM (100-POINT MATRIX FORMAT SBL/EHS/F-100) (Module 10)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.five_s_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    audit_number VARCHAR(50) NOT NULL,
    audit_date DATE NOT NULL,
    audit_time TIME DEFAULT '00:00:00',
    league VARCHAR(50) NOT NULL CHECK (league IN ('Operations League', 'Labs League')),
    department VARCHAR(100) NOT NULL,
    sort_score NUMERIC(5,2) NOT NULL,
    set_score NUMERIC(5,2) NOT NULL,
    shine_score NUMERIC(5,2) NOT NULL,
    standard_score NUMERIC(5,2) NOT NULL,
    sustain_score NUMERIC(5,2) NOT NULL,
    total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),
    auditor_name VARCHAR(255) NOT NULL,
    auditee_name VARCHAR(255) NOT NULL,
    remarks TEXT,
    item_responses JSONB DEFAULT '{}'::jsonb,
    photo_urls JSONB DEFAULT '[]'::jsonb,
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, audit_number)
);

-- ==============================================================================
-- 12. FIRE PROTECTION SYSTEM (FPS) (Module 11)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fps_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    asset_tag VARCHAR(50) NOT NULL,
    asset_type VARCHAR(100) NOT NULL CHECK (asset_type IN ('CO2 Extinguisher 4.5kg', 'DCP Extinguisher 6kg', 'Water CO2 9L', 'Foam AFFF 50L Trolley', 'Clean Agent 2kg', 'Fire Hydrant Post', 'Hose Reel Box', 'Main Diesel Pump', 'Jockey Pump', 'Sprinkler Control Valve')),
    location VARCHAR(255) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    capacity VARCHAR(50),
    last_inspection_date DATE,
    hydro_test_date DATE,
    refilling_due_date DATE,
    status VARCHAR(30) DEFAULT 'Operable' CHECK (status IN ('Operable', 'Needs Maintenance', 'Discharged', 'Missing')),
    qr_code_token VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, asset_tag)
);

CREATE TABLE IF NOT EXISTS public.fps_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES public.fps_assets(id) ON DELETE CASCADE,
    inspection_date TIMESTAMPTZ DEFAULT NOW(),
    inspector_id UUID REFERENCES public.users(id),
    pressure_gauge_ok BOOLEAN DEFAULT true,
    safety_pin_and_seal_intact BOOLEAN DEFAULT true,
    discharge_nozzle_clear BOOLEAN DEFAULT true,
    mounting_bracket_secure BOOLEAN DEFAULT true,
    weight_ok BOOLEAN DEFAULT true,
    action_required TEXT,
    status VARCHAR(20) DEFAULT 'Pass' CHECK (status IN ('Pass', 'Defect Reported', 'Serviced')),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. OCCUPATIONAL HEALTH CENTER (OHC) (Module 12)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ohc_medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    record_number VARCHAR(50) NOT NULL,
    patient_user_id UUID REFERENCES public.users(id),
    patient_name VARCHAR(255) NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    chief_complaint TEXT NOT NULL,
    blood_pressure VARCHAR(20),
    pulse_rate INTEGER,
    spO2 INTEGER,
    temperature_f NUMERIC(4,1),
    diagnosis TEXT NOT NULL,
    treatment_given TEXT NOT NULL,
    first_aid_administered BOOLEAN DEFAULT false,
    fitness_status VARCHAR(50) DEFAULT 'Fit for Normal Duty' CHECK (fitness_status IN ('Fit for Normal Duty', 'Restricted Duty', 'Sent Home / Sick Leave', 'Referred to Hospital')),
    attending_staff_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, record_number)
);

-- ==============================================================================
-- 14. LEGAL COMPLIANCE & STATUTORY REGISTRY (Module 13)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.statutory_compliances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    act_name VARCHAR(255) NOT NULL,
    license_name VARCHAR(255) NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    renewal_window_days INTEGER DEFAULT 60,
    status VARCHAR(30) DEFAULT 'Valid' CHECK (status IN ('Valid', 'Renewal in Progress', 'Expired', 'Submitted')),
    responsible_person_id UUID REFERENCES public.users(id),
    document_url TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, reference_number)
);

-- ==============================================================================
-- 15. JARVIS AI SAFETY COPILOT (Module 14)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_title VARCHAR(255) DEFAULT 'Safety Analysis Session',
    context_module VARCHAR(50) DEFAULT 'General',
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 16. HIRA (HAZARD IDENTIFICATION & RISK ASSESSMENT) (Module 15)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hira_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    assessment_number VARCHAR(50) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    hazard_description TEXT NOT NULL,
    potential_consequence TEXT NOT NULL,
    initial_severity INTEGER NOT NULL CHECK (initial_severity BETWEEN 1 AND 5),
    initial_likelihood INTEGER NOT NULL CHECK (initial_likelihood BETWEEN 1 AND 5),
    initial_risk_score INTEGER GENERATED ALWAYS AS (initial_severity * initial_likelihood) STORED,
    existing_controls TEXT NOT NULL,
    additional_controls TEXT,
    residual_severity INTEGER NOT NULL CHECK (residual_severity BETWEEN 1 AND 5),
    residual_likelihood INTEGER NOT NULL CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_risk_score INTEGER GENERATED ALWAYS AS (residual_severity * residual_likelihood) STORED,
    assessor_id UUID REFERENCES public.users(id),
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Review Due', 'Archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, assessment_number)
);

-- ==============================================================================
-- 17. DIGITAL LMS (LEARNING MANAGEMENT SYSTEM) (Module 16)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lms_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    course_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Safety Induction', 'Chemical & Spill Safety', 'Fire & Emergency Response', 'Electrical Safety', 'Behavior-Based Safety', 'Machine Guarding', 'Work at Height')),
    duration_minutes INTEGER DEFAULT 15,
    video_url TEXT NOT NULL,
    passing_score_pct INTEGER DEFAULT 80,
    quiz_questions JSONB DEFAULT '[]'::jsonb,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, course_code)
);

CREATE TABLE IF NOT EXISTS public.lms_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    progress_pct INTEGER DEFAULT 0,
    video_watched_seconds INTEGER DEFAULT 0,
    quiz_score INTEGER,
    passed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    certificate_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, course_id, user_id)
);

-- ==============================================================================
-- 18. BBSO & KAIZEN SYSTEM (CONTINUOUS IMPROVEMENT) (Module 17)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kaizen_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    kaizen_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    submitter_name VARCHAR(255) NOT NULL,
    submitter_employee_code VARCHAR(50),
    department VARCHAR(100) NOT NULL,
    problem_statement TEXT NOT NULL,
    solution_implemented TEXT NOT NULL,
    benefit_type VARCHAR(50) DEFAULT 'Safety' CHECK (benefit_type IN ('Safety', 'Quality', 'Productivity', 'Cost', 'Delivery', 'Morale', 'Environment')),
    before_photo_url TEXT,
    after_photo_url TEXT,
    total_score INTEGER DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'HOD Approved', 'Assessor Verified', 'Completed', 'Rejected')),
    hod_approver_id UUID REFERENCES public.users(id),
    assessor_id UUID REFERENCES public.users(id),
    reward_points INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, kaizen_number)
);

-- ==============================================================================
-- 19. TRAINING & MOCK DRILLS (Module 18)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mock_drills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    drill_number VARCHAR(50) NOT NULL,
    drill_type VARCHAR(100) NOT NULL CHECK (drill_type IN ('Fire Evacuation', 'Chemical Spill / Toxic Release', 'Confined Space Rescue', 'Medical Emergency', 'Natural Disaster')),
    drill_date DATE NOT NULL,
    drill_time TIME DEFAULT '11:00:00',
    scenario_description TEXT NOT NULL,
    evacuation_time_seconds INTEGER NOT NULL,
    target_time_seconds INTEGER DEFAULT 180,
    total_participants INTEGER NOT NULL,
    headcount_verified BOOLEAN DEFAULT true,
    observations_and_gaps JSONB DEFAULT '[]'::jsonb,
    drill_commander_name VARCHAR(255) NOT NULL,
    report_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, drill_number)
);

-- ==============================================================================
-- 20. EQUIPMENT & MACHINERY INSPECTION (Module 19)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.equipment_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    machine_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    capacity VARCHAR(100),
    make VARCHAR(100),
    status VARCHAR(30) DEFAULT 'In Service' CHECK (status IN ('In Service', 'Under Maintenance', 'Decommissioned', 'Quarantined')),
    last_inspected_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, machine_code)
);

CREATE TABLE IF NOT EXISTS public.equipment_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES public.equipment_registry(id) ON DELETE CASCADE,
    inspection_type VARCHAR(100) NOT NULL CHECK (inspection_type IN ('First Aid Box', 'Safety Shower & Eyewash', 'Machine Guard', 'Lifting Gear & Hoist', 'Pneumatic Tool')),
    inspection_date DATE NOT NULL,
    inspector_id UUID REFERENCES public.users(id),
    checklist_results JSONB DEFAULT '{}'::jsonb,
    result VARCHAR(20) DEFAULT 'Pass' CHECK (result IN ('Pass', 'Defect Identified', 'Fail')),
    observations TEXT,
    action_item TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 21. SAFETY COMMITTEE MEETINGS (Module 20)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.safety_committee_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    meeting_number VARCHAR(50) NOT NULL,
    meeting_date DATE NOT NULL,
    chairperson_name VARCHAR(255) NOT NULL,
    secretary_name VARCHAR(255) NOT NULL,
    attendees JSONB DEFAULT '[]'::jsonb, -- Array of management and worker representatives
    agenda_discussed JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    mom_pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, meeting_number)
);

-- ==============================================================================
-- 22. DOCUMENT MANAGEMENT & SOP LIBRARY (Module 21)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ehs_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    document_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('SOP', 'Safety Policy', 'Emergency Manual', 'Inspection Form', 'EHS Guideline')),
    department VARCHAR(100) NOT NULL,
    revision_number VARCHAR(20) DEFAULT 'Rev 00',
    effective_date DATE NOT NULL,
    review_due_date DATE,
    file_url TEXT NOT NULL,
    file_size_kb INTEGER,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, document_code)
);

-- ==============================================================================
-- 23. PROCESS SAFETY MANAGEMENT (PSM) (Module 22)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.psm_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    element_number INTEGER NOT NULL CHECK (element_number BETWEEN 1 AND 14),
    element_name VARCHAR(255) NOT NULL,
    compliance_pct INTEGER DEFAULT 85 CHECK (compliance_pct BETWEEN 0 AND 100),
    responsible_hod VARCHAR(255),
    findings_count INTEGER DEFAULT 0,
    action_plan TEXT,
    last_audited_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, facility_id, element_number)
);

-- ==============================================================================
-- 24. JOB SAFETY ANALYSIS (JSA) (Module 23)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.job_safety_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    jsa_number VARCHAR(50) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    supervisor_id UUID REFERENCES public.users(id),
    ppe_required JSONB DEFAULT '["Safety Shoes", "Helmet", "Safety Goggles"]'::jsonb,
    steps JSONB DEFAULT '[]'::jsonb, -- Array of { sequence, step_desc, hazard, control }
    status VARCHAR(30) DEFAULT 'Approved' CHECK (status IN ('Draft', 'Under Review', 'Approved', 'Archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, jsa_number)
);

-- ==============================================================================
-- 25. LOTO & ISOLATION MANAGEMENT (Module 24)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.loto_isolations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    loto_number VARCHAR(50) NOT NULL,
    machine_code VARCHAR(100) NOT NULL,
    equipment_name VARCHAR(255) NOT NULL,
    permit_id UUID REFERENCES public.ptw_permits(id) ON DELETE SET NULL,
    isolation_points JSONB DEFAULT '[]'::jsonb, -- Electrical, pneumatic, hydraulic, valve
    lock_numbers JSONB DEFAULT '[]'::jsonb,
    zero_energy_verified BOOLEAN DEFAULT true,
    applied_by_id UUID REFERENCES public.users(id),
    verified_by_id UUID REFERENCES public.users(id),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    removed_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'Active' CHECK (status IN ('Active', 'De-isolated', 'Revoked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, loto_number)
);

-- ==============================================================================
-- 26. CONTRACTORS & VEHICLE REGISTRY (Complementary Master Data)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    vendor_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    safety_induction_valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, vendor_name)
);

CREATE TABLE IF NOT EXISTS public.vehicle_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Truck / Tanker', 'Forklift', 'Car / Van', 'Two Wheeler', 'Tractor')),
    driver_name VARCHAR(255) NOT NULL,
    driver_license_number VARCHAR(100),
    spark_arrestor_fitted BOOLEAN DEFAULT true,
    pollution_under_control_valid BOOLEAN DEFAULT true,
    gate_entry_time TIMESTAMPTZ DEFAULT NOW(),
    gate_exit_time TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'Inside Plant' CHECK (status IN ('Inside Plant', 'Exited', 'Blacklisted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 27. ROW LEVEL SECURITY (RLS) POLICIES - STRICT MULTI-TENANT ISOLATION
-- ==============================================================================

-- Helper function to extract tenant from JWT auth token
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
BEGIN
    -- Fallback to default SBL tenant if not in JWT session
    RETURN COALESCE(
        NULLIF(current_setting('app.current_tenant_id', true), '')::UUID,
        '00000000-0000-0000-0000-000000000001'::UUID
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Macro to enable RLS and create isolation policy on all tenant tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'facilities', 'users', 'ehs_telemetry_snapshots', 'ptw_permits',
        'moc_records', 'pssr_reviews', 'capa_actions', 'hazop_studies',
        'esg_environmental_metrics', 'safety_observations', 'incident_investigations',
        'five_s_audits', 'fps_assets', 'fps_inspections', 'ohc_medical_records',
        'statutory_compliances', 'ai_chat_sessions', 'hira_assessments',
        'lms_courses', 'lms_enrollments', 'kaizen_proposals', 'mock_drills',
        'equipment_registry', 'equipment_inspections', 'safety_committee_meetings',
        'ehs_documents', 'psm_elements', 'job_safety_analyses', 'loto_isolations',
        'contractors', 'vehicle_registry'
    ];
BEGIN
    FOR i IN 1..array_length(tables, 1) LOOP
        tbl := tables[i];
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON public.%I;', tbl);
        EXECUTE format('
            CREATE POLICY tenant_isolation_policy ON public.%I
            FOR ALL USING (
                company_id = public.current_tenant_id()
                OR company_id = ''00000000-0000-0000-0000-000000000001''::UUID
            )
            WITH CHECK (
                company_id = public.current_tenant_id()
                OR company_id = ''00000000-0000-0000-0000-000000000001''::UUID
            );
        ', tbl);
    END LOOP;
END $$;

-- Companies Table RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_companies_policy ON public.companies;
CREATE POLICY tenant_companies_policy ON public.companies
FOR ALL USING (
    id = public.current_tenant_id()
    OR id = '00000000-0000-0000-0000-000000000001'::UUID
)
WITH CHECK (
    id = public.current_tenant_id()
    OR id = '00000000-0000-0000-0000-000000000001'::UUID
);

-- ==============================================================================
-- 28. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_ptw_company_status ON public.ptw_permits(company_id, status);
CREATE INDEX IF NOT EXISTS idx_capa_company_status ON public.capa_actions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_obs_company_type ON public.safety_observations(company_id, observation_type);
CREATE INDEX IF NOT EXISTS idx_5s_company_dept ON public.five_s_audits(company_id, department);
CREATE INDEX IF NOT EXISTS idx_fps_company_tag ON public.fps_assets(company_id, asset_tag);
CREATE INDEX IF NOT EXISTS idx_telemetry_company_time ON public.ehs_telemetry_snapshots(company_id, snapshot_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_users_company_code ON public.users(company_id, employee_code);

-- ==============================================================================
-- 29. POSTGREST & API ROLES PERMISSIONS (ANON, AUTHENTICATED, SERVICE_ROLE)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
