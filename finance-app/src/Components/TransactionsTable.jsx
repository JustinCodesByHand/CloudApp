import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';
import TransactionTableDisplay from './TransactionTableDisplay';
import ReceiptScanner from './ReceiptScanner';
import { ToastContainer } from './Toast';
import {
  useTransactions,
  useTransactionForm,
  useOCR,
  useToast,
} from '../hooks';

/**
 * Main Transactions Table Component
 * Refactored to use custom hooks, services, and split components
 */
function TransactionsTable() {
  const navigate = useNavigate();
  const [showImageUpload, setShowImageUpload] = React.useState(false);
  const descriptionRef = useRef(null);

  // Use custom hooks
  const transactions = useTransactions();
  const form = useTransactionForm();
  const ocr = useOCR();
  const toast = useToast();

  // Fetch transactions on mount
  useEffect(() => {
    transactions.fetchTransactions();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await transactions.addTransaction(form.formData);

      if (result.success) {
        form.resetForm();
        descriptionRef.current?.focus();
        toast.showSuccess('✅ Transaction added successfully!');
      } else {
        toast.showError(`Error adding transaction: ${result.error}`);
      }
    } catch (error) {
      toast.showError(`Error: ${error.message}`);
    }
  };

  // Handle receipt scanner callbacks
  const handleSaveTransaction = async () => {
    if (ocr.parsedTransactions.length === 0) return;

    try {
      const result = await transactions.addTransaction(ocr.parsedTransactions[0]);

      if (result.success) {
        toast.showSuccess('✅ Transaction saved from receipt!');
        ocr.resetOCR();
      } else {
        toast.showError('Error saving transaction');
      }
    } catch (error) {
      toast.showError(`Error: ${error.message}`);
    }
  };

  const handleEditInForm = () => {
    if (ocr.parsedTransactions.length > 0) {
      form.updateTransaction(ocr.parsedTransactions[0]);
      descriptionRef.current?.focus();
    }
  };

  const handleOCRSuccess = (extractedText, parsedTransactions) => {
    ocr.completeOCR(extractedText, parsedTransactions);
    if (parsedTransactions.length > 0 && parsedTransactions[0].amount > 0) {
      const tx = parsedTransactions[0];
      const msg = `✅ AI found: ${tx.description} - $${tx.amount.toFixed(2)} (${tx.category})`;
      toast.showSuccess(msg);
    }
  };

  const handleOCRError = (errorMsg) => {
    ocr.handleOCRError(errorMsg);
    toast.showError(errorMsg);
  };

  if (transactions.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transaction Management
          </h1>
          <p className="text-gray-400 mt-2">Add, view, and manage your financial transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Receipt Scanner Section */}
      <ReceiptScanner
        isOpen={showImageUpload}
        onToggle={() => setShowImageUpload(!showImageUpload)}
        imagePreview={ocr.imagePreview}
        onImageSelect={ocr.setImagePreview}
        uploading={ocr.uploading}
        progress={ocr.progress}
        ocrText={ocr.ocrText}
        parsedTransactions={ocr.parsedTransactions}
        onSaveTransaction={handleSaveTransaction}
        onEditInForm={handleEditInForm}
        onScanAnother={ocr.resetOCR}
        onError={handleOCRError}
        onSuccess={handleOCRSuccess}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Form */}
        <div className="lg:col-span-3">
          <TransactionForm
            formData={form.formData}
            activeField={form.activeField}
            onFieldChange={form.updateField}
            onActiveFieldChange={form.setActiveField}
            onSubmit={handleSubmit}
            onImageUploadClick={() => setShowImageUpload(true)}
          />
        </div>

        {/* Transactions Table */}
        <div className="lg:col-span-3">
          <TransactionTableDisplay
            transactions={transactions.transactions}
            onScanReceipt={() => setShowImageUpload(true)}
            onRefresh={() => transactions.fetchTransactions()}
            onAddAnother={() => {
              form.resetForm();
              descriptionRef.current?.focus();
            }}
            onFirstTransactionClick={() => setShowImageUpload(true)}
          />
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}

export default TransactionsTable;
