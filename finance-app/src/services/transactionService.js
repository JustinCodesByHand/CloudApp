import axios from 'axios';
import { API_CONFIG, API_REQUEST_CONFIG } from '../constants/transactionConstants';

class TransactionService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_REQUEST_CONFIG.TIMEOUT,
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this._handleError(error));
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this._handleError(error));
      }
    );
  }

  /**
   * Handle API errors
   */
  _handleError(error) {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    const status = error.response?.status;

    // Handle 401 unauthorized - redirect to login
    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }

    return {
      message,
      status,
      original: error,
    };
  }

  /**
   * Fetch transactions with pagination
   */
  async fetchTransactions(limit = 20) {
    try {
      const response = await this.client.get(API_CONFIG.TRANSACTIONS_ENDPOINT, {
        params: { limit },
      });
      return response.data.transactions || [];
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Add a new transaction
   */
  async addTransaction(transaction) {
    try {
      const response = await this.client.post(
        API_CONFIG.TRANSACTIONS_ENDPOINT,
        transaction
      );
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Get AI advice based on transactions
   */
  async getAIAdvice() {
    try {
      const response = await this.client.post(API_CONFIG.AI_ADVICE_ENDPOINT);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }
}

export default new TransactionService();
