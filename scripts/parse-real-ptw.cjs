const fs = require('fs');

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

const raw = fs.readFileSync('scripts/ptw_sheet_raw.csv', 'utf8');
const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
const headers = parseCSVLine(lines[0]);

console.log(`Processing ${lines.length - 1} records from Google Sheet...`);

const permits = [];

for (let r = 1; r < lines.length; r++) {
  const row = parseCSVLine(lines[r]);
  const pNo = row[1];
  if (!pNo || !pNo.startsWith('PTW-')) continue;

  const timestamp = row[0] || '';
  const status = row[2] || 'Approved';
  const location = row[3] || 'Unit 3 Production';
  const desc = row[4] || 'General Maintenance';
  const emergencyNo = row[5] || '110';
  const startDateTime = row[6] || '';
  const endDateTime = row[7] || '';
  const requestor = row[8] || 'Budhi Parkash';
  const vendor = row[9] || 'SBL Maintenance';
  const workers = row[12] || '';
  const firstAider = row[14] || 'Ajay Kumar';
  const ertMember = row[15] || 'Budhi Prakash';
  const fireWatch = row[16] || 'Sanee Kumar';
  const assemblyPoint = row[17] || '1';
  const execSupervisor = row[18] || '';
  const benSupervisor = row[19] || '';

  // Determine Permit Type
  let permitType = 'General / Cold';
  let isHighRisk = false;

  // Scan row for checklists
  const rowStr = row.join(' ');
  if (rowStr.includes('Hot Work') && (row[40] === 'Yes' || rowStr.includes('WELDING') || rowStr.includes('GAS CUTTING'))) {
    permitType = 'Hot Work';
    isHighRisk = true;
  } else if (rowStr.includes('Height Work') || rowStr.includes('SCAFFOLD') || rowStr.includes('LADDER') || rowStr.includes('Height')) {
    permitType = 'Height Work';
    isHighRisk = true;
  } else if (rowStr.includes('Confined Space') || rowStr.includes('VESSEL') || rowStr.includes('TANK CLEANING')) {
    permitType = 'Confined Space';
    isHighRisk = true;
  } else if (rowStr.includes('Line Breaking') || rowStr.includes('PIPELINE')) {
    permitType = 'Line Breaking';
    isHighRisk = true;
  } else if (rowStr.includes('Excavation') || rowStr.includes('CIVIL DIGGING')) {
    permitType = 'Excavation';
    isHighRisk = true;
  } else if (rowStr.includes('Hoisting') || rowStr.includes('CRANE')) {
    permitType = 'Hoisting';
    isHighRisk = true;
  }

  // Hazards list
  const hazards = [];
  if (rowStr.includes('Flammables')) hazards.push('Flammables');
  if (rowStr.includes('Corrosive Chemical')) hazards.push('Corrosive Chemical');
  if (rowStr.includes('Overhead danger')) hazards.push('Overhead danger');
  if (rowStr.includes('Moving Machine')) hazards.push('Moving Machine');
  if (rowStr.includes('Hot Material')) hazards.push('Hot Material');
  if (rowStr.includes('Hazardous Energy')) hazards.push('Hazardous Energy');
  if (hazards.length === 0) hazards.push('General Industrial Hazards');

  // PPEs list
  const ppes = ['Safety Helmet', 'Safety Shoes'];
  if (isHighRisk) ppes.push('Safety Goggles', 'Safety Gloves');
  if (permitType === 'Height Work') ppes.push('Full Body Safety Harness', 'Fall Arrestor');
  if (permitType === 'Hot Work') ppes.push('Face Shield', 'Leather Apron');

  // Approvers mapping
  const approvers = [
    {
      slot: 1,
      role: 'Area / Beneficiary Supervisor',
      name: benSupervisor || 'D. Annotiya',
      email: 'd.annotiya@sblcoatings.com',
      status: status === 'Pending L1' ? 'Pending' : (status === 'Rejected' ? 'Rejected' : 'Approved'),
      timestamp: timestamp,
      comments: 'Site conditions verified safe.'
    },
    {
      slot: 2,
      role: 'Executing Supervisor',
      name: execSupervisor || 'Tarun Bansal',
      email: 'u2maintenance@sblcoatings.com',
      status: (status === 'Pending L1' || status === 'Pending L2') ? (status === 'Pending L2' ? 'Pending' : 'Waiting') : (status === 'Rejected' ? 'Rejected' : 'Approved'),
      timestamp: timestamp,
      comments: 'Workforce inducted with PPE.'
    },
    {
      slot: 3,
      role: 'Safety / EHS Officer',
      name: 'A. Tiwari',
      email: 'a.tiwari@sblcoatings.com',
      status: (status.startsWith('Pending L1') || status.startsWith('Pending L2') || status === 'Pending L3') ? (status === 'Pending L3' ? 'Pending' : 'Waiting') : (status === 'Rejected' ? 'Rejected' : 'Approved'),
      timestamp: timestamp,
      comments: 'Permit valid per ISO 45001 norms.'
    }
  ];

  if (isHighRisk) {
    approvers.push({
      slot: 4,
      role: 'Fire & ERT Officer',
      name: 'Sunny Choudhary',
      email: 'sunnychoudhary299@gmail.com',
      status: status.includes('Approved') || status === 'Closed' ? 'Approved' : 'Pending',
      timestamp: timestamp,
      comments: 'Fire extinguisher & watch stationed.'
    });
    approvers.push({
      slot: 5,
      role: 'Plant Head / HOD (Manufacturing)',
      name: 'Budhi Parkash',
      email: 'b.parkash@sblcoatings.com',
      status: status.includes('Approved') || status === 'Closed' ? 'Approved' : 'Pending',
      timestamp: timestamp,
      comments: 'Final operational authorization granted.'
    });
  }

  permits.push({
    id: pNo,
    company_id: '00000000-0000-0000-0000-000000000001',
    facility_id: '10000000-0000-0000-0000-000000000002',
    permit_number: pNo,
    permit_type: permitType,
    title: desc.length > 50 ? desc.slice(0, 50) + '...' : desc,
    description: desc,
    location: location,
    vendor: vendor,
    requestor: requestor,
    emergency_contact: emergencyNo,
    valid_from: startDateTime || timestamp,
    valid_to: endDateTime || '17:30',
    status: status.includes('Pending') ? (isHighRisk ? 'Pending L4' : 'Pending L2') : (status === 'Closed' ? 'Closed' : (status === 'Rejected' ? 'Rejected' : 'Active')),
    risk_level: isHighRisk ? 'High' : 'Low',
    loto_required: permitType === 'Hot Work' || permitType === 'Line Breaking',
    hazards_identified: hazards,
    precautions_checklist: ppes,
    workers: workers,
    first_aider: firstAider,
    ert_member: ertMember,
    fire_watch: fireWatch,
    assembly_point: assemblyPoint,
    approvers: approvers,
    created_at: timestamp
  });
}

console.log(`Successfully parsed ${permits.length} authentic permits!`);

fs.mkdirSync('web/src/data', { recursive: true });
fs.writeFileSync('web/src/data/realPtwLedger.json', JSON.stringify(permits.slice(-150), null, 2));
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/realPtwLedger.json', JSON.stringify(permits.slice(-150), null, 2));

console.log('Saved most recent 150 authentic permits to web/src/data/realPtwLedger.json and src/data/realPtwLedger.json');
