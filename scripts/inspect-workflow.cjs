const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

function printFunc(name) {
  const start = doc.indexOf(`function ${name}`);
  if (start === -1) return console.log(`NOT FOUND: ${name}`);
  const nextFunc = doc.indexOf('function ', start + 10);
  const end = nextFunc !== -1 ? nextFunc : start + 4000;
  console.log(`=== ${name} ===`);
  console.log(doc.substring(start, end));
}

printFunc('onFormSubmit_v3');
printFunc('handlePortalAction_v3');
printFunc('renderApprovalPortal');
