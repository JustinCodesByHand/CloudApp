import React from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';

/**
 * Loading Screen Component - MUI Version with Custom GIFs
 * Shows while pages are loading with dark background and custom loading animations
 */
const LoadingScreen = ({ variant = 'default', message = 'Loading...' }) => {
  const variants = {
    default: {
      gif: '/Loading-animations/Dashboard1.gif',
      title: 'Finance AI',
      message: 'Loading your dashboard...'
    },
    dashboard: {
      gif: '/Loading-animations/Dashboard1.gif',
      title: 'Dashboard',
      message: 'Preparing your financial overview...'
    },
    transactions: {
      gif: '/Loading-animations/Table1.gif',
      title: 'Transactions',
      message: 'Loading your transactions...'
    },
    recurring: {
      gif: '/Loading-animations/Reoccuring1.gif',
      title: 'Recurring Expenses',
      message: 'Loading your recurring expenses...'
    },
    auth: {
      gif: '/Loading-animations/Dashboard1.gif',
      title: 'Authenticating',
      message: 'Verifying your credentials...'
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ textAlign: 'center' }}>
          {/* Animated GIF */}
          <Box
            component="img"
            src={config.gif}
            alt="Loading animation"
            sx={{
              maxWidth: '100%',
              height: 'auto',
              maxHeight: 300,
              objectFit: 'contain',
            }}
          />

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            {config.title}
          </Typography>

          {/* Loading Message */}
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '0.5px',
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 0.6,
                },
                '50%': {
                  opacity: 1,
                },
              },
            }}
          >
            {config.message}
          </Typography>

          {/* Subtle tip text */}
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.4)',
              mt: 2,
              fontStyle: 'italic',
            }}
          >
            Preparing your financial data...
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoadingScreen;
