import React, { useState, useContext, createContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Repeat as RepeatIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Login from './Components/Login';
import Registration from './Components/Registration';
import EnhancedDashboard from './Components/EnhancedDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import TransactionsTable from './Components/TransactionsTable';
import RecurringExpenses from './Components/RecurringExpenses';
import LoadingScreen from './Components/LoadingScreen';

// Global Loading Context
export const LoadingContext = createContext();

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingVariant, setLoadingVariant] = useState('default');

  const isAuthenticated = !!localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  const showNav = isAuthenticated && !['/'].includes(location.pathname);

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { label: 'Recurring Expenses', icon: <RepeatIcon />, path: '/recurring-expenses' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleProfileMenuClose();
    navigate('/');
  };

  const fetchAIAdvice = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setAiInsight('Please login first');
        return;
      }

      const expressUrl = 'http://localhost:5000/ai-advice';

      const response = await fetch(expressUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAiInsight(data.insight);
      } else {
        setAiInsight('Unable to get AI insights: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('AI Advice Error:', error);
      setAiInsight('Connection error. Please check if backend is running.');
    }
  };

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Finance AI
        </Typography>
        <IconButton onClick={handleDrawerToggle} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderRight: '4px solid #6366f1',
                  paddingRight: '16px',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, setLoadingVariant }}>
      {isLoading && <LoadingScreen variant={loadingVariant} />}
      
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
        {showNav && (
          <AppBar position="fixed" sx={{ zIndex: 1201 }}>
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>

              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                Finance AI Dashboard
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0 }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      cursor: 'pointer',
                    }}
                  >
                    {user?.username?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{user?.username}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
        )}

        {showNav && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            sx={{
              '& .MuiDrawer-paper': {
                backgroundColor: '#1e293b',
                borderRight: '1px solid rgba(148, 163, 184, 0.12)',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            mt: showNav ? 8 : 0,
          }}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <EnhancedDashboard aiInsight={aiInsight} onGetAdvice={fetchAIAdvice} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recurring-expenses"
              element={
                <ProtectedRoute>
                  <RecurringExpenses />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </LoadingContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
