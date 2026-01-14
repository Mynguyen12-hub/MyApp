/**
 * Environment Configuration
 * Cấu hình các biến môi trường cho ứng dụng
 */

// Backend API Configuration
export const BACKEND_CONFIG = {
  // Thay đổi giá trị này với IP/domain của máy chủ backend của bạn
  // Examples:
  // - http://localhost:5000 (local development)
  // - http://192.168.1.100:5000 (local network)
  // - https://api.yourserver.com (production)
  API_BASE_URL: "http://192.168.1.100:5000",
  
  // Timeout cho API requests (ms)
  API_TIMEOUT: 30000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  // Firestore collections
  COLLECTIONS: {
    PRODUCTS: "products",
    CATEGORIES: "categories",
    USERS: "users",
    ORDERS: "orders",
  },
};

// Search Configuration
export const SEARCH_CONFIG = {
  // Maximum number of search results
  MAX_RESULTS: 50,
  
  // Search history limit
  HISTORY_LIMIT: 5,
  
  // Minimum query length
  MIN_QUERY_LENGTH: 1,
};

// Development mode flag
export const IS_DEVELOPMENT = true; // Set to false for production

// Logging configuration
export const LOGGING_CONFIG = {
  DEBUG: IS_DEVELOPMENT,
  VERBOSE: IS_DEVELOPMENT,
};
