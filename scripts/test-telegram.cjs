const https = require('https');

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const chatId = process.env.TELEGRAM_CHAT_ID || '6613901446';
const text = '🛡️ *SBL Sentinel PTW System Online*\n\nYour EHS Portal is successfully integrated with live Telegram alerts and multi-tier escalation.';

const payload = JSON.stringify({
  chat_id: chatId,
  text: text,
  parse_mode: 'Markdown'
});

const req = https.request({
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${token}/sendMessage`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('Telegram API Response:', data));
});

req.on('error', e => console.error('Telegram error:', e.message));
req.write(payload);
req.end();
