const https = require('https');

const urls = [
  'https://central.github.com/deployments/desktop/desktop/latest/darwin-arm64',
  'https://download.cursor.sh/mac/apple-silicon'
  // Add more URLs as needed
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`${url} -> ${res.statusCode} ${res.statusMessage}`);
    if (res.statusCode === 200) {
      console.log('  OK');
    } else {
      console.log('  NOT OK');
    }
  }).on('error', (e) => {
    console.error(`${url} -> ERROR: ${e.message}`);
  });
}); 