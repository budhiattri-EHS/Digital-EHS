const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

const refMatches = [...doc.matchAll(/REFERENCE_SHEET[^\n;]+/g)].map(m => m[0]);
console.log('Reference Sheet mentions:\n', refMatches.join('\n'));

// Check PERMITS_CONFIG, HAZARDS_LIST, PPE_LIST, ISO_TYPES_V3
function printConst(name) {
  const match = doc.match(new RegExp(`const\\s+${name}\\s*=\\s*([^;]+);`));
  if (match) {
    console.log(`=== const ${name} ===\n`, match[1]);
  }
}

printConst('HAZARDS_LIST');
printConst('PPE_LIST');
printConst('PERMITS_CONFIG');
printConst('ISO_TYPES_V3');
