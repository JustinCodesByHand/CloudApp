import React from 'react';
import { formatDate } from '../utils/transactionUtils';

/**
 * Transaction Table Display Component
 */
const TransactionTable = ({
  transactions,
  onScanReceipt,
  onRefresh,
  onAddAnother,
  onFirstTransactionClick,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-400 text-lg">No transactions yet</p>
          <p className="text-gray-500 mt-2">Add your first transaction or scan a receipt!</p>
          <button
            onClick={onFirstTransactionClick}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
          >
            📸 Scan Your First Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
        <div className="flex gap-3">
          <button
            onClick={onScanReceipt}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2"
          >
            <span>📸</span>
            Scan Receipt
          </button>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Table Headers */}
        <div className="grid grid-cols-5 items-center bg-gray-800/60 rounded-t-xl p-4 border-b-2 border-gray-700 text-gray-300 font-bold">
          <div className="pl-4">Date</div>
          <div className="pl-4">Description</div>
          <div className="pl-4">Category</div>
          <div className="pl-4">Type</div>
          <div className="pr-4 text-right">Amount</div>
        </div>

        {/* Transaction Rows */}
        {transactions.map((transaction, index) => (
          <div
            key={index}
            className="grid grid-cols-5 items-center bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-700/50 hover:border-purple-500/70 hover:bg-gray-800/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            {/* Date - Column 1 */}
            <div className="text-gray-300 font-medium pl-4 group-hover:text-purple-200 transition-colors duration-200">
              {formatDate(transaction.date)}
            </div>

            {/* Description - Column 2 */}
            <div className="font-bold text-white pl-4 group-hover:text-purple-100 group-hover:scale-105 transition-all duration-200 truncate">
              {transaction.description}
            </div>

            {/* Category - Column 3 */}
            <div className="pl-4">
              <span className="px-3 py-1.5 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-600 rounded-full text-sm font-semibold text-gray-200 group-hover:border-purple-500 group-hover:text-purple-100 group-hover:bg-gradient-to-r group-hover:from-purple-900/30 group-hover:to-gray-900 transition-all duration-200">
                {transaction.category}
              </span>
            </div>

            {/* Type - Column 4 */}
            <div className="pl-4">
              <span
                className={`px-4 py-2 rounded-full font-bold border-2 transition-all duration-200 ${transaction.type === 'income'
                  ? 'border-green-700 bg-green-900/30 text-green-300 group-hover:border-green-500 group-hover:bg-green-900/50'
                  : 'border-red-700 bg-red-900/30 text-red-300 group-hover:border-red-500 group-hover:bg-red-900/50'
                  } group-hover:scale-110 group-hover:shadow-md`}
              >
                {transaction.type}
              </span>
            </div>

            {/* Amount - Column 5 */}
            <div
              className={`text-right font-extrabold text-xl pr-4 transition-all duration-200 group-hover:scale-110 ${transaction.type === 'income'
                ? 'text-green-400 group-hover:text-green-300 group-hover:drop-shadow-[0_0_12px_rgba(74,222,128,0.6)]'
                : 'text-red-400 group-hover:text-red-300 group-hover:drop-shadow-[0_0_12px_rgba(248,113,113,0.6)]'
                }`}
            >
              {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Count & Footer */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <p className="text-gray-400 text-sm">Showing {transactions.length} transactions</p>
          {transactions.length > 0 && (
            <button
              onClick={onAddAnother}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Add Another Transaction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
