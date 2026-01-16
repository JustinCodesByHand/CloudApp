import {
  PRICE_PATTERNS,
  DATE_PATTERNS,
  MONTH_NAMES,
  STORE_PATTERNS,
  KEYWORD_CATEGORIES,
} from '../constants/transactionConstants';

/**
 * Format date to a readable string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Parse total amount from receipt text
 */
export const parseTotalAmount = (text) => {
  for (const pattern of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1]);
      console.log(`💰 Found TOTAL: $${amount} using pattern: ${pattern}`);
      return amount;
    }
  }

  // Fallback: Find largest dollar amount
  const allAmounts = text.match(/\$?\s*(\d+\.\d{2})/g);
  if (allAmounts) {
    const amounts = allAmounts.map((a) => parseFloat(a.replace(/[^\d.]/g, '')));
    const largest = Math.max(...amounts.filter((a) => a > 1 && a < 10000));
    if (largest && largest !== -Infinity) {
      console.log(`💰 Using largest amount found: $${largest}`);
      return largest;
    }
  }

  return null;
};

/**
 * Parse date from receipt text
 */
export const parseReceiptDate = (text) => {
  const defaultDate = getTodayDate();

  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      try {
        let month, day, year;

        if (match[1]?.match(/[a-z]/i)) {
          // Month name format
          const monthIndex = MONTH_NAMES.indexOf(match[2].toLowerCase().substring(0, 3));
          month = monthIndex + 1;
          day = parseInt(match[1]);
          year = parseInt(match[3]);
        } else if (parseInt(match[1]) > 31) {
          // YYYY-MM-DD format
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        } else {
          // MM/DD/YY or DD/MM/YY format
          const first = parseInt(match[1]);
          const second = parseInt(match[2]);

          if (first > 12) {
            day = first;
            month = second;
          } else {
            month = first;
            day = second;
          }
          year = parseInt(match[3]);
        }

        // Fix 2-digit years
        if (year < 100) {
          year = 2000 + year;
        }

        const formattedDate = `${year}-${month
          .toString()
          .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        console.log(`📅 Found DATE: ${formattedDate}`);
        return formattedDate;
      } catch (e) {
        console.log('Date parsing error:', e);
      }
    }
  }

  return defaultDate;
};

/**
 * Detect store and spending type from receipt text
 */
export const detectStoreAndType = (text) => {
  let storeName = 'Unknown Store';
  let spendingType = 'Shopping';

  // Check for store patterns
  for (const storePattern of STORE_PATTERNS) {
    if (storePattern.pattern.test(text)) {
      storeName = storePattern.store;
      spendingType = storePattern.type;
      console.log(`🏬 Found STORE: ${storeName}, TYPE: ${spendingType}`);
      return { storeName, spendingType };
    }
  }

  // Use keyword analysis if no store pattern found
  const textLower = text.toLowerCase();

  if (KEYWORD_CATEGORIES.grocery.some((kw) => textLower.includes(kw))) {
    spendingType = 'Food';
    storeName = 'Grocery Store';
  } else if (KEYWORD_CATEGORIES.clothing.some((kw) => textLower.includes(kw))) {
    spendingType = 'Shopping';
    storeName = 'Clothing Store';
  } else if (KEYWORD_CATEGORIES.technology.some((kw) => textLower.includes(kw))) {
    spendingType = 'Technology';
    storeName = 'Electronics Store';
  } else if (KEYWORD_CATEGORIES.entertainment.some((kw) => textLower.includes(kw))) {
    spendingType = 'Entertainment';
    storeName = 'Entertainment';
  } else if (KEYWORD_CATEGORIES.restaurant.some((kw) => textLower.includes(kw))) {
    spendingType = 'Food';
    storeName = 'Restaurant';
  }

  console.log(`🏷️ Determined TYPE from keywords: ${spendingType}`);
  return { storeName, spendingType };
};

/**
 * Parse receipt text and extract transaction information
 */
export const parseReceiptText = (text) => {
  console.log('🔍 AI Parser - Looking for: TOTAL, DATE, and SPENDING TYPE');

  const totalAmount = parseTotalAmount(text);
  const receiptDate = parseReceiptDate(text);
  const { storeName, spendingType } = detectStoreAndType(text);

  const transaction = {
    description: storeName,
    amount: totalAmount || 0,
    category: spendingType,
    type: 'expense',
    date: receiptDate,
  };

  console.log('✅ AI Parsed Transaction:', transaction);
  return [transaction];
};

/**
 * Validate transaction object
 */
export const validateTransaction = (transaction) => {
  const errors = [];

  if (!transaction.description || transaction.description.trim() === '') {
    errors.push('Description is required');
  }

  if (!transaction.amount || parseFloat(transaction.amount) <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!transaction.category) {
    errors.push('Category is required');
  }

  if (!transaction.type) {
    errors.push('Type is required');
  }

  if (!transaction.date) {
    errors.push('Date is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format amount as currency
 */
export const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};
