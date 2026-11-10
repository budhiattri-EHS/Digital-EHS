const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

console.log('--- Search for functions in Code.gs ---');
const funcRegex = /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g;
let match;
while ((match = funcRegex.exec(doc)) !== null) {
  console.log(`function ${match[1]}(${match[2]})`);
}
