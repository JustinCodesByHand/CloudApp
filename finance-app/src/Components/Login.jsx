import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setError('Login failed. No token received.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/health');
      alert(`Backend is running!\nStatus: ${response.data.status}`);
    } catch (err) {
      alert('Backend not running. Start with: npm run dev');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3}>
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Finance AI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your financial dashboard
            </Typography>
          </Box>

          {/* Login Card */}
          <Card
            sx={{
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />

                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    type="submit"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      mt: 2,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                      Sign up
                    </Link>
                  </Typography>
                </Stack>
              </form>
            </CardContent>
          </Card>

          {/* Test Backend Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={testBackendConnection}
            sx={{ mt: 2 }}
          >
            Test Backend Connection
          </Button>

          {/* Demo Credentials */}
          <Card sx={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <CardContent>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.light' }}>
                Demo Credentials:
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 1 }}>
                Demo accounts are available for testing.
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
                Please use the demo credentials provided by your administrator.
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

export default Login;