import React from 'react';
import LoadingScreen from './LoadingScreen';

/**
 * Loading Wrapper Component
 * Manages loading state and displays appropriate loading screen
 * 
 * Usage:
 * <LoadingWrapper isLoading={loading} variant="transactions">
 *   <YourComponent />
 * </LoadingWrapper>
 */
const LoadingWrapper = ({ 
  isLoading, 
  variant = 'default', 
  message,
  children 
}) => {
  if (isLoading) {
    return <LoadingScreen variant={variant} message={message} />;
  }

  return <>{children}</>;
};

export default LoadingWrapper;
