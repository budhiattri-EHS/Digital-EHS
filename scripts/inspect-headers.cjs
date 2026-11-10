const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

const start = doc.indexOf('function buildMasterHeaders_v3');
const end = doc.indexOf('function ', start + 10);
console.log(doc.substring(start, end));
