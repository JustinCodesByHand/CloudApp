const https = require('https');

const testData = {
  userId: "testuser1",
  username: "Test User",
  email: "test@example.com",
  totalSpent: 1200,
  totalIncome: 3000,
  transactionCount: 15,
  categories: {
    "Food": 300,
    "Transportation": 200,
    "Entertainment": 150,
    "Shopping": 550
  },
  month: "2024-01",
  timestamp: new Date().toISOString(),
  timezone: "America/New_York"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: '886l7lx4xj.execute-api.us-east-2.amazonaws.com',
  path: '/default/getFinanceAIInsights',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  },
  timeout: 5000
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed:', JSON.stringify(parsed, null, 2));
    } catch(e) {
      console.log('Could not parse JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.destroy();
});

req.write(postData);
req.end();