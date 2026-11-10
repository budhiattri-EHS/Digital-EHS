const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('scripts/ptw_sheet_raw.csv');
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let lineCount = 0;
let headers = [];
const permitNumbers = [];
const sampleRows = [];
const lastPermits = [];

rl.on('line', (line) => {
  lineCount++;
  if (lineCount === 1) {
    // Parse headers using CSV parser logic
    headers = parseCsvLine(line);
    console.log('Total headers in CSV:', headers.length);
    console.log('Headers [0..15]:', headers.slice(0, 15));
  } else {
    const clean = parseCsvLine(line);
    const pNo = clean[1] || '';
    const date = clean[0] || '';
    const status = clean[2] || '';
    const loc = clean[3] || '';
    const desc = clean[4] || '';
    if (lineCount <= 30) {
      sampleRows.push({ row: lineCount, pNo, date, status, loc, desc });
    }
    if (pNo) {
      permitNumbers.push(pNo);
      lastPermits.push({ row: lineCount, pNo, date, status, loc, desc });
      if (lastPermits.length > 30) lastPermits.shift();
    }
  }
});

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

rl.on('close', () => {
  console.log('Total lines in sheet:', lineCount);
  console.log('Total permits with permit number:', permitNumbers.length);
  console.log('First 15 permits from top of sheet:');
  console.log(sampleRows.slice(0, 15).map(r => `Row ${r.row}: ${r.pNo} | ${r.date} | ${r.status} | ${r.loc}`));
  console.log('Last 15 permits from bottom of sheet (most recent!):');
  console.log(lastPermits.slice(-15).map(r => `Row ${r.row}: ${r.pNo} | ${r.date} | ${r.status} | ${r.loc}`));
});
