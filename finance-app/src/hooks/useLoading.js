import { useContext } from 'react';
import { LoadingContext } from '../App';

/**
 * Hook to use loading context
 * 
 * Usage:
 * const { setIsLoading, setLoadingVariant } = useLoading();
 * 
 * // Show loading
 * useEffect(() => {
 *   setIsLoading(true);
 *   setLoadingVariant('transactions');
 *   
 *   fetchData().finally(() => {
 *     setIsLoading(false);
 *   });
 * }, []);
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  
  if (!context) {
    throw new Error('useLoading must be used within LoadingContext.Provider');
  }
  
  return context;
};

export default useLoading;
