const https = require('https');
const fs = require('fs');
const url = 'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json';
const out = 'data/vietnamAdministrative_full.json';

console.log('Downloading Vietnam administrative JSON...');
https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed to fetch file, status:', res.statusCode);
    process.exit(1);
  }

  const chunks = [];
  res.on('data', (c) => chunks.push(c));
  res.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    try {
      JSON.parse(body); // validate
    } catch (e) {
      console.error('Downloaded content is not valid JSON:', e.message);
      process.exit(2);
    }
    fs.writeFileSync(out, body, 'utf8');
    console.log('Saved to', out);
  });
}).on('error', (err) => {
  console.error('Request error:', err.message);
  process.exit(1);
});
