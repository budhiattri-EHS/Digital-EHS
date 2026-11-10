const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

function extractFunction(name) {
  const start = doc.indexOf(`function ${name}`);
  if (start === -1) return `NOT FOUND: ${name}`;
  // Find next function or cut 2000 chars
  const nextFunc = doc.indexOf('function ', start + 10);
  const end = nextFunc !== -1 ? nextFunc : start + 3000;
  return doc.substring(start, end);
}

console.log('=== sendApprovalEmail_v3 ===');
console.log(extractFunction('sendApprovalEmail_v3').substring(0, 1500));

console.log('=== findEmailByNameAndRole_v3 ===');
console.log(extractFunction('findEmailByNameAndRole_v3').substring(0, 1500));

console.log('=== handlePortalAction_v3 ===');
console.log(extractFunction('handlePortalAction_v3').substring(0, 1500));
