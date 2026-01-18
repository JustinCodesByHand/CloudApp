import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Refresh as RefreshIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';
import { useLoading } from '../hooks/useLoading';

function EnhancedDashboard({ aiInsight, onGetAdvice }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [awsLoading, setAwsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setIsLoading, setLoadingVariant } = useLoading();
  
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
    setIsLoading(true);
    setLoadingVariant('dashboard');
    fetchDashboardData().finally(() => {
      setIsLoading(false);
    });
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

  // Add color to spending by category data
  const spendingByColorCategory = dashboardData.spendingByCategory.map(cat => ({
    ...cat,
    stroke: getCategoryColor(cat.name),
    fill: getCategoryColor(cat.name),
  }));

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
      <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography color="text.secondary">Loading your financial dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Finance AI Dashboard
            </Typography>
            {user && (
              <Typography variant="body2" color="text.secondary">
                Welcome back, {user.username}!
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Balance with Budget Overview Meter */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Balance
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                ${dashboardData.balance.toFixed(2)}
              </Typography>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Budget Used</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {budgetUsed.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(budgetUsed, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: budgetUsed > 80 ? '#EF4444' : '#3C82F6',
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Income Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Income
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>
                    ${dashboardData.totalIncome.toFixed(2)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#10B981', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Expenses Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Expenses
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#EF4444' }}>
                    ${dashboardData.totalExpenses.toFixed(2)}
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, color: '#EF4444', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Insight Display */}
      {aiInsight && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
          <CardHeader title="AI Insight" />
          <CardContent>
            <Typography variant="body2">
              {aiInsight}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Top Actions Bar */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          onClick={handleGetAIAdvice}
          disabled={awsLoading}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}
        >
          {awsLoading ? 'Loading AI...' : 'Get AI Insights'}
        </Button>
      </Box>

      {/* AI Insight Display */}
      {aiInsight && (
        <Card sx={{ mb: 4, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
          <CardHeader title="AI Insight" />
          <CardContent>
            <Typography variant="body2">
              {aiInsight}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Monthly Trend - Line Chart */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Monthly Trend" />
            <CardContent>
              {dashboardData.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#3C82F6" strokeWidth={2} name="Income" dot={{ fill: '#3C82F6', r: 4 }} />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" dot={{ fill: '#EF4444', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Spending - Bar Chart */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Weekly Spending" />
            <CardContent>
              {dashboardData.weeklySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.weeklySpending}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#8B5CF6" name="Spending" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Spending by Category - Radar Chart */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Spending by Category" />
            <CardContent>
              {dashboardData.spendingByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={spendingByColorCategory}>
                    <PolarGrid stroke="#e0e0e0" />
                    <PolarAngleAxis dataKey="name" stroke="#6B7280" />
                    <PolarRadiusAxis stroke="#6B7280" />
                    {dashboardData.spendingByCategory.map((entry, index) => (
                      <Radar
                        key={`radar-${index}`}
                        name={entry.name}
                        dataKey="value"
                        stroke={getCategoryColor(entry.name)}
                        fill={getCategoryColor(entry.name)}
                        fillOpacity={0.6}
                      />
                    ))}
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value) => `$${value.toFixed(2)}`}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default EnhancedDashboard;