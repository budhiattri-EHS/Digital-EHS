const fs = require('fs');

const raw = fs.readFileSync('scripts/reference_sheet.csv', 'utf8');
const lines = raw.split(/\r?\n/).filter(Boolean);
const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());

const directory = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  // Parse CSV line handling quotes
  const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
  const cleanCols = cols.map(c => c.replace(/^"|"$/g, '').trim());
  if (cleanCols[0] && cleanCols[1]) {
    directory.push({
      role: cleanCols[0],
      name: cleanCols[1],
      email: cleanCols[2],
      pin: cleanCols[4] || cleanCols[3] || '1234'
    });
  }
}

fs.writeFileSync('web/src/data/ptwReferenceDirectory.json', JSON.stringify(directory, null, 2));
if (fs.existsSync('src/data')) {
  fs.writeFileSync('src/data/ptwReferenceDirectory.json', JSON.stringify(directory, null, 2));
}
console.log(`Saved ${directory.length} reference personnel to web/src/data/ptwReferenceDirectory.json`);
