const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

const tStart = doc.indexOf('TelegramModule.gs');
const fStart = doc.indexOf('FORMLINKUTILITY.GS');

console.log('--- TelegramModule.gs ---');
if (tStart !== -1) {
  console.log(doc.substring(tStart, tStart + 2000));
}

console.log('--- FORMLINKUTILITY.GS ---');
if (fStart !== -1) {
  console.log(doc.substring(fStart, fStart + 2000));
}
