const fs = require('fs');
const questions = JSON.parse(fs.readFileSync('scripts/parsed_form_questions.json', 'utf8'));

console.log('Total questions in Google Form:', questions.length);

let curSection = 'START';
questions.forEach(q => {
  if (q.type === 6 || q.type === 8) {
    curSection = q.title;
    console.log(`\n=== SECTION [${q.idx}]: ${q.title} ===`);
  } else {
    console.log(`  #${q.idx} ${q.title} (${q.type === 2 ? 'Yes/No' : q.type === 3 ? 'Dropdown' : q.type === 9 ? 'Date/Time' : 'Text'})`);
  }
});
