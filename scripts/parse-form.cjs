const fs = require('fs');

try {
  const raw = fs.readFileSync('scripts/ptw_form_data.json', 'utf8');
  const data = JSON.parse(raw);
  const formTitle = data[1][8] || data[1][0];
  console.log('FORM TITLE:', formTitle);
  console.log('FORM DESCRIPTION:', data[1][0]);

  const items = data[1][1];
  console.log('TOTAL FORM ITEMS:', items.length);

  const parsedQuestions = items.map((item, idx) => {
    const id = item[0];
    const title = item[1];
    const desc = item[2];
    const type = item[3];
    const details = item[4];
    let options = [];
    if (details && details[0] && details[0][1]) {
      options = details[0][1].map(o => o[0]);
    }
    return { idx: idx + 1, id, title, type, options, desc };
  });

  fs.writeFileSync('scripts/parsed_form_questions.json', JSON.stringify(parsedQuestions, null, 2));
  console.log('Parsed questions saved to scripts/parsed_form_questions.json');
  parsedQuestions.forEach(q => {
    const opts = q.options && q.options.length ? q.options.slice(0, 5).join(' | ') + (q.options.length > 5 ? ` (+${q.options.length - 5} more)` : '') : 'Text/None';
    console.log(`#${q.idx} [${q.title}] (Type ${q.type}) - ${opts}`);
  });
} catch (e) {
  console.error('Error parsing form data:', e);
}
