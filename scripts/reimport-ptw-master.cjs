/**
 * ==============================================================================
 * SBL SPECIALTY COATINGS - MASTER PTW DATA RE-IMPORT & UPSERT ENGINE
 * Restores 100% 164-Column Parity from PTW_Master.xlsx (PTW_Master_Data tab)
 * Direct PostgreSQL Ingestion into Supabase Cloud
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { Client } = require('pg');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  });
}

const EXCEL_PATH = 'D:/Budhi Parkash/Drive D/EHS Online Management System/PTW_Master.xlsx';

console.log('1. Loading PTW_Master.xlsx from:', EXCEL_PATH);
if (!fs.existsSync(EXCEL_PATH)) {
  console.error('File not found:', EXCEL_PATH);
  process.exit(1);
}

const wb = xlsx.readFile(EXCEL_PATH);
const ws = wb.Sheets['PTW_Master_Data'];
if (!ws) {
  console.error('Sheet "PTW_Master_Data" not found in workbook!');
  process.exit(1);
}

const rawData = xlsx.utils.sheet_to_json(ws, { header: 1 });
const headers = rawData[0];
console.log(`Loaded ${rawData.length} rows. Total headers: ${headers.length}`);

function excelDateToISO(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const str = String(val).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString();
  return str;
}

const hazardNames = [
  'Corrosive Chemical', 'Fume/Dust', 'Lone Work', 'Flammables', 'Overhead danger',
  'Buried Cables', 'Explosives', 'Moving Machine', 'Buried Pipelines', 'Compressed Gas',
  'Confined Space', 'Hot Work', 'Hot Material', 'Fragile Roof', 'Hazardous Energy'
];

const ppeNames = [
  'Safety Helmet', 'Safety Goggles', 'Safety Shoes', 'Gum boots', 'Face Mask',
  'Safety Gloves', 'Safety glasses', 'Full body PVC suit', 'Safety Harness',
  'Ear Protection', 'Dust/Fume respirator Pad', 'Fall arrestor'
];

const ptwRecords = [];
const uiLedgerRecords = [];

for (let i = 1; i < rawData.length; i++) {
  const row = rawData[i];
  if (!row || !row[1]) continue;
  let pNo = String(row[1]).trim();
  if (!pNo.startsWith('PTW-')) continue;

  // Correct typographical duplicates in rows 1065 and 1253 to maintain 1,825 unique sequential permits
  if (i === 1065 && pNo === 'PTW-20260605-1064') {
    pNo = 'PTW-20260605-1065';
  } else if (i === 1253 && pNo === 'PTW-20260713-1252') {
    pNo = 'PTW-20260713-1253';
  }

  // Gateways
  const isHw = String(row[49] || '').trim().toLowerCase() === 'yes';
  const isHt = String(row[60] || '').trim().toLowerCase() === 'yes';
  const isCs = String(row[69] || '').trim().toLowerCase() === 'yes';
  const isLb = String(row[81] || '').trim().toLowerCase() === 'yes';
  const isEx = String(row[87] || '').trim().toLowerCase() === 'yes';
  const isHo = String(row[93] || '').trim().toLowerCase() === 'yes';

  const activeGateways = [];
  if (isHw) activeGateways.push('Hot Work');
  if (isHt) activeGateways.push('Height Work');
  if (isCs) activeGateways.push('Confined Space');
  if (isLb) activeGateways.push('Line Breaking');
  if (isEx) activeGateways.push('Excavation');
  if (isHo) activeGateways.push('Hoisting');

  const risk_level = activeGateways.length > 0 ? 'High' : 'Low';
  const permit_type = activeGateways.length > 0 ? activeGateways.join(' + ') : 'General / Cold Work';

  // Hazards
  const hazards = [];
  for (let c = 20; c <= 34; c++) {
    if (String(row[c] || '').trim().toLowerCase() === 'yes') {
      hazards.push(hazardNames[c - 20]);
    }
  }
  const otherHazard = String(row[35] || '').trim();
  if (otherHazard && !['no', 'n/a', 'na', 'none', '-'].includes(otherHazard.toLowerCase())) {
    hazards.push(otherHazard);
  }

  // PPE
  const ppes = [];
  for (let c = 36; c <= 47; c++) {
    if (String(row[c] || '').trim().toLowerCase() === 'yes') {
      ppes.push(ppeNames[c - 36]);
    }
  }
  const otherPPE = String(row[48] || '').trim();
  if (otherPPE && !['no', 'n/a', 'na', 'none', '-'].includes(otherPPE.toLowerCase())) {
    ppes.push(otherPPE);
  }

  // Precautions Checklist
  const checklist = [];
  if (isHw) {
    for (let c = 50; c <= 57; c++) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim()) {
        checklist.push({ category: 'Hot Work', item: headers[c], value: String(row[c]).trim() });
      }
    }
  }
  if (isHt) {
    for (let c = 61; c <= 68; c++) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim()) {
        checklist.push({ category: 'Height Work', item: headers[c], value: String(row[c]).trim() });
      }
    }
  }
  if (isCs) {
    for (let c = 70; c <= 74; c++) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim()) {
        checklist.push({ category: 'Confined Space', item: headers[c], value: String(row[c]).trim() });
      }
    }
  }
  if (isLb) {
    for (let c = 82; c <= 86; c++) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim()) {
        checklist.push({ category: 'Line Breaking', item: headers[c], value: String(row[c]).trim() });
      }
    }
  }
  if (isEx) {
    for (let c = 88; c <= 92; c++) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim()) {
        checklist.push({ category: 'Excavation', item: headers[c], value: String(row[c]).trim() });
      }
    }
  }
  if (isHo) {
    for (let c = 94; c <= 99; c++) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim()) {
        checklist.push({ category: 'Hoisting', item: headers[c], value: String(row[c]).trim() });
      }
    }
  }

  // Gas test records
  const gas_test_records = [];
  if (row[58] !== undefined || row[59] !== undefined) {
    gas_test_records.push({
      location: 'Hot Work Site',
      lel: row[58] !== undefined ? String(row[58]).trim() : '0%',
      oxygen: row[59] !== undefined ? String(row[59]).trim() : '20.9%'
    });
  }
  if (row[75] !== undefined || row[76] !== undefined) {
    gas_test_records.push({
      location: 'Confined Space (Top)',
      lel: row[75] !== undefined ? String(row[75]).trim() : '0%',
      oxygen: row[76] !== undefined ? String(row[76]).trim() : '20.9%'
    });
  }
  if (row[77] !== undefined || row[78] !== undefined) {
    gas_test_records.push({
      location: 'Confined Space (Middle)',
      lel: row[77] !== undefined ? String(row[77]).trim() : '0%',
      oxygen: row[78] !== undefined ? String(row[78]).trim() : '20.9%'
    });
  }
  if (row[79] !== undefined || row[80] !== undefined) {
    gas_test_records.push({
      location: 'Confined Space (Bottom)',
      lel: row[79] !== undefined ? String(row[79]).trim() : '0%',
      oxygen: row[80] !== undefined ? String(row[80]).trim() : '20.9%'
    });
  }

  // LOTO
  const loto_required = String(row[100] || '').trim().toLowerCase() === 'yes';
  const loto_details = {
    electrical: {
      required: String(row[101] || '').trim().toLowerCase() === 'yes',
      lock_number: String(row[102] || '').trim(),
      isolation_done_by: String(row[103] || '').trim(),
      energy_discharged: String(row[104] || '').trim(),
      try_out_successful: String(row[105] || '').trim()
    },
    mechanical: {
      required: String(row[106] || '').trim().toLowerCase() === 'yes',
      lock_number: String(row[107] || '').trim(),
      isolation_done_by: String(row[108] || '').trim(),
      energy_discharged: String(row[109] || '').trim(),
      try_out_successful: String(row[110] || '').trim()
    },
    hydraulic: {
      required: String(row[111] || '').trim().toLowerCase() === 'yes',
      lock_number: String(row[112] || '').trim(),
      isolation_done_by: String(row[113] || '').trim(),
      energy_discharged: String(row[114] || '').trim(),
      try_out_successful: String(row[115] || '').trim()
    },
    pneumatic: {
      required: String(row[116] || '').trim().toLowerCase() === 'yes',
      lock_number: String(row[117] || '').trim(),
      isolation_done_by: String(row[118] || '').trim(),
      energy_discharged: String(row[119] || '').trim(),
      try_out_successful: String(row[120] || '').trim()
    },
    other: {
      required: String(row[121] || '').trim().toLowerCase() === 'yes',
      lock_number: String(row[122] || '').trim(),
      isolation_done_by: String(row[123] || '').trim(),
      energy_discharged: String(row[124] || '').trim(),
      try_out_successful: String(row[125] || '').trim()
    }
  };

  const created_at = excelDateToISO(row[0]) || new Date().toISOString();
  const valid_from = excelDateToISO(row[6]) || created_at;
  const valid_to = excelDateToISO(row[7]) || created_at;

  const approver_1_role = row[126] ? String(row[126]).trim() : 'Area Incharge';
  const approver_1_name = row[127] ? String(row[127]).trim() : null;
  const approver_1_email = row[128] ? String(row[128]).trim() : null;
  const approver_1_status = row[129] ? String(row[129]).trim() : 'Pending';
  const approver_1_timestamp = row[130] ? (excelDateToISO(row[130]) || String(row[130]).trim()) : null;
  const approver_1_comments = row[131] ? String(row[131]).trim() : null;
  const approver_1_token = row[132] ? String(row[132]).trim() : null;

  const approver_2_role = row[133] ? String(row[133]).trim() : 'Engineering Incharge';
  const approver_2_name = row[134] ? String(row[134]).trim() : null;
  const approver_2_email = row[135] ? String(row[135]).trim() : null;
  const approver_2_status = row[136] ? String(row[136]).trim() : 'Pending';
  const approver_2_timestamp = row[137] ? (excelDateToISO(row[137]) || String(row[137]).trim()) : null;
  const approver_2_comments = row[138] ? String(row[138]).trim() : null;
  const approver_2_token = row[139] ? String(row[139]).trim() : null;

  const approver_3_role = row[140] ? String(row[140]).trim() : 'EHS Manager';
  const approver_3_name = row[141] ? String(row[141]).trim() : null;
  const approver_3_email = row[142] ? String(row[142]).trim() : null;
  const approver_3_status = row[143] ? String(row[143]).trim() : 'Pending';
  const approver_3_timestamp = row[144] ? (excelDateToISO(row[144]) || String(row[144]).trim()) : null;
  const approver_3_comments = row[145] ? String(row[145]).trim() : null;
  const approver_3_token = row[146] ? String(row[146]).trim() : null;

  const approver_4_role = row[147] ? String(row[147]).trim() : 'Engineering HOD';
  const approver_4_name = row[148] ? String(row[148]).trim() : null;
  const approver_4_email = row[149] ? String(row[149]).trim() : null;
  const approver_4_status = row[150] ? String(row[150]).trim() : 'N/A';
  const approver_4_timestamp = row[151] ? (excelDateToISO(row[151]) || String(row[151]).trim()) : null;
  const approver_4_comments = row[152] ? String(row[152]).trim() : null;
  const approver_4_token = row[153] ? String(row[153]).trim() : null;

  const approver_5_role = row[154] ? String(row[154]).trim() : 'Area HOD';
  const approver_5_name = row[155] ? String(row[155]).trim() : null;
  const approver_5_email = row[156] ? String(row[156]).trim() : null;
  const approver_5_status = row[157] ? String(row[157]).trim() : 'N/A';
  const approver_5_timestamp = row[158] ? (excelDateToISO(row[158]) || String(row[158]).trim()) : null;
  const approver_5_comments = row[159] ? String(row[159]).trim() : null;
  const approver_5_token = row[160] ? String(row[160]).trim() : null;

  const final_closure_time = row[162] ? (excelDateToISO(row[162]) || String(row[162]).trim()) : null;
  const final_closure_comments = row[163] ? String(row[163]).trim() : null;
  const report_pdf_url = row[161] ? String(row[161]).trim() : null;

  const status = String(row[2] || 'Approved').trim();
  const desc = String(row[4] || 'Maintenance Work').trim();
  const location = String(row[3] || 'Facility Area').trim();

  const record = {
    company_id: '00000000-0000-0000-0000-000000000001',
    facility_id: '10000000-0000-0000-0000-000000000002',
    permit_number: pNo,
    permit_type,
    title: desc,
    description: desc,
    location,
    equipment_code: 'EQ-MAIN',
    status,
    risk_level,
    valid_from,
    valid_to,
    requestor_name: row[8] ? String(row[8]).trim() : null,
    vendor_name: row[9] ? String(row[9]).trim() : null,
    emergency_contact: row[5] ? String(row[5]).trim() : '110',
    contractor_induction_date: row[10] ? (excelDateToISO(row[10]) || String(row[10]).trim()) : null,
    contractor_esi_id: row[11] ? String(row[11]).trim() : null,
    workers_names: row[12] ? String(row[12]).trim() : null,
    induction_numbers: row[13] ? String(row[13]).trim() : null,
    first_aider_name: row[14] ? String(row[14]).trim() : null,
    ert_member_name: row[15] ? String(row[15]).trim() : null,
    fire_watch_name: row[16] ? String(row[16]).trim() : null,
    assembly_point: row[17] ? String(row[17]).trim() : null,
    executing_supervisor: row[18] ? String(row[18]).trim() : null,
    beneficiary_supervisor: row[19] ? String(row[19]).trim() : null,
    
    approver_1_role,
    approver_1_name,
    approver_1_email,
    approver_1_status,
    approver_1_timestamp,
    approver_1_comments,
    approver_1_token,

    approver_2_role,
    approver_2_name,
    approver_2_email,
    approver_2_status,
    approver_2_timestamp,
    approver_2_comments,
    approver_2_token,

    approver_3_role,
    approver_3_name,
    approver_3_email,
    approver_3_status,
    approver_3_timestamp,
    approver_3_comments,
    approver_3_token,

    approver_4_role,
    approver_4_name,
    approver_4_email,
    approver_4_status,
    approver_4_timestamp,
    approver_4_comments,
    approver_4_token,

    approver_5_role,
    approver_5_name,
    approver_5_email,
    approver_5_status,
    approver_5_timestamp,
    approver_5_comments,
    approver_5_token,

    final_closure_time,
    final_closure_comments,
    report_pdf_url,

    loto_required,
    loto_details,
    hazards_identified: hazards,
    ppe_issued: ppes,
    ppe_required: ppes,
    precautions_checklist: checklist,
    gas_test_records,
    created_at,
    updated_at: created_at
  };

  ptwRecords.push(record);

  // Also build structured record for UI ledger JSON
  uiLedgerRecords.push({
    id: `ptw-${pNo.toLowerCase()}`,
    company_id: record.company_id,
    facility_id: record.facility_id,
    permit_number: pNo,
    timestamp: created_at,
    status,
    risk_level,
    permit_type,
    location,
    description: desc,
    emergency_contact: record.emergency_contact,
    valid_from,
    valid_to,
    requestor: record.requestor_name || 'Budhi Parkash',
    requestor_name: record.requestor_name,
    vendor: record.vendor_name || 'SBL Maintenance Team',
    vendor_name: record.vendor_name,
    contractor_induction_date: record.contractor_induction_date,
    contractor_compliance_id: record.contractor_esi_id,
    contractor_esi_id: record.contractor_esi_id,
    workers: record.workers_names,
    workers_names: record.workers_names,
    induction_training_numbers: record.induction_numbers,
    induction_numbers: record.induction_numbers,
    first_aider: record.first_aider_name,
    first_aider_name: record.first_aider_name,
    ert_member: record.ert_member_name,
    ert_member_name: record.ert_member_name,
    fire_watch: record.fire_watch_name,
    fire_watch_name: record.fire_watch_name,
    assembly_point: record.assembly_point,
    supervisor_executing: record.executing_supervisor,
    executing_supervisor: record.executing_supervisor,
    supervisor_beneficiary: record.beneficiary_supervisor,
    beneficiary_supervisor: record.beneficiary_supervisor,
    hazards: hazards.reduce((acc, h) => ({ ...acc, [h]: true }), {}),
    hazards_identified: hazards,
    other_hazards: otherHazard,
    ppes: ppes.reduce((acc, p) => ({ ...acc, [p]: true }), {}),
    ppe_issued: ppes,
    ppe_required: ppes,
    other_ppes: otherPPE,
    gateways: {
      hot_work: isHw,
      height_work: isHt,
      confined_space: isCs,
      line_breaking: isLb,
      excavation: isEx,
      hoisting: isHo
    },
    precautions_checklist: checklist,
    gas_test_records,
    loto_required,
    loto_details,
    approvers: [
      { slot: 1, role: approver_1_role, name: approver_1_name || '', email: approver_1_email || '', status: approver_1_status, timestamp: approver_1_timestamp || '', comments: approver_1_comments || '', token: approver_1_token || '' },
      { slot: 2, role: approver_2_role, name: approver_2_name || '', email: approver_2_email || '', status: approver_2_status, timestamp: approver_2_timestamp || '', comments: approver_2_comments || '', token: approver_2_token || '' },
      { slot: 3, role: approver_3_role, name: approver_3_name || '', email: approver_3_email || '', status: approver_3_status, timestamp: approver_3_timestamp || '', comments: approver_3_comments || '', token: approver_3_token || '' },
      { slot: 4, role: approver_4_role, name: approver_4_name || '', email: approver_4_email || '', status: approver_4_status, timestamp: approver_4_timestamp || '', comments: approver_4_comments || '', token: approver_4_token || '' },
      { slot: 5, role: approver_5_role, name: approver_5_name || '', email: approver_5_email || '', status: approver_5_status, timestamp: approver_5_timestamp || '', comments: approver_5_comments || '', token: approver_5_token || '' }
    ],
    approver_1_role, approver_1_name, approver_1_email, approver_1_status, approver_1_timestamp, approver_1_comments, approver_1_token,
    approver_2_role, approver_2_name, approver_2_email, approver_2_status, approver_2_timestamp, approver_2_comments, approver_2_token,
    approver_3_role, approver_3_name, approver_3_email, approver_3_status, approver_3_timestamp, approver_3_comments, approver_3_token,
    approver_4_role, approver_4_name, approver_4_email, approver_4_status, approver_4_timestamp, approver_4_comments, approver_4_token,
    approver_5_role, approver_5_name, approver_5_email, approver_5_status, approver_5_timestamp, approver_5_comments, approver_5_token,
    report_pdf_url,
    final_closure_time,
    final_closure_comments,
    created_at,
    updated_at: created_at
  });
}

console.log(`Parsed ${ptwRecords.length} PTW records.`);
console.log('First permit:', ptwRecords[0].permit_number);
console.log('Last permit:', ptwRecords[ptwRecords.length - 1].permit_number);

if (ptwRecords.length !== 1825) {
  console.warn(`WARNING: Expected 1825 records, found ${ptwRecords.length}!`);
} else {
  console.log('✅ Exactly 1,825 records parsed up to ' + ptwRecords[ptwRecords.length - 1].permit_number);
}

// Write to JSON files for Web and Mobile sync
const webJsonPath = path.join(__dirname, '..', 'src', 'data', 'realPtwLedger.json');
fs.writeFileSync(webJsonPath, JSON.stringify(uiLedgerRecords, null, 2), 'utf8');
console.log('Wrote', uiLedgerRecords.length, 'records to', webJsonPath);

const mobileJsonPath = path.join(__dirname, '..', 'mobile', 'src', 'data', 'realPtwLedger.json');
if (fs.existsSync(path.dirname(mobileJsonPath))) {
  fs.writeFileSync(mobileJsonPath, JSON.stringify(uiLedgerRecords, null, 2), 'utf8');
  console.log('Wrote', uiLedgerRecords.length, 'records to', mobileJsonPath);
}

// Ingest into Supabase via direct PostgreSQL
async function ingestToSupabase() {
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com',
    port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
    user: process.env.SUPABASE_DB_USER || 'postgres.wzpdrkoluvprdokodpff',
    password: process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  console.log('\nConnecting to Supabase PostgreSQL database for upsert...');
  await client.connect();
  console.log('Connected!');

  // Columns for INSERT / UPSERT
  const cols = [
    'company_id', 'facility_id', 'permit_number', 'permit_type', 'title', 'description',
    'location', 'equipment_code', 'status', 'risk_level', 'valid_from', 'valid_to',
    'requestor_name', 'vendor_name', 'emergency_contact', 'contractor_induction_date',
    'contractor_esi_id', 'workers_names', 'induction_numbers', 'first_aider_name',
    'ert_member_name', 'fire_watch_name', 'assembly_point', 'executing_supervisor',
    'beneficiary_supervisor', 'loto_required', 'loto_details', 'hazards_identified',
    'ppe_issued', 'ppe_required', 'precautions_checklist', 'gas_test_records',
    'approver_1_role', 'approver_1_name', 'approver_1_email', 'approver_1_status', 'approver_1_timestamp', 'approver_1_comments', 'approver_1_token',
    'approver_2_role', 'approver_2_name', 'approver_2_email', 'approver_2_status', 'approver_2_timestamp', 'approver_2_comments', 'approver_2_token',
    'approver_3_role', 'approver_3_name', 'approver_3_email', 'approver_3_status', 'approver_3_timestamp', 'approver_3_comments', 'approver_3_token',
    'approver_4_role', 'approver_4_name', 'approver_4_email', 'approver_4_status', 'approver_4_timestamp', 'approver_4_comments', 'approver_4_token',
    'approver_5_role', 'approver_5_name', 'approver_5_email', 'approver_5_status', 'approver_5_timestamp', 'approver_5_comments', 'approver_5_token',
    'final_closure_time', 'final_closure_comments', 'report_pdf_url', 'created_at', 'updated_at'
  ];

  const updateSetClause = cols
    .filter(c => c !== 'company_id' && c !== 'permit_number')
    .map(c => `"${c}" = EXCLUDED."${c}"`)
    .join(', ');

  const batchSize = 100;
  console.log(`Starting batched upsert in chunks of ${batchSize}...`);

  for (let b = 0; b < ptwRecords.length; b += batchSize) {
    const chunk = ptwRecords.slice(b, b + batchSize);
    
    // Construct multi-row parameterized query
    const valuePlaceholders = [];
    const flatValues = [];
    let paramIdx = 1;

    for (const rec of chunk) {
      const rowParams = [];
      for (const col of cols) {
        let val = rec[col];
        if (['loto_details', 'hazards_identified', 'ppe_issued', 'ppe_required', 'precautions_checklist', 'gas_test_records'].includes(col)) {
          val = JSON.stringify(val || (col.endsWith('_details') ? {} : []));
        }
        flatValues.push(val);
        rowParams.push(`$${paramIdx++}`);
      }
      valuePlaceholders.push(`(${rowParams.join(', ')})`);
    }

    const query = `
      INSERT INTO public.ptw_permits (${cols.map(c => `"${c}"`).join(', ')})
      VALUES ${valuePlaceholders.join(',\n')}
      ON CONFLICT (company_id, permit_number)
      DO UPDATE SET ${updateSetClause};
    `;

    await client.query(query, flatValues);
    process.stdout.write(`✓ Processed records ${b + 1} to ${Math.min(b + batchSize, ptwRecords.length)} / ${ptwRecords.length}\r`);
  }

  console.log('\nAll batches uploaded successfully!');

  // Verify final count in database
  const countRes = await client.query('SELECT count(*) as total FROM public.ptw_permits;');
  console.log('📊 Supabase ptw_permits total record count:', countRes.rows[0].total);

  // Verify sample high risk permit
  const sampleHigh = await client.query(`
    SELECT permit_number, permit_type, status, risk_level, requestor_name, approver_1_name, approver_1_status
    FROM public.ptw_permits
    WHERE permit_number IN ('PTW-20260113-0100', 'PTW-20261112-1825')
    ORDER BY permit_number;
  `);
  console.log('\nVerification sample:');
  console.table(sampleHigh.rows);

  await client.end();
  console.log('Database connection closed. Ingestion complete!');
}

ingestToSupabase().catch(err => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});
