// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  TRANSACTIONS_ENDPOINT: '/transactions',
  AI_ADVICE_ENDPOINT: '/ai-advice',
};

// Transaction Categories
export const TRANSACTION_CATEGORIES = [
  'Food',
  'Housing',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Utilities',
  'Income',
  'Education',
  'Travel',
  'Other',
];

// Transaction Types
export const TRANSACTION_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
};

// Default Transaction Values
export const DEFAULT_TRANSACTION = {
  description: '',
  amount: '',
  category: 'Food',
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
};

// Store Patterns for Receipt Parsing
export const STORE_PATTERNS = [
  { pattern: /WALMART|WM SUPER|SUPERCENTER/i, store: 'Walmart', type: 'Shopping' },
  { pattern: /TARGET/i, store: 'Target', type: 'Shopping' },
  { pattern: /COSTCO/i, store: 'Costco', type: 'Shopping' },
  { pattern: /SAFEWAY/i, store: 'Safeway', type: 'Food' },
  { pattern: /KROGER/i, store: 'Kroger', type: 'Food' },
  { pattern: /WHOLE[\s-]*FOODS/i, store: 'Whole Foods', type: 'Food' },
  { pattern: /TRADER[\s-]*JOE/i, store: "Trader Joe's", type: 'Food' },
  { pattern: /7-?ELEVEN/i, store: '7-Eleven', type: 'Food' },
  { pattern: /CVS/i, store: 'CVS', type: 'Healthcare' },
  { pattern: /WALGREENS/i, store: 'Walgreens', type: 'Healthcare' },
  { pattern: /AMAZON/i, store: 'Amazon', type: 'Shopping' },
  { pattern: /BEST[\s-]*BUY/i, store: 'Best Buy', type: 'Technology' },
  { pattern: /APPLE[\s-]*STORE/i, store: 'Apple Store', type: 'Technology' },
  { pattern: /MICROSOFT/i, store: 'Microsoft', type: 'Technology' },
  { pattern: /STARBUCKS/i, store: 'Starbucks', type: 'Food' },
  { pattern: /MCDONALD/i, store: "McDonald's", type: 'Food' },
  { pattern: /BURGER[\s-]*KING/i, store: 'Burger King', type: 'Food' },
  { pattern: /WENDY/i, store: "Wendy's", type: 'Food' },
  { pattern: /TACO[\s-]*BELL/i, store: 'Taco Bell', type: 'Food' },
  { pattern: /CHIPOTLE/i, store: 'Chipotle', type: 'Food' },
  { pattern: /PANERA/i, store: 'Panera', type: 'Food' },
  { pattern: /HOME[\s-]*DEPOT/i, store: 'Home Depot', type: 'Housing' },
  { pattern: /LOWE/i, store: "Lowe's", type: 'Housing' },
  { pattern: /IKEA/i, store: 'IKEA', type: 'Housing' },
  { pattern: /PET[\s-]*SMART/i, store: 'PetSmart', type: 'Other' },
  { pattern: /PETCO/i, store: 'Petco', type: 'Other' },
  { pattern: /SHELL/i, store: 'Shell', type: 'Transportation' },
  { pattern: /EXXON|MOBIL/i, store: 'Exxon/Mobil', type: 'Transportation' },
  { pattern: /BP\s|BRITISH[\s-]*PETRO/i, store: 'BP', type: 'Transportation' },
  { pattern: /CHEVRON/i, store: 'Chevron', type: 'Transportation' },
  { pattern: /NETFLIX/i, store: 'Netflix', type: 'Entertainment' },
  { pattern: /SPOTIFY/i, store: 'Spotify', type: 'Entertainment' },
  { pattern: /DISNEY[\s+]?\+?/i, store: 'Disney+', type: 'Entertainment' },
  { pattern: /PRIME[\s-]*VIDEO/i, store: 'Amazon Prime Video', type: 'Entertainment' },
  { pattern: /HBO|MAX/i, store: 'HBO Max', type: 'Entertainment' },
  { pattern: /UBER/i, store: 'Uber', type: 'Transportation' },
  { pattern: /LYFT/i, store: 'Lyft', type: 'Transportation' },
  { pattern: /DOORDASH/i, store: 'DoorDash', type: 'Food' },
  { pattern: /GRUBHUB/i, store: 'Grubhub', type: 'Food' },
  { pattern: /UBER[\s-]*EATS/i, store: 'Uber Eats', type: 'Food' },
];

// Receipt Parsing - Price Patterns
export const PRICE_PATTERNS = [
  /TOTAL\s*[:\-]?\s*\$?\s*(\d+\.\d{2})/i,
  /TOTAL\s+.*?\$?\s*(\d+\.\d{2})/i,
  /AMOUNT\s*[:\-]?\s*\$?\s*(\d+\.\d{2})/i,
  /PAY\s*[:\-]?\s*\$?\s*(\d+\.\d{2})/i,
  /BALANCE\s*[:\-]?\s*\$?\s*(\d+\.\d{2})/i,
  /DEBIT\s+TEND\s+(\d+\.\d{2})/i,
  /CREDIT\s+TEND\s+(\d+\.\d{2})/i,
  /\$\s*(\d+\.\d{2})\s*(?=TOTAL|AMOUNT|PAY)/i,
  /(\d+\.\d{2})\s*[\n\r]\s*TOTAL/i,
];

// Receipt Parsing - Date Patterns
export const DATE_PATTERNS = [
  /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/,
  /\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/,
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/i,
  /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/i,
  /Date[:\-]?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
  /DATE\s*:\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
];

// Month Names for Date Parsing
export const MONTH_NAMES = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
];

// Keyword Categories for Receipt Analysis
export const KEYWORD_CATEGORIES = {
  grocery: ['grocery', 'market', 'food', 'supermarket', 'produce', 'meat', 'dairy', 'bakery', 'cereal', 'yogurt', 'bread', 'milk', 'eggs', 'cheese', 'fruit', 'vegetable'],
  clothing: ['clothing', 'apparel', 'shirt', 'pants', 'dress', 'shoes', 'sneakers', 'jacket', 'coat', 'fashion', 'boutique', 'outfit'],
  technology: ['electronics', 'computer', 'laptop', 'phone', 'tablet', 'camera', 'gaming', 'software', 'hardware', 'tech', 'electronic', 'gadget'],
  entertainment: ['movie', 'cinema', 'theater', 'concert', 'show', 'ticket', 'game', 'amusement', 'park', 'bowling', 'arcade', 'karaoke'],
  restaurant: ['restaurant', 'cafe', 'coffee', 'diner', 'bistro', 'grill', 'pizza', 'burger', 'sandwich', 'fast food', 'takeout', 'delivery'],
};

// OCR Configuration
export const OCR_CONFIG = {
  LANGUAGE: 'eng',
  PROGRESS_THRESHOLD: 0.01, // Only update progress at 1% increments
};

// Amount Adjustment
export const AMOUNT_ADJUSTMENT = 20; // Amount to adjust by with arrow keys/scroll

// Toast Configuration
export const TOAST_CONFIG = {
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 3000,
  INFO_DURATION: 2000,
};

// API Request Config
export const API_REQUEST_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};
