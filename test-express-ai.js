const fetch = require('node-fetch');

async function testExpressAI() {
  console.log('🧪 Testing Express /ai-advice endpoint\n');
  
  // First, login to get a token
  console.log('1. Logging in...');
  try {
    const loginRes = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test67@example.com',
        password: 'testpassword123' // Use the password you registered with
      })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginRes.ok) {
      console.log('❌ Login failed:', loginData.error);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginData.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('User ID:', loginData.user?.id);
    
    // Test /ai-advice endpoint
    console.log('\n2. Testing /ai-advice endpoint...');
    const aiRes = await fetch('http://localhost:5000/ai-advice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const aiData = await aiRes.json();
    console.log('Response Status:', aiRes.status);
    console.log('Full Response:', JSON.stringify(aiData, null, 2));
    
    if (aiRes.ok && aiData.success) {
      console.log('\n🎉 SUCCESS! AI Insight received:');
      console.log('=' .repeat(50));
      console.log(aiData.insight);
      console.log('=' .repeat(50));
      console.log('Source:', aiData.source);
      console.log('Total Income:', aiData.dataSummary?.totalIncome);
      console.log('Total Spent:', aiData.dataSummary?.totalSpent);
    } else {
      console.log('❌ AI Advice failed:', aiData.error);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
    console.log('Make sure Express backend is running: npm run dev');
  }
}

testExpressAI();