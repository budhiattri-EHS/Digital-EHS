const fs = require('fs');
const html = fs.readFileSync('scripts/extracted_dashboard_full.html', 'utf8');

// Print HTML structure
const bodyStart = html.indexOf('<body');
const scriptStart = html.indexOf('<script');
console.log('HTML BODY:\n', html.substring(bodyStart, scriptStart));
