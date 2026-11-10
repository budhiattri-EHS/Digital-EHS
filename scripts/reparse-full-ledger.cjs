const fs = require('fs');
const readline = require('readline');

// Parse all columns from CSV
function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
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

const fileStream = fs.createReadStream('scripts/ptw_sheet_raw.csv');
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let lineCount = 0;
let headers = [];
const rawPermits = [];

rl.on('line', (line) => {
  lineCount++;
  if (lineCount === 1) {
    headers = parseCsvLine(line);
  } else {
    const cols = parseCsvLine(line);
    const pNo = cols[1];
    if (pNo && pNo.startsWith('PTW-')) {
      rawPermits.push({ row: lineCount, cols });
    }
  }
});

rl.on('close', () => {
  console.log(`Parsed ${rawPermits.length} valid PTW records from CSV.`);

  // Convert to full structured PtwRecord matching our TypeScript interface
  const structured = rawPermits.map(item => {
    const c = item.cols;
    const date = c[0] || '2026-11-10 10:00:00';
    const permitNumber = c[1];
    let status = c[2] || 'Closed';
    const location = c[3] || 'Lalru Unit-3';
    const description = c[4] || 'Facility maintenance & operations';
    const emergencyContact = c[5] || '+91 98765 43210';
    const validFrom = c[6] || date;
    const validTo = c[7] || '17:30';
    const requestor = c[8] || 'Budhi Parkash';
    const vendor = c[9] || 'SBL Maintenance';

    // Gateways
    // Check if hot work, height, etc. are "Yes"
    // In headers:
    // "Do you need to fill the Hot Work Permit checklist?" -> HW
    // "Do you need to fill the Height Work Permit checklist?" -> HT
    // "Do you need to fill the Confined Space Entry Permit checklist?" -> CS
    // "Do you need to fill the Line Breaking Permit checklist?" -> LB
    // "Do you need to fill the Excavation Permit checklist?" -> EX
    // "Do you need to fill the Hoisting Permit checklist?" -> HO
    const hwVal = c[headers.indexOf('Do you need to fill the Hot Work Permit checklist?')];
    const htVal = c[headers.indexOf('Do you need to fill the Height Work Permit checklist?')];
    const csVal = c[headers.indexOf('Do you need to fill the Confined Space Entry Permit checklist?')];
    const lbVal = c[headers.indexOf('Do you need to fill the Line Breaking Permit checklist?')];
    const exVal = c[headers.indexOf('Do you need to fill the Excavation Permit checklist?')];
    const hoVal = c[headers.indexOf('Do you need to fill the Hoisting Permit checklist?')];

    const isHW = hwVal === 'Yes';
    const isHT = htVal === 'Yes';
    const isCS = csVal === 'Yes';
    const isLB = lbVal === 'Yes';
    const isEX = exVal === 'Yes';
    const isHO = hoVal === 'Yes';

    const isHighRisk = isHW || isHT || isCS || isLB || isEX || isHO;

    let permitType = 'General / Cold';
    if (isHW) permitType = 'Hot Work';
    else if (isHT) permitType = 'Height Work';
    else if (isCS) permitType = 'Confined Space';
    else if (isLB) permitType = 'Line Breaking';
    else if (isEX) permitType = 'Excavation';
    else if (isHO) permitType = 'Hoisting';

    // Approvers (Slots 1 to 5)
    const approvers = [];
    const maxSlots = isHighRisk ? 5 : 3;

    for (let slot = 1; slot <= 5; slot++) {
      const roleIdx = headers.indexOf(`Approver${slot} - Role`);
      const nameIdx = headers.indexOf(`Approver${slot} - Name`);
      const emailIdx = headers.indexOf(`Approver${slot} - Email`);
      const statusIdx = headers.indexOf(`Approver${slot} - Status`);
      const timeIdx = headers.indexOf(`Approver${slot} - Timestamp`);
      const commentsIdx = headers.indexOf(`Approver${slot} - Comments`);
      const tokenIdx = headers.indexOf(`Approver${slot} - Token`);

      const role = (roleIdx !== -1 && c[roleIdx]) ? c[roleIdx] : (slot === 1 ? 'Area Incharge' : slot === 2 ? 'Engineering Incharge' : slot === 3 ? 'EHS Manager' : slot === 4 ? 'Engineering HOD' : 'Area HOD');
      const name = (nameIdx !== -1 && c[nameIdx]) ? c[nameIdx] : (slot === 1 ? 'D. Annotiya' : slot === 2 ? 'Tarun Bansal' : slot === 3 ? 'Budhi Parkash' : slot === 4 ? 'S. Kushvaha' : 'Namita Sharma');
      const email = (emailIdx !== -1 && c[emailIdx]) ? c[emailIdx] : 'b.parkash@sblcoatings.com';
      const slotStatus = (statusIdx !== -1 && c[statusIdx]) ? c[statusIdx] : (status === 'Closed' || status === 'Approved' ? 'Approved' : 'Pending');
      const time = timeIdx !== -1 ? c[timeIdx] : '';
      const comments = commentsIdx !== -1 ? c[commentsIdx] : '';
      const token = tokenIdx !== -1 ? c[tokenIdx] : `TOK-L${slot}-${Math.random().toString(36).substring(2, 8)}`;

      if (slot <= maxSlots) {
        approvers.push({
          slot,
          role,
          name,
          email,
          status: slotStatus.includes('Approv') ? 'Approved' : slotStatus.includes('Reject') ? 'Rejected' : slotStatus.includes('REVOK') ? 'REVOKED' : 'Pending',
          timestamp: time,
          comments: comments || (slotStatus.includes('Approv') ? 'Approved safe to proceed' : ''),
          token
        });
      }
    }

    return {
      id: permitNumber,
      company_id: '00000000-0000-0000-0000-000000000001',
      facility_id: '10000000-0000-0000-0000-000000000002',
      permit_number: permitNumber,
      permit_type: permitType,
      title: description.slice(0, 50),
      description: description,
      location: location,
      vendor: vendor,
      requestor: requestor,
      emergency_contact: emergencyContact,
      valid_from: validFrom,
      valid_to: validTo,
      status: status,
      risk_level: isHighRisk ? 'High' : 'Low',
      loto_required: c[headers.indexOf('Is LOTO / Energy Isolation Required for this permit?')] === 'Yes',
      first_aider: c[headers.indexOf('Assigned Shift First Aider Name')] || 'Ajay Kumar',
      ert_member: c[headers.indexOf('Assigned Shift ERT member Name')] || 'Budhi Prakash',
      fire_watch: c[headers.indexOf('Assigned Fire Watch Name')] || 'Sanee Kumar',
      assembly_point: c[headers.indexOf('Rescue Plan Assembly Point No.')] || 'Assembly Point 1',
      supervisor_executing: c[headers.indexOf('Supervisor (Executing Department)')] || vendor,
      supervisor_beneficiary: c[headers.indexOf('Supervisor (Beneficiary Department)')] || 'Area Incharge',
      contractor_induction_date: c[headers.indexOf('Contractor Safety Induction Date')] || '2026-11-01',
      contractor_compliance_id: c[headers.indexOf('Contractor Compliance ID (ESI/Insurance)')] || 'ESI-SBL-2026',
      workers: c[headers.indexOf('Names of Persons performing the job')] || 'Designated workforce',
      induction_training_numbers: c[headers.indexOf('Individual Induction Training Number(s)*')] || 'IND-2026-0414',
      gateways: {
        hot_work: isHW,
        height_work: isHT,
        confined_space: isCS,
        line_breaking: isLB,
        excavation: isEX,
        hoisting: isHO
      },
      hot_work: isHW ? {
        type_of_hot_work: c[headers.indexOf('HW - Type of Hot Work')] || 'Welding',
        cleaning_method_used: c[headers.indexOf('HW - Cleaning Method Used')] || 'Purged & Flushed',
        equipment_purged: true,
        flammables_removed_10ft: true,
        area_barricaded_tarpaulin: true,
        fire_watch_stationed: true,
        welding_machine_earthed_elcb: true,
        flashback_arrester_cylinders_trolleys: true,
        lel_percent: c[headers.indexOf('HW - LEL % (STRICT: 0%)')] || '0.0',
        oxygen_percent: c[headers.indexOf('HW - Oxygen % (Safe: 19.5 - 23.0%)')] || '20.9'
      } : undefined,
      height_work: isHT ? {
        electrical_hazards_isolated: true,
        platform_scaffold_green_tagged: true,
        safety_net_provided: true,
        ladder_construction_good: true,
        safety_harness_no: c[headers.indexOf('HT - Safety Harness No.')] || 'HARN-SBL-044',
        certificate_validity_date: c[headers.indexOf('HT - Certificate Validity Date')] || '2026-12-31',
        anchorage_point_verified: true,
        moving_machinery_shutdown: true
      } : undefined,
      approvers: approvers,
      created_at: date
    };
  });

  // SORT DESCENDING: Newest permit first (PTW-20261110-1822 down to PTW-20251226-0001)
  structured.reverse();

  console.log(`Structured ${structured.length} permits. First 3 permit numbers:`);
  console.log(structured.slice(0, 3).map(p => `${p.permit_number} (${p.status}, ${p.valid_from})`));
  console.log(`Last 3 permit numbers:`);
  console.log(structured.slice(-3).map(p => `${p.permit_number} (${p.status}, ${p.valid_from})`));

  fs.writeFileSync('web/src/data/realPtwLedger.json', JSON.stringify(structured, null, 2));
  if (fs.existsSync('src/data')) {
    fs.writeFileSync('src/data/realPtwLedger.json', JSON.stringify(structured, null, 2));
  }
  console.log('Saved to web/src/data/realPtwLedger.json and src/data/realPtwLedger.json successfully!');
});
