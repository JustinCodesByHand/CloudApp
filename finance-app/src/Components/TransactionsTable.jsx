import React, { useRef, useEffect, useState } from 'react';
import Picker from 'react-mobile-picker';
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES, AMOUNT_ADJUSTMENT } from '../constants/transactionConstants';

/**
 * Helper to generate a singular column of dates (Last 30 days to Next 14 days)
 */
const DATE_OPTIONS = Array.from({ length: 45 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 30 + i);
  return d.toISOString().split('T')[0];
});

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  if (dateStr === new Date().toISOString().split('T')[0]) return "Today";
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Transaction Form Component with Mobile Wheel Pickers and Haptics
 */
const TransactionForm = ({
  formData,
  activeField,
  onFieldChange,
  onActiveFieldChange,
  onSubmit,
  onImageUploadClick,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const hapticRef = useRef(null);
  
  const descriptionRef = useRef(null);
  const dateRef = useRef(null);
  const amountRef = useRef(null);
  const categoryRef = useRef(null);
  const submitRef = useRef(null);

  // Detect mobile and handle resizing
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (activeField === 'description' && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [activeField]);

  // Haptic feedback trigger for iOS
  const triggerHaptic = () => {
    if (hapticRef.current) hapticRef.current.click();
  };

  const handleWheelChange = (name, value) => {
    onFieldChange(name, value);
    triggerHaptic();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  // Keep desktop keyboard accessibility
  const handleKeyDown = (e, fieldName) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      switch (fieldName) {
        case 'description':
          if (e.shiftKey) { submitRef.current?.focus(); onActiveFieldChange('submit'); }
          else { dateRef.current?.focus(); onActiveFieldChange('date'); }
          break;
        case 'date':
          if (e.shiftKey) { descriptionRef.current?.focus(); onActiveFieldChange('description'); }
          else { amountRef.current?.focus(); onActiveFieldChange('amount'); }
          break;
        case 'amount':
          if (e.shiftKey) { dateRef.current?.focus(); onActiveFieldChange('date'); }
          else { categoryRef.current?.focus(); onActiveFieldChange('category'); }
          break;
        default: break;
      }
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-pink-700">
      {/* Hidden checkbox for iOS haptic vibration workaround */}
      <input type="checkbox" ref={hapticRef} className="hidden" />

      <h2 className="text-xl font-bold mb-6 text-white">Add New Transaction</h2>
      
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          {/* Description - Standard Input */}
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
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none transition-all ${
                activeField === 'description' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-600'
              }`}
              placeholder="e.g., Groceries"
              required
            />
          </div>

          {/* Date - Wheel Picker for Mobile */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Date</label>
            {isMobile ? (
              <div className="h-32 bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
                <Picker
                  value={{ date: formData.date }}
                  onChange={({ date }) => handleWheelChange('date', date)}
                >
                  <Picker.Column name="date">
                    {DATE_OPTIONS.map(d => (
                      <Picker.Item key={d} value={d}>
                        {({ selected }) => (
                          <div className={`text-sm ${selected ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>
                            {formatDateLabel(d)}
                          </div>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              </div>
            ) : (
              <input
                ref={dateRef}
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, 'date')}
                onFocus={() => onActiveFieldChange('date')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                required
              />
            )}
          </div>

          {/* Amount - Wheel Picker for Mobile */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Amount ($)</label>
            {isMobile ? (
              <div className="h-32 bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
                <Picker
                  value={{ amount: Math.floor(formData.amount).toString() }}
                  onChange={({ amount }) => handleWheelChange('amount', parseFloat(amount))}
                >
                  <Picker.Column name="amount">
                    {Array.from({ length: 2001 }, (_, i) => i.toString()).map(val => (
                      <Picker.Item key={val} value={val}>
                        {({ selected }) => (
                          <div className={`text-lg ${selected ? 'text-green-400 font-bold' : 'text-gray-500'}`}>
                            ${val}
                          </div>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              </div>
            ) : (
              <input
                ref={amountRef}
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, 'amount')}
                onFocus={() => onActiveFieldChange('amount')}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="0.00"
                required
              />
            )}
          </div>

          {/* Category - Wheel Picker for Mobile */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Category</label>
            {isMobile ? (
              <div className="h-32 bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
                <Picker
                  value={{ category: formData.category }}
                  onChange={({ category }) => handleWheelChange('category', category)}
                >
                  <Picker.Column name="category">
                    {TRANSACTION_CATEGORIES.map(cat => (
                      <Picker.Item key={cat} value={cat}>
                        {({ selected }) => (
                          <div className={`text-sm ${selected ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>
                            {cat}
                          </div>
                        )}
                      </Picker.Item>
                    ))}
                  </Picker.Column>
                </Picker>
              </div>
            ) : (
              <select
                ref={categoryRef}
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none"
              >
                {TRANSACTION_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            )}
          </div>

          {/* Type - Wheel Picker for Mobile */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">Type</label>
            {isMobile ? (
               <div className="h-32 bg-gray-900 rounded-lg border border-gray-600 overflow-hidden">
               <Picker
                 value={{ type: formData.type }}
                 onChange={({ type }) => handleWheelChange('type', type)}
               >
                 <Picker.Column name="type">
                   {[TRANSACTION_TYPES.EXPENSE, TRANSACTION_TYPES.INCOME].map(t => (
                     <Picker.Item key={t} value={t}>
                       {({ selected }) => (
                         <div className={`text-sm ${selected ? 'text-pink-400 font-bold' : 'text-gray-500'}`}>
                           {t.toUpperCase()}
                         </div>
                       )}
                     </Picker.Item>
                   ))}
                 </Picker.Column>
               </Picker>
             </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onFieldChange('type', TRANSACTION_TYPES.EXPENSE)}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    formData.type === TRANSACTION_TYPES.EXPENSE ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => onFieldChange('type', TRANSACTION_TYPES.INCOME)}
                  className={`py-3 rounded-lg font-medium transition-all ${
                    formData.type === TRANSACTION_TYPES.INCOME ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Income
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          ref={submitRef}
          type="submit"
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium text-lg flex items-center justify-center gap-3"
        >
          ➕ Add Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
