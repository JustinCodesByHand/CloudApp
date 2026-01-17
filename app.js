require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();


// ==================== MIDDLEWARE ORDER MATTERS ====================
// 1. CORS middleware FIRST
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 2. Parse JSON bodies SECOND
app.use(express.json());

// 3. Request logging middleware (optional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', req.body);
  }
  next();
});

// Database connection
const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'finance',
  password: 'Kripa316316$',
  port: 5432,
});

// Test database connection
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Postgres is connected!", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Connection failed" });
  }
});

// ==================== FIXED LOGIN ENDPOINT ====================
app.post('/login', async (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');

  // Check if body exists
  if (!req.body) {
    console.log('❌ Request body is undefined');
    return res.status(400).json({ error: "Request body is required" });
  }

  console.log('Email:', req.body.email);
  console.log('Password provided:', req.body.password ? 'Yes' : 'No');

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    console.log('User found:', userResult.rows.length > 0 ? 'Yes' : 'No');

    if (userResult.rows.length === 0) {
      console.log('❌ No user with this email');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('Stored hash exists:', !!user.password_hash);

    // Check password
    console.log('Comparing password...');
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('❌ Password comparison failed');
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create JWT Token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    console.log('✅ Login successful');
    console.log('Token generated for user:', user.username);

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ... rest of your routes (register, dashboard, ai-advice, etc.)

// Add near top with other requires
const fetch = require('node-fetch');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = verified.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Middleware for CORS (important for frontend calls)
app.use(cors({
  origin: 'http://localhost:5173', // Your React frontend URL
  credentials: true
}));

// Simple CORS test endpoint
app.get('/cors-test', (req, res) => {
  console.log('✅ CORS test endpoint called');
  res.json({
    success: true,
    message: 'CORS is working!',
    timestamp: new Date().toISOString(),
    yourOrigin: req.headers.origin,
    corsHeaders: {
      'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials')
    }
  });
});

app.post('/cors-test-post', (req, res) => {
  console.log('✅ CORS POST test endpoint called');
  res.json({
    success: true,
    message: 'POST CORS is working!',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

// OPTIONS handler for CORS preflight
app.options('/cors-test-post', (req, res) => {
  console.log('🛬 OPTIONS preflight for /cors-test-post');
  res.status(200).end();
});

app.options('/ai-advice', (req, res) => {
  console.log('🛬 OPTIONS preflight for /ai-advice');
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.post('/ai-advice', authenticateToken, async (req, res) => {
  console.log('=== /ai-advice CALLED ===');
  console.log('User ID from token:', req.userId);
  console.log('Time:', new Date().toISOString());

  try {
    const userId = req.userId;

    // Get user's financial data
    const [summaryResult, categoriesResult, userResult] = await Promise.all([
      pool.query(
        `SELECT
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_spent,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COUNT(*) as transaction_count
         FROM transactions
         WHERE user_id = $1
         AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
        [userId]
      ),

      pool.query(
        `SELECT
            COALESCE(category, 'Uncategorized') as category,
            SUM(amount) as total_spent,
            COUNT(*) as count
         FROM transactions
         WHERE user_id = $1
         AND type = 'expense'
         AND date >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY category
         ORDER BY total_spent DESC`,
        [userId]
      ),

      pool.query(
        "SELECT username, email FROM users WHERE id = $1",
        [userId]
      )
    ]);

    const user = userResult.rows[0];
    const summary = summaryResult.rows[0];
    const categories = categoriesResult.rows;

    // Calculate values
    const totalIncome = parseFloat(summary.total_income || 0);
    const totalSpent = parseFloat(summary.total_spent || 0);
    const transactionCount = parseInt(summary.transaction_count || 0);




let awsData = null;
let insight = "";
let source = "local_ai";

// Try AWS Lambda
try {
  console.log('📤 Attempting AWS Lambda call...');

  // Prepare data
  const awsData = {
    userId: userId.toString(),
    username: user?.username || 'User',
    totalSpent: totalSpent,
    totalIncome: totalIncome,
    categories: categories.reduce((acc, row) => {
      acc[row.category || 'Uncategorized'] = parseFloat(row.total_spent);
      return acc;
    }, {}),
    month: new Date().toISOString().slice(0, 7),
    timestamp: new Date().toISOString()
  };

  console.log('Sending to AWS:', JSON.stringify(awsData, null, 2));

  // Use fetch (Node.js 18+)
  const awsResponse = await fetch(
    "https://886l7lx4xj.execute-api.us-east-2.amazonaws.com/default/getFinanceAIInsights",
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(awsData),
      timeout: 5000
    }
  );

  console.log('AWS Response status:', awsResponse.status);

  if (awsResponse.ok) {
    const awsDataResult = await awsResponse.json();
    console.log('AWS Response data:', awsDataResult);

    // Extract insight
    if (awsDataResult.insight) {
      insight = awsDataResult.insight;
      source = "aws_lambda";
      console.log('✅ Using AWS Lambda insight');
    } else if (awsDataResult.body) {
      // Handle API Gateway wrapped response
      try {
        const body = typeof awsDataResult.body === 'string'
          ? JSON.parse(awsDataResult.body)
          : awsDataResult.body;

        if (body.insight) {
          insight = body.insight;
          source = "aws_lambda";
          console.log('✅ Using AWS Lambda insight (wrapped)');
        }
      } catch (e) {
        console.log('Could not parse AWS response body');
      }
    }
  } else {
    console.log('AWS returned error status:', awsResponse.status);
  }

} catch (awsError) {
  console.log('⚠️ AWS Lambda failed:', awsError.message);
  // Fall through to local AI
}

// If AWS failed or returned no insight, use local
if (!insight) {
  insight = generateLocalInsight(totalIncome, totalSpent, categories);
  source = "local_ai";
  console.log('✅ Using local AI insight');
}

    // Send response
    const response = {
      success: true,
      insight: insight,
      source: source,
      dataSummary: {
        totalIncome: totalIncome,
        totalSpent: totalSpent,
        transactionCount: transactionCount,
        topCategories: categories.slice(0, 3).map(c => c.category)
      },
      timestamp: new Date().toISOString()
    };

    // If we have AWS data, include it for debugging
    if (awsData && source === "aws_lambda") {
      response.awsDataSent = awsData;
    }

    res.json(response);

  } catch (error) {
    console.error('❌ AI Advice error:', error);

    // Generate local insight as fallback
    const insight = generateLocalInsight(
      parseFloat(summaryResult?.rows[0]?.total_income || 0),
      parseFloat(summaryResult?.rows[0]?.total_spent || 0),
      categoriesResult?.rows || []
    );

    res.json({
      success: true,
      insight: insight,
      source: 'fallback',
      error: error.message
    });
  }
});

// Add to your existing app.js routes (before the /health endpoint)
app.post('/receipt/upload', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { transactions } = req.body;

    // Store receipt metadata (simplified)
    const receiptResult = await pool.query(
      `INSERT INTO receipts (user_id, original_filename, processed, extracted_data)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [userId, 'mobile_upload.jpg', true, JSON.stringify(transactions)]
    );

    // Save transactions
    const savedTransactions = [];
    for (const tx of transactions) {
      const result = await pool.query(
        `INSERT INTO transactions (user_id, receipt_id, description, amount, category, type, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, description, amount, category, type, date`,
        [userId, receiptResult.rows[0].id, tx.description, tx.amount, tx.category, tx.type, tx.date]
      );
      savedTransactions.push(result.rows[0]);
    }

    res.json({
      success: true,
      message: `Saved ${savedTransactions.length} transactions from receipt`,
      transactions: savedTransactions
    });

  } catch (error) {
    console.error('Error saving receipt transactions:', error);
    res.status(500).json({ error: 'Failed to save receipt data' });
  }
});


// Add this to your existing app.js around line 250-300 (with other routes)

// Enhanced analytics endpoint
app.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Get dashboard data first (reuse your existing logic)
    const [summaryResult, categoriesResult, transactionsResult] = await Promise.all([
      pool.query(
        `SELECT
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COUNT(*) as transaction_count
         FROM transactions
         WHERE user_id = $1
         AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
        [userId]
      ),

      pool.query(
        `SELECT
            COALESCE(category, 'Uncategorized') as category,
            SUM(amount) as total_spent,
            COUNT(*) as count
         FROM transactions
         WHERE user_id = $1
         AND type = 'expense'
         AND date >= DATE_TRUNC('month', CURRENT_DATE)
         GROUP BY category
         ORDER BY total_spent DESC`,
        [userId]
      ),

      pool.query(
        `SELECT id, description, amount, category, type, date
         FROM transactions
         WHERE user_id = $1
         ORDER BY date DESC
         LIMIT 100`,
        [userId]
      )
    ]);

    const summary = summaryResult.rows[0];
    const categories = categoriesResult.rows;
    const transactions = transactionsResult.rows;

    // Calculate monthly trends (last 6 months)
    const monthlyTrendResult = await pool.query(
      `SELECT
          TO_CHAR(date, 'YYYY-MM') as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
       FROM transactions
       WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY TO_CHAR(date, 'YYYY-MM')
       ORDER BY month DESC
       LIMIT 6`,
      [userId]
    );

    // Calculate weekly spending (current week)
    const weeklySpendingResult = await pool.query(
      `SELECT
          EXTRACT(DOW FROM date) as day_of_week,
          SUM(amount) as total_spent
       FROM transactions
       WHERE user_id = $1
       AND type = 'expense'
       AND date >= DATE_TRUNC('week', CURRENT_DATE)
       GROUP BY EXTRACT(DOW FROM date)
       ORDER BY day_of_week`,
      [userId]
    );

    // Map day numbers to names (PostgreSQL: 0=Sunday, 1=Monday, etc.)
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklySpending = dayMap.map((day, index) => ({
      day,
      amount: parseFloat(weeklySpendingResult.rows.find(r => parseInt(r.day_of_week) === index)?.total_spent || 0)
    }));

    res.json({
      success: true,
      data: {
        // Dashboard stats
        balance: parseFloat(summary.total_income) - parseFloat(summary.total_expenses),
        totalIncome: parseFloat(summary.total_income) || 0,
        totalExpenses: parseFloat(summary.total_expenses) || 0,
        transactionCount: parseInt(summary.transaction_count) || 0,

        // Charts data
        spendingByCategory: categories.map(row => ({
          name: row.category,
          value: parseFloat(row.total_spent) || 0
        })),

        monthlyTrend: monthlyTrendResult.rows.map(row => ({
          month: row.month,
          income: parseFloat(row.income) || 0,
          expenses: parseFloat(row.expenses) || 0
        })),

        weeklySpending,

        recentTransactions: transactions.map(tx => ({
          id: tx.id,
          description: tx.description,
          amount: parseFloat(tx.amount),
          category: tx.category,
          type: tx.type,
          date: tx.date
        }))
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data'
    });
  }
});

// FIXED Local AI function - returns string, not object
function generateLocalInsight(totalIncome, totalSpent, categories) {
  console.log('🔍 Generating local insight with:', { totalIncome, totalSpent, categoriesCount: categories.length });

  if (!totalIncome || totalIncome === 0) {
    return "Add income transactions to analyze your financial health.";
  }

  // Ensure numbers are valid
  totalIncome = parseFloat(totalIncome) || 0;
  totalSpent = parseFloat(totalSpent) || 0;

  const spendingRatio = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
  const savingsRate = 100 - spendingRatio;
  const savingsAmount = totalIncome - totalSpent;

  // Get top categories
  const topCategories = categories.slice(0, 3).map(c => ({
    name: c.category || 'Uncategorized',
    amount: parseFloat(c.total_spent) || 0
  }));

  console.log('📊 Calculated:', { spendingRatio, savingsRate, savingsAmount, topCategories });

  let insight = "";

  // Generate insight based on spending ratio
  if (spendingRatio > 95) {
    insight = `🚨 CRITICAL: Spending ${Math.round(spendingRatio)}% of your $${totalIncome.toLocaleString()} income. `;
    insight += `Only $${savingsAmount.toLocaleString()} saved. `;
    insight += `Emergency review needed for ${topCategories.map(c => c.name).join(', ')} expenses.`;
  } else if (spendingRatio > 80) {
    insight = `⚠️ HIGH SPENDING: ${Math.round(spendingRatio)}% of income spent. `;
    insight += `Saved $${savingsAmount.toLocaleString()}. `;
    insight += `Focus on reducing ${topCategories[0]?.name || 'major'} expenses ($${topCategories[0]?.amount.toLocaleString()}).`;
  } else if (spendingRatio > 60) {
    insight = `📊 MODERATE: ${Math.round(spendingRatio)}% spending, ${Math.round(savingsRate)}% saving. `;
    insight += `Saved $${savingsAmount.toLocaleString()}. `;
    insight += `Good foundation. Aim for 50% spending rate.`;
  } else if (spendingRatio > 40) {
    insight = `✅ HEALTHY: ${Math.round(savingsRate)}% savings rate! `;
    insight += `Excellent! You saved $${savingsAmount.toLocaleString()}. `;
    insight += `Consider investing ${Math.round(savingsRate * 0.6)}% of savings.`;
  } else {
    insight = `🎉 EXCELLENT: ${Math.round(savingsRate)}% savings rate! `;
    insight += `Outstanding! Building $${savingsAmount.toLocaleString()} monthly wealth. `;
    insight += `Explore investment diversification.`;
  }

  // Add category-specific advice
  if (topCategories.length > 0 && totalIncome > 0) {
    const largestCategory = topCategories[0];
    const categoryPercent = (largestCategory.amount / totalIncome) * 100;

    if (categoryPercent > 25) {
      insight += ` ${largestCategory.name} represents ${Math.round(categoryPercent)}% of income.`;

      // Specific advice for common categories
      if (largestCategory.name === 'Electronics') {
        insight += ` Consider delaying non-essential tech purchases.`;
      } else if (largestCategory.name === 'Housing') {
        insight += ` Review housing costs for potential savings.`;
      } else if (largestCategory.name === 'Transportation') {
        insight += ` Explore carpooling or public transit options.`;
      } else if (largestCategory.name === 'Dining') {
        insight += ` Try cooking at home more often.`;
      }
    }
  }

  console.log('💡 Generated insight:', insight);
  return insight;
}
// Register Route
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at",
      [username, email, hashedPassword]
    );

    // Generate token
    const token = jwt.sign(
      { userId: newUser.rows[0].id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email,
        createdAt: newUser.rows[0].created_at,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});



// Validate token endpoint (for frontend ProtectedRoute)
app.get('/validate-token', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ valid: false, error: "User not found" });
    }

    res.json({
      valid: true,
      user: userResult.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ valid: false, error: "Server error" });
  }
});

// Dashboard endpoint
app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user info
    const userResult = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [userId]
    );

    // Get transactions
    const transactionsResult = await pool.query(
      `SELECT id, description, amount, category, type, date
       FROM transactions
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 10`,
      [userId]
    );

    // Get spending summary
    const summaryResult = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income
       FROM transactions
       WHERE user_id = $1
       AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    const summary = summaryResult.rows[0];
    const balance = summary.total_income - summary.total_expenses;

    res.json({
      user: userResult.rows[0],
      balance: parseFloat(balance).toFixed(2),
      totalIncome: parseFloat(summary.total_income).toFixed(2),
      totalExpenses: parseFloat(summary.total_expenses).toFixed(2),
      transactions: transactionsResult.rows.map(tx => ({
        id: tx.id,
        description: tx.description,
        amount: parseFloat(tx.amount).toFixed(2),
        category: tx.category,
        type: tx.type,
        date: tx.date,
      })),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get spending data for AWS Lambda
app.get('/user/spending', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Get spending summary
    const summaryResult = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income
       FROM transactions
       WHERE user_id = $1
       AND date >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    // Get spending by category
    const categoriesResult = await pool.query(
      `SELECT
        category,
        SUM(amount) as total_spent
       FROM transactions
       WHERE user_id = $1
       AND type = 'expense'
       AND date >= DATE_TRUNC('month', CURRENT_DATE)
       GROUP BY category`,
      [userId]
    );

    // Format categories
    const categories = {};
    categoriesResult.rows.forEach(row => {
      categories[row.category || 'Uncategorized'] = parseFloat(row.total_spent);
    });

    res.json({
      userId: userId.toString(),
      totalSpent: parseFloat(summaryResult.rows[0].total_expenses).toFixed(2),
      totalIncome: parseFloat(summaryResult.rows[0].total_income).toFixed(2),
      categories,
      month: new Date().toISOString().slice(0, 7),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { description, amount, category, type, date } = req.body;

    const newTransaction = await pool.query(
      `INSERT INTO transactions (user_id, description, amount, category, type, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, description, amount, category, type, date`,
      [userId, description, parseFloat(amount), category, type, date]
    );

    res.json({
      message: "Transaction added successfully",
      transaction: newTransaction.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Get all transactions
app.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    const transactionsResult = await pool.query(
      `SELECT id, description, amount, category, type, date
       FROM transactions
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM transactions WHERE user_id = $1",
      [userId]
    );

    res.json({
      transactions: transactionsResult.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /register',
      'POST /login',
      'GET /dashboard (protected)',
      'GET /user/spending (protected)',
      'POST /transactions (protected)',
      'GET /validate-token (protected)'
    ]
  });
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log('Accessible from: http://18.189.27.56:${PORT}')
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set (using fallback)'}`);
});
