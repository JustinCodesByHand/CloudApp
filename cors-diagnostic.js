const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`\n=== ${new Date().toISOString()} ===`);
  console.log(`Request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  // Add ALL CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle actual request
  if (req.method === 'POST' && req.url === '/test-cors') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('Request body:', body);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        message: 'CORS test successful',
        timestamp: new Date().toISOString(),
        yourData: body ? JSON.parse(body) : null
      }));
    });
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'CORS Diagnostic Server',
      endpoints: ['POST /test-cors', 'OPTIONS /test-cors'],
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(5001, () => {
  console.log('🔍 CORS Diagnostic Server running on http://localhost:5001');
  console.log('Test in browser console:');
  console.log(`
    fetch('http://localhost:5001/test-cors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'cors' })
    })
    .then(res => res.json())
    .then(data => console.log(data))
  `);
});