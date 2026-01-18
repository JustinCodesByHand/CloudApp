import { useState, useCallback } from 'react';
import transactionService from '../services/transactionService';
import { DEFAULT_TRANSACTION, TOAST_CONFIG } from '../constants/transactionConstants';

/**
 * Hook for managing transactions list
 */
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.fetchTransactions(limit);
      setTransactions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = useCallback(async (transaction) => {
    try {
      await transactionService.addTransaction(transaction);
      await fetchTransactions();
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Failed to add transaction';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      await transactionService.deleteTransaction(transactionId);
      await fetchTransactions();
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete transaction';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    setTransactions,
  };
};

/**
 * Hook for managing transaction form state
 */
export const useTransactionForm = (initialState = DEFAULT_TRANSACTION) => {
  const [formData, setFormData] = useState(initialState);
  const [activeField, setActiveField] = useState('description');

  const updateField = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value,
    }));
  }, []);

  const updateTransaction = useCallback((transaction) => {
    setFormData(transaction);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setActiveField('description');
  }, [initialState]);

  const adjustAmount = useCallback((delta) => {
    const currentAmount = parseFloat(formData.amount) || 0;
    const newAmount = Math.max(0, currentAmount + delta);
    setFormData((prev) => ({
      ...prev,
      amount: newAmount % 1 === 0 ? newAmount : parseFloat(newAmount.toFixed(2)),
    }));
  }, [formData.amount]);

  return {
    formData,
    setFormData,
    activeField,
    setActiveField,
    updateField,
    updateTransaction,
    resetForm,
    adjustAmount,
  };
};

/**
 * Hook for managing OCR processing
 */
export const useOCR = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);

  const resetOCR = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setOcrText('');
    setParsedTransactions([]);
    setImagePreview(null);
    setError(null);
  }, []);

  const startOCR = useCallback(() => {
    setUploading(true);
    setProgress(0);
    setOcrText('');
    setParsedTransactions([]);
    setError(null);
  }, []);

  const completeOCR = useCallback((text, transactions) => {
    setUploading(false);
    setOcrText(text);
    setParsedTransactions(transactions);
  }, []);

  const handleOCRError = useCallback((errorMsg) => {
    setUploading(false);
    setError(errorMsg);
  }, []);

  return {
    uploading,
    setUploading,
    progress,
    setProgress,
    ocrText,
    setOcrText,
    parsedTransactions,
    setParsedTransactions,
    imagePreview,
    setImagePreview,
    error,
    setError,
    resetOCR,
    startOCR,
    completeOCR,
    handleOCRError,
  };
};

/**
 * Hook for managing toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = TOAST_CONFIG.INFO_DURATION) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);

    return id;
  }, []);

  const showSuccess = useCallback(
    (message) => showToast(message, 'success', TOAST_CONFIG.SUCCESS_DURATION),
    [showToast]
  );

  const showError = useCallback(
    (message) => showToast(message, 'error', TOAST_CONFIG.ERROR_DURATION),
    [showToast]
  );

  const showInfo = useCallback(
    (message) => showToast(message, 'info', TOAST_CONFIG.INFO_DURATION),
    [showToast]
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast,
  };
};
