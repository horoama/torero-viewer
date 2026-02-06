const http = require('http');

console.log("Checking API...");
http.get('http://localhost:3001/api/files', (res) => {
  console.log('API Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('API Data:', data));
}).on('error', (e) => {
  console.error('API Error:', e);
});

console.log("Checking Frontend...");
http.get('http://localhost:3001/', (res) => {
  console.log('Frontend Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
      data += chunk;
      if (data.length > 200) { // Just grab beginning
          res.destroy();
      }
  });
  res.on('close', () => {
      if (data.toLowerCase().includes('<!doctype html>')) {
          console.log('Frontend: HTML detected');
      } else {
          console.log('Frontend: unexpected content');
          console.log(data.substring(0, 100));
      }
  });
}).on('error', (e) => {
  console.error('Frontend Error:', e);
});
