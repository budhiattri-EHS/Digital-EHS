const fs = require('fs');
const doc = fs.readFileSync('scripts/ptw_doc_raw.txt', 'utf8');

const dashStart = doc.indexOf('DASHBOARD.HTML');
const dashEnd = doc.indexOf('FORMLINKUTILITY.GS', dashStart);
const fullDash = doc.substring(dashStart, dashEnd !== -1 ? dashEnd : dashStart + 35000);

fs.writeFileSync('scripts/extracted_dashboard_full.html', fullDash);
console.log('Saved full DASHBOARD.HTML, length:', fullDash.length);

// Check key elements in dashboard
const lines = fullDash.split('\n');
console.log('Total lines in DASHBOARD.HTML:', lines.length);

// Search for buttons, modals, table columns, filters
const buttons = lines.filter(l => l.includes('<button') || l.includes('function ') || l.includes('onclick'));
console.log('Sample functions & buttons in dashboard:\n', buttons.slice(0, 30).join('\n'));
