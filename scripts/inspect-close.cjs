const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

function printFunc(name) {
  const start = doc.indexOf(`function ${name}`);
  if (start === -1) return console.log(`NOT FOUND: ${name}`);
  const nextFunc = doc.indexOf('function ', start + 10);
  const end = nextFunc !== -1 ? nextFunc : start + 3000;
  console.log(`=== ${name} ===`);
  console.log(doc.substring(start, end));
}

printFunc('renderHandbackPortal');
printFunc('processHandback_v3');
printFunc('renderFinalClosePortal');
printFunc('processFinalClose_v3');
printFunc('verifyUserPin_v3');
