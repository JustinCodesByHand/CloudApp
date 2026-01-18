# Loading Screen Implementation Guide

## Overview
A professional loading screen system has been implemented to replace blank white screens during page loads. Shows dark background with animated placeholders and different loading variants.

## Features
- **Dark gradient background** (Slate blue theme matching your app)
- **Animated placeholder bars** with shimmer effect
- **Multiple loading variants** (dashboard, transactions, recurring expenses, auth)
- **Large emoji icons** for visual appeal
- **Pulsing message text** with smooth animations
- **Global state management** using React Context

## Components Created

### 1. LoadingScreen.jsx
Main loading screen component displaying the UI.

**Variants Available:**
- `default` - Generic loading screen
- `dashboard` - Dashboard loading (📈)
- `transactions` - Transactions loading (📝)
- `recurring` - Recurring expenses loading (🔄)
- `auth` - Authentication loading (🔐)

**Usage:**
```jsx
<LoadingScreen variant="transactions" message="Loading..." />
```

### 2. LoadingWrapper.jsx
Simple wrapper component for conditional rendering.

**Usage:**
```jsx
<LoadingWrapper isLoading={loading} variant="dashboard">
  <YourComponent />
</LoadingWrapper>
```

### 3. useLoading Hook (useLoading.js)
Custom hook to access loading context from any component.

**Usage:**
```jsx
const { setIsLoading, setLoadingVariant } = useLoading();

// Show loading
setIsLoading(true);
setLoadingVariant('transactions');

// Hide loading
setIsLoading(false);
```

## Updated Components

### App.jsx
- Added `LoadingContext` for global state
- Imported `LoadingScreen` component
- Added state for `isLoading` and `loadingVariant`
- Wraps all routes with context provider
- Displays loading screen when `isLoading` is true

### TransactionsTable.jsx
- Integrated loading screen
- Shows loading when fetching transactions
- Uses `useLoading` hook

### EnhancedDashboard.jsx
- Integrated loading screen
- Shows loading when fetching dashboard data
- Uses `useLoading` hook

### RecurringExpenses.jsx
- Integrated loading screen
- Shows loading when fetching recurring expenses
- Uses `useLoading` hook

## How to Use in Your Components

### Basic Usage
```jsx
import { useLoading } from '../hooks/useLoading';

function MyComponent() {
  const { setIsLoading, setLoadingVariant } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setLoadingVariant('dashboard'); // or 'transactions', 'recurring', etc.
      
      try {
        // Your async code here
        await fetch('/api/data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return <div>Your content</div>;
}
```

### With Promise.finally()
```jsx
setIsLoading(true);
setLoadingVariant('transactions');

fetchTransactions()
  .then(data => setTransactions(data))
  .catch(error => setError(error))
  .finally(() => setIsLoading(false));
```

### With Async/Await
```jsx
const handleLoadData = async () => {
  setIsLoading(true);
  setLoadingVariant('dashboard');
  
  try {
    const response = await fetch('/api/dashboard');
    const data = await response.json();
    setDashboardData(data);
  } catch (error) {
    setError(error);
  } finally {
    setIsLoading(false);
  }
};
```

## Customizing the Loading Screen

### Change Colors
Edit `LoadingScreen.jsx` line with `background: 'linear-gradient(...)'`:
```jsx
background: 'linear-gradient(135deg, #your-color-1 0%, #your-color-2 50%, #your-color-1 100%)',
```

### Add New Variants
In `LoadingScreen.jsx`, add to the `variants` object:
```jsx
const variants = {
  // ... existing variants
  myNewPage: {
    icon: '🎨',
    title: 'My Page',
    message: 'Loading my page...'
  }
};
```

Then use it:
```jsx
setLoadingVariant('myNewPage');
```

### Adjust Animation Speed
Modify the animation timing in the `@keyframes` CSS:
```jsx
animation: 'pulse 1.5s ease-in-out infinite', // Change 1.5s to faster/slower
```

### Change Loading Message
Pass custom message to LoadingScreen:
```jsx
<LoadingScreen variant="dashboard" message="Crunching numbers..." />
```

## Available Loading States

| Variant | Icon | Message | Use Case |
|---------|------|---------|----------|
| `default` | 📊 | Loading your dashboard... | Generic loading |
| `dashboard` | 📈 | Preparing your financial overview... | Dashboard page |
| `transactions` | 📝 | Loading your transactions... | Transactions page |
| `recurring` | 🔄 | Loading your recurring expenses... | Recurring expenses page |
| `auth` | 🔐 | Verifying your credentials... | Authentication |

## Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses CSS animations (no external animation libraries needed)
- MUI Skeleton component for shimmer effect

## Performance Notes
- Loading screen uses `position: fixed` and `z-index: 9999` to overlay content
- Component is lightweight (pure CSS animations)
- No performance impact on page load times

## Troubleshooting

### Loading screen not appearing
1. Check that `LoadingContext.Provider` wraps your app in `App.jsx`
2. Verify `setIsLoading(true)` is called before data fetching
3. Ensure you're calling `setIsLoading(false)` after fetch completes

### Loading screen staying on screen
- Make sure to call `setIsLoading(false)` in a `.finally()` block
- Check browser console for errors that might prevent finally execution

### Wrong variant showing
- Verify variant name matches exactly (case-sensitive)
- Check `setLoadingVariant()` is called before `setIsLoading(true)`

## Example - Complete Integration

```jsx
import React, { useEffect, useState } from 'react';
import { useLoading } from '../hooks/useLoading';

function CompleteExample() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { setIsLoading, setLoadingVariant } = useLoading();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadingVariant('transactions'); // Show transactions loading screen

      try {
        const response = await fetch('http://localhost:5000/transactions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) throw new Error('Failed to fetch');

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // Hide loading screen
      }
    };

    loadData();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!data) return null; // Loading screen already showing

  return <div>{/* Your data here */}</div>;
}

export default CompleteExample;
```

## Next Steps
1. Test the loading screen by navigating between pages
2. Customize variants to match your specific pages
3. Add loading screens to any other data-fetching components
4. Adjust colors and animations to match your brand

