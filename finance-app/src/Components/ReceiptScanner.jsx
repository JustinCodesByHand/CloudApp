import React, { useRef } from 'react';
import Tesseract from 'tesseract.js';
import { parseReceiptText } from '../utils/transactionUtils';
import { formatDate } from '../utils/transactionUtils';
import { OCR_CONFIG } from '../constants/transactionConstants';

/**
 * Receipt Scanner Component
 */
const ReceiptScanner = ({
  isOpen,
  onToggle,
  imagePreview,
  onImageSelect,
  uploading,
  progress,
  ocrText,
  parsedTransactions,
  onSaveTransaction,
  onEditInForm,
  onScanAnother,
  onError,
  onSuccess,
}) => {
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result);
        processImageWithOCR(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageWithOCR = async (imageFile) => {
    try {
      console.log('Starting OCR processing...');

      const result = await Tesseract.recognize(imageFile, OCR_CONFIG.LANGUAGE, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const currentProgress = Math.round(m.progress * 100);
            if (currentProgress % OCR_CONFIG.PROGRESS_THRESHOLD === 0) {
              // Update progress at specified intervals
            }
          }
        },
      });

      const extractedText = result.data.text;
      console.log('OCR extracted text:', extractedText);

      // Parse the text with our AI parser
      const transactions = parseReceiptText(extractedText);

      if (transactions.length > 0 && transactions[0].amount > 0) {
        // Return both the text and transactions for the parent to handle
        onSuccess(extractedText, transactions);
        const tx = transactions[0];
        const successMsg = `✅ AI found: ${tx.description} - $${tx.amount.toFixed(2)} (${tx.category})`;
        return { success: true, message: successMsg, text: extractedText, transactions };
      } else {
        const errorMsg = '⚠️ Could not find transaction details in the receipt.';
        onError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      const errorMsg = 'Error processing receipt image';
      onError(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  if (!isOpen) {
    return (
      <div className="mb-8">
        <button
          onClick={onToggle}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center gap-2"
        >
          <span className="text-lg">📸</span>
          Scan Receipt (AI Focus)
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <button
        onClick={onToggle}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium flex items-center gap-2"
      >
        <span className="text-lg">📸</span>
        Hide Receipt Scanner
      </button>

      <div className="mt-4 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">AI Receipt Scanner</h3>
        <p className="text-gray-400 mb-4">
          AI will find: <span className="text-blue-300">Total Price</span>,
          <span className="text-green-300"> Date</span>, and
          <span className="text-purple-300"> Spending Type</span>
        </p>

        <div className="space-y-4">
          {imagePreview ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Preview */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-2">Receipt Preview</h4>
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full max-w-md rounded-lg border border-gray-600"
                  />
                </div>

                {/* OCR Results */}
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-2">AI Analysis Results</h4>

                  {uploading ? (
                    <div className="bg-gray-900/50 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-400">AI is analyzing receipt...</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">{progress}% complete</p>
                      <p className="text-gray-500 text-xs mt-3">Looking for: Total, Date, Store Type</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* AI Findings */}
                      {parsedTransactions.length > 0 && (
                        <div className="bg-gray-900/50 p-5 rounded-lg border border-green-500/30">
                          <h5 className="text-lg font-bold text-white mb-4">✅ AI Found:</h5>

                          <div className="space-y-4">
                            {/* Store & Type */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-400">Store</p>
                                <p className="text-white font-semibold">{parsedTransactions[0].description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400">Spending Type</p>
                                <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm font-medium">
                                  {parsedTransactions[0].category}
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="bg-gray-800/70 p-4 rounded-lg">
                              <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                              <p className="text-2xl font-bold text-red-400">
                                ${parsedTransactions[0].amount.toFixed(2)}
                              </p>
                            </div>

                            {/* Date */}
                            <div>
                              <p className="text-sm text-gray-400 mb-1">Date</p>
                              <p className="text-white font-medium">{formatDate(parsedTransactions[0].date)}</p>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={onSaveTransaction}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-medium"
                            >
                              Save Transaction
                            </button>
                            <button
                              onClick={onEditInForm}
                              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium"
                            >
                              Edit in Form
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Raw OCR Text (collapsible) */}
                      {ocrText && (
                        <details className="bg-gray-900/30 rounded-lg">
                          <summary className="px-4 py-3 text-gray-300 cursor-pointer hover:text-white">
                            📋 View Extracted Text
                          </summary>
                          <div className="px-4 pb-4">
                            <div className="bg-gray-900/50 p-3 rounded text-gray-400 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {ocrText.substring(0, 1000)}
                              {ocrText.length > 1000 ? '...' : ''}
                            </div>
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onScanAnother}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
                >
                  Scan Another
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-gray-400 mb-4">Upload receipt image</p>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">AI will automatically find:</p>
              <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="text-blue-300 text-sm font-medium">Total Price</p>
                </div>
                <div className="bg-green-900/30 p-3 rounded-lg">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-green-300 text-sm font-medium">Date</p>
                </div>
                <div className="bg-purple-900/30 p-3 rounded-lg">
                  <div className="text-2xl mb-2">🏷️</div>
                  <p className="text-purple-300 text-sm font-medium">Spending Type</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer inline-block"
              >
                Select Receipt Image
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner;
