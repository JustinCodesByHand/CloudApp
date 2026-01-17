import React, { useRef, useEffect } from 'react';
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES, AMOUNT_ADJUSTMENT } from '../constants/transactionConstants';

/**
 * Transaction Form Component
 */
const TransactionForm = ({
  formData,
  activeField,
  onFieldChange,
  onActiveFieldChange,
  onSubmit,
  onImageUploadClick,
}) => {
  const descriptionRef = useRef(null);
  const dateRef = useRef(null);
  const amountRef = useRef(null);
  const categoryRef = useRef(null);
  const submitRef = useRef(null);

  useEffect(() => {
    if (activeField === 'description' && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [activeField]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  const handleAmountWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -AMOUNT_ADJUSTMENT : AMOUNT_ADJUSTMENT;
    const currentAmount = parseFloat(formData.amount) || 0;
    const newAmount = Math.max(0, currentAmount + delta);

    onFieldChange('amount', newAmount % 1 === 0 ? newAmount : parseFloat(newAmount.toFixed(2)));
  };

  const handleAmountKeyDown = (e) => {
    const currentAmount = parseFloat(formData.amount) || 0;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newAmount = currentAmount + AMOUNT_ADJUSTMENT;
      onFieldChange('amount', newAmount % 1 === 0 ? newAmount : parseFloat(newAmount.toFixed(2)));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newAmount = Math.max(0, currentAmount - AMOUNT_ADJUSTMENT);
      onFieldChange('amount', newAmount % 1 === 0 ? newAmount : parseFloat(newAmount.toFixed(2)));
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      categoryRef.current?.focus();
      onActiveFieldChange('category');
    }
  };

  const handleCategoryKeyDown = (e) => {
    const currentIndex = TRANSACTION_CATEGORIES.indexOf(formData.category);

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const newIndex = (currentIndex - 1 + TRANSACTION_CATEGORIES.length) % TRANSACTION_CATEGORIES.length;
      onFieldChange('category', TRANSACTION_CATEGORIES[newIndex]);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const newIndex = (currentIndex + 1) % TRANSACTION_CATEGORIES.length;
      onFieldChange('category', TRANSACTION_CATEGORIES[newIndex]);
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      onActiveFieldChange('type');
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      amountRef.current?.focus();
      onActiveFieldChange('amount');
    }
  };

  const handleKeyDown = (e, fieldName) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      switch (fieldName) {
        case 'description':
          if (e.shiftKey) {
            submitRef.current?.focus();
            onActiveFieldChange('submit');
          } else {
            dateRef.current?.focus();
            onActiveFieldChange('date');
          }
          break;
        case 'date':
          if (e.shiftKey) {
            descriptionRef.current?.focus();
            onActiveFieldChange('description');
          } else {
            amountRef.current?.focus();
            onActiveFieldChange('amount');
          }
          break;
        case 'amount':
          if (e.shiftKey) {
            dateRef.current?.focus();
            onActiveFieldChange('date');
          } else {
            categoryRef.current?.focus();
            onActiveFieldChange('category');
          }
          break;
        case 'category':
          if (e.shiftKey) {
            amountRef.current?.focus();
            onActiveFieldChange('amount');
          } else {
            onActiveFieldChange('type');
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-pink-700">
      <h2 className="text-xl font-bold mb-6 text-white">Add New Transaction</h2>
      <p className="text-gray-400 mb-6 text-sm">
        💡 Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Tab</kbd> to navigate,
        <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mx-1">↑↓</kbd> arrows to adjust values (±${AMOUNT_ADJUSTMENT}),
        <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mx-1">←→</kbd> to change category
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Horizontal Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Description</label>
            <input
              ref={descriptionRef}
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, 'description')}
              onFocus={() => onActiveFieldChange('description')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all ${activeField === 'description'
                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                  : 'border-gray-600 hover:border-gray-500'
                }`}
              placeholder="e.g., Groceries"
              required
            />
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Date</label>
            <input
              ref={dateRef}
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, 'date')}
              onFocus={() => onActiveFieldChange('date')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-all ${activeField === 'date'
                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                  : 'border-gray-600 hover:border-gray-500'
                }`}
              required
            />
          </div>

          {/* Amount Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Amount ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                ref={amountRef}
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                onWheel={handleAmountWheel}
                onKeyDown={handleAmountKeyDown}
                onFocus={() => onActiveFieldChange('amount')}
                className={`w-full pl-8 pr-12 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-all ${activeField === 'amount'
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-gray-600 hover:border-gray-500'
                  }`}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const currentAmount = parseFloat(formData.amount) || 0;
                    onFieldChange('amount', currentAmount + AMOUNT_ADJUSTMENT);
                  }}
                  className="text-gray-400 hover:text-white text-xs w-6 h-6 flex items-center justify-center hover:bg-gray-600 rounded"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentAmount = parseFloat(formData.amount) || 0;
                    onFieldChange('amount', Math.max(0, currentAmount - AMOUNT_ADJUSTMENT));
                  }}
                  className="text-gray-400 hover:text-white text-xs w-6 h-6 flex items-center justify-center hover:bg-gray-600 rounded"
                >
                  ▼
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500">Scroll or use ↑↓ for ±${AMOUNT_ADJUSTMENT}</p>
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <div className="relative">
              <select
                ref={categoryRef}
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                onKeyDown={handleCategoryKeyDown}
                onFocus={() => onActiveFieldChange('category')}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none appearance-none transition-all cursor-pointer ${activeField === 'category'
                    ? 'border-blue-500 ring-2 ring-blue-500/50'
                    : 'border-gray-600 hover:border-gray-500'
                  }`}
              >
                {TRANSACTION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                ▼
              </div>
            </div>
            <p className="text-xs text-gray-500">Use ←→ or scroll to cycle</p>
          </div>

          {/* Type Buttons */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Type</label>
            <div className="grid grid-cols-2 gap-2 h-full">
              <button
                type="button"
                onClick={() => onFieldChange('type', TRANSACTION_TYPES.EXPENSE)}
                onFocus={() => onActiveFieldChange('type')}
                className={`h-full px-4 py-3 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2 ${formData.type === TRANSACTION_TYPES.EXPENSE
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg ring-2 ring-red-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                <span>💸</span> Expense
              </button>
              <button
                type="button"
                onClick={() => onFieldChange('type', TRANSACTION_TYPES.INCOME)}
                onFocus={() => onActiveFieldChange('type')}
                className={`h-full px-4 py-3 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-2 ${formData.type === TRANSACTION_TYPES.INCOME
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg ring-2 ring-green-500/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                <span>💰</span> Income
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-700">
          <button
            ref={submitRef}
            type="submit"
            onFocus={() => onActiveFieldChange('submit')}
            className={`w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium text-lg flex items-center justify-center gap-3 ${activeField === 'submit' ? 'ring-4 ring-blue-500/30' : ''
              }`}
          >
            <span className="text-xl">➕</span>
            Add Transaction (Press Enter)
          </button>
          <p className="text-center text-gray-500 text-sm mt-2">
            Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd> to submit
          </p>
        </div>
      </form>
    </div>
  );
};
