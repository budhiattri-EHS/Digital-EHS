const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

const start = doc.indexOf('function onFormSubmit_v3');
const end = doc.indexOf('function initialisePTW_v3', start);
console.log(doc.substring(start, end));
