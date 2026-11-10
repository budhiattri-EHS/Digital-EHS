const fs = require('fs');

function parseCSVLine(str) {
  let arr = [];
  let quote = false;
  let entry = '';
  for (let i = 0; i < str.length; i++) {
    let c = str[i];
    if (c === '"') {
      quote = !quote;
    } else if (c === ',' && !quote) {
      arr.push(entry.trim());
      entry = '';
    } else {
      entry += c;
    }
  }
  arr.push(entry.trim());
  return arr;
}

const sheet = fs.readFileSync('scripts/ptw_sheet_raw.csv', 'utf8');
const lines = sheet.split('\n').filter(l => l.trim().length > 0);
console.log('Total non-empty lines:', lines.length);

const headers = parseCSVLine(lines[0]);
console.log('Total headers:', headers.length);
headers.forEach((h, i) => console.log(`${i}: ${h}`));

console.log('\n--- SAMPLE ROWS ---');
for (let r = 1; r < Math.min(lines.length, 4); r++) {
  console.log(`\nRow ${r}:`);
  const row = parseCSVLine(lines[r]);
  headers.forEach((h, i) => {
    if (row[i]) {
      console.log(`  ${h}: ${row[i]}`);
    }
  });
}

// Now let's examine the Google Doc
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');
console.log('\n--- DOC HIGHLIGHTS (Approval, Mails, Formats) ---');
const docLines = doc.split('\n');

// Find approval workflow section
let inApprovalSection = false;
for (let i = 0; i < docLines.length; i++) {
  const line = docLines[i];
  if (line.includes('function sendApprovalEmail_v3') || line.includes('function onFormSubmit_v3') || line.includes('function processApproval_v3')) {
    console.log(`\n--- Line ${i}: ${line.trim()} ---`);
    for (let j = i; j < Math.min(docLines.length, i + 60); j++) {
      console.log(docLines[j]);
    }
    i += 60;
  }
}
