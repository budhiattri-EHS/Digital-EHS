const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

const dashStart = doc.indexOf('DASHBOARD.HTML');
console.log('dashStart:', dashStart);
if (dashStart !== -1) {
  const dashContent = doc.substring(dashStart, dashStart + 15000);
  fs.writeFileSync('scripts/extracted_dashboard.html', dashContent);
  console.log('Saved first 15000 chars of DASHBOARD.HTML');
  console.log(dashContent.substring(0, 1500));
}
