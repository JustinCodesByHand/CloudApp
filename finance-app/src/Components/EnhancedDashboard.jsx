import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

function EnhancedDashboard({ aiInsight, onGetAdvice }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [awsLoading, setAwsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Initialize with safe defaults
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    savingsRate: 0, // Ensure this is a number
    spendingByCategory: [],
    monthlyTrend: [],
    weeklySpending: [],
    recentTransactions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Fetch dashboard summary
      const dashboardRes = await fetch('http://localhost:5000/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!dashboardRes.ok) {
        throw new Error(`Failed to fetch dashboard: ${dashboardRes.status}`);
      }
      
      const data = await dashboardRes.json();
      console.log('Dashboard data:', data);
      
      // Calculate savings rate safely
      const totalIncome = parseFloat(data.totalIncome) || 0;
      const totalExpenses = parseFloat(data.totalExpenses) || 0;
      const savingsRate = totalIncome > 0 
        ? parseFloat(((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1))
        : 0;
      
      // Set dashboard data with safe defaults
      setDashboardData(prev => ({
        ...prev,
        balance: parseFloat(data.balance) || 0,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        savingsRate: savingsRate, // Now a number
        recentTransactions: data.transactions || []
      }));
      
      // Fetch analytics data
      await fetchAnalyticsData();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Try to fetch from /analytics endpoint if it exists
      // If not, use existing endpoints
      const analyticsRes = await fetch('http://localhost:5000/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        console.log('Analytics data:', analyticsData);
        
        if (analyticsData.success && analyticsData.data) {
          const { data } = analyticsData;
          
          // Update with analytics data
          setDashboardData(prev => ({
            ...prev,
            spendingByCategory: (data.spendingByCategory || []).map((item, index) => ({
              ...item,
              color: getCategoryColor(item.name)
            })),
            monthlyTrend: (data.monthlyTrend || []).map(item => ({
              month: formatMonth(item.month),
              income: parseFloat(item.income) || 0,
              expenses: parseFloat(item.expenses) || 0
            })),
            weeklySpending: data.weeklySpending || []
          }));
        }
      } else {
        // If /analytics doesn't exist yet, fetch from other endpoints
        await fetchFallbackAnalytics();
      }
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Continue with default data
    }
  };

  const fetchFallbackAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch spending by category
      const spendingRes = await fetch('http://localhost:5000/user/spending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (spendingRes.ok) {
        const spendingData = await spendingRes.json();
        
        // Transform categories for chart
        const spendingByCategory = Object.entries(spendingData.categories || {}).map(([name, amount], index) => ({
          name,
          value: parseFloat(amount) || 0,
          color: getCategoryColor(name)
        }));
        
        // Fetch transactions for trend data
        const transactionsRes = await fetch('http://localhost:5000/transactions?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          const transactions = transactionsData.transactions || [];
          
          // Generate monthly trend
          const monthlyTrend = generateMonthlyTrend(transactions);
          
          // Generate weekly spending
          const weeklySpending = generateWeeklySpending(transactions);
          
          setDashboardData(prev => ({
            ...prev,
            spendingByCategory,
            monthlyTrend,
            weeklySpending
          }));
        }
      }
      
    } catch (error) {
      console.error('Error in fallback analytics:', error);
    }
  };

  // Helper functions (keep these the same as before)
  const generateMonthlyTrend = (transactions) => {
    const monthlyData = {};
    
    transactions.forEach(tx => {
      if (!tx.date) return;
      
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (tx.type === 'income') {
        monthlyData[monthKey].income += parseFloat(tx.amount) || 0;
      } else {
        monthlyData[monthKey].expenses += parseFloat(tx.amount) || 0;
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: formatMonth(month),
        income: data.income,
        expenses: data.expenses
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-5);
  };

  const generateWeeklySpending = (transactions) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = days.map(day => ({ day, amount: 0 }));
    
    transactions.forEach(tx => {
      if (tx.type !== 'expense') return;
      
      const date = new Date(tx.date);
      const dayIndex = (date.getDay() + 6) % 7;
      weeklyData[dayIndex].amount += parseFloat(tx.amount) || 0;
    });
    
    return weeklyData;
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#3B82F6',
      'Housing': '#10B981',
      'Transportation': '#F59E0B',
      'Entertainment': '#8B5CF6',
      'Healthcare': '#EF4444',
      'Shopping': '#EC4899',
      'Utilities': '#06B6D4',
      'Education': '#8B5CF6',
      'Travel': '#F97316',
      'Other': '#6B7280',
      'Income': '#10B981'
    };
    return colors[category] || '#6B7280';
  };

  const handleGetAIAdvice = async () => {
    setAwsLoading(true);
    try {
      await onGetAdvice();
    } catch (error) {
      console.error('Error getting AI advice:', error);
    } finally {
      setAwsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // Calculate derived stats safely
  const netIncome = dashboardData.totalIncome - dashboardData.totalExpenses;
  const budgetUsed = dashboardData.totalIncome > 0 
    ? parseFloat((dashboardData.totalExpenses / dashboardData.totalIncome * 100).toFixed(1))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Finance AI Dashboard
          </h1>
          {user && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, <span className="font-semibold text-gray-800 dark:text-white">{user.username || user.email}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGetAIAdvice}
            disabled={awsLoading}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {awsLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span className="text-lg">🤖</span>
                Get AI Advice
              </>
            )}
          </button>

        <button
  onClick={() => navigate('/transactions')}
  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium"
>
  <span className="text-lg">📝</span> Manage Transactions
</button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* AI Insight Banner */}
      {aiInsight && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">AI Financial Insight</h3>
              <p className="text-gray-700 dark:text-gray-300">{aiInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <span className={`text-sm font-medium ${
              netIncome >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {netIncome >= 0 ? '+' : ''}${netIncome.toFixed(2)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Balance</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            ${dashboardData.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Monthly Spending Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
              <span className="text-2xl">💸</span>
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              ${dashboardData.totalExpenses.toFixed(2)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Monthly Spending</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            ${dashboardData.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {dashboardData.totalIncome > 0 ? (
              <>
                {budgetUsed}% of ${dashboardData.totalIncome.toFixed(2)} income
              </>
            ) : (
              'Add income to see budget usage'
            )}
          </div>
        </div>

        {/* Savings Rate Card - FIXED: using toFixed on a number */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <span className={`text-sm font-medium ${
              dashboardData.savingsRate >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {dashboardData.savingsRate >= 0 ? '+' : ''}{dashboardData.savingsRate.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Savings Rate</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            {typeof dashboardData.savingsRate === 'number' ? dashboardData.savingsRate.toFixed(1) : '0.0'}%
          </p>
          <div className="mt-2 flex items-center text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              dashboardData.savingsRate >= 20 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : dashboardData.savingsRate >= 0
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {dashboardData.savingsRate >= 20 ? 'Excellent' : 
               dashboardData.savingsRate >= 0 ? 'On Track' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg">
              <span className="text-2xl">⚖️</span>
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              ${dashboardData.totalIncome.toFixed(2)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Monthly Income</h3>
          <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            ${dashboardData.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {dashboardData.recentTransactions.filter(t => t.type === 'income').length} income transactions
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Spending by Category Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Spending by Category</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total: ${dashboardData.spendingByCategory.reduce((sum, cat) => sum + (cat.value || 0), 0).toFixed(2)}
            </span>
          </div>
          {dashboardData.spendingByCategory.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.spendingByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardData.spendingByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600 dark:text-gray-400">No spending data yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Add expense transactions to see category breakdown</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Monthly Income vs Expenses</h3>
          {dashboardData.monthlyTrend.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, '']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    name="Income"
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    name="Expenses"
                    stroke="#EF4444" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <p className="text-gray-600 dark:text-gray-400">No trend data yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Add transactions to see monthly trends</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions & Weekly Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Transactions</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dashboardData.recentTransactions.length} total
            </span>
          </div>
          <div className="space-y-4">
            {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <span className="text-xl">
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(parseFloat(transaction.amount) || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.type}
                  </p>
                </div>
              </div>
            ))}
            {dashboardData.recentTransactions.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600 dark:text-gray-400">No transactions yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Start adding transactions to see them here</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Spending Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Weekly Spending Trend</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              This Week
            </span>
          </div>
          {dashboardData.weeklySpending.some(day => day.amount > 0) ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.weeklySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${parseFloat(value).toFixed(2)}`, 'Spent']}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      name="Daily Spending"
                      radius={[4, 4, 0, 0]}
                    >
                      {dashboardData.weeklySpending.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.amount > 200 ? '#EF4444' : entry.amount > 100 ? '#F59E0B' : '#10B981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    ${dashboardData.weeklySpending.reduce((sum, day) => sum + (day.amount || 0), 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg/Day</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    ${(dashboardData.weeklySpending.reduce((sum, day) => sum + (day.amount || 0), 0) / 7).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Highest</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">
                    ${Math.max(...dashboardData.weeklySpending.map(d => d.amount || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-gray-600 dark:text-gray-400">No weekly spending data</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Add expenses to see weekly patterns</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            setLoading(true);
            fetchDashboardData();
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium flex items-center gap-2"
        >
          <span className="text-lg">🔄</span>
          Refresh Dashboard Data
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Finance AI Dashboard • Data updates in real-time • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default EnhancedDashboard;