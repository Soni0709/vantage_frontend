import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  PasswordResetRequest, 
  PasswordResetConfirm,
  PasswordChangeRequest,
  ProfileUpdateData,
  User,
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionSummary
} from '../types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const API_TIMEOUT = 10000; // 10 seconds

// API Response interface based on your backend structure
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('vantage_token');
    if (token) {
      if (!config.headers || config.headers instanceof Headers) {
        config.headers = { 'Content-Type': 'application/json' };
      }
      if (!(config.headers as Record<string, string>)['Authorization']) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // If backend returns validation errors, format them nicely
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => {
              // Handle different error formats
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              } else if (typeof messages === 'string') {
                return `${field}: ${messages}`;
              }
              return `${field}: ${JSON.stringify(messages)}`;
            })
            .join('; ');
          throw new Error(errorMessages || data.message || data.error || `HTTP ${response.status}`);
        }
        throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred');
    }
  }

  // Transform backend user format to frontend format
  private transformUser(backendUser: any): User {
    return {
      id: backendUser.id,
      email: backendUser.email,
      firstName: backendUser.first_name,
      lastName: backendUser.last_name,
      avatar: backendUser.avatar || '',
      phone: backendUser.phone || '',
      dateOfBirth: backendUser.date_of_birth || '',
      preferences: {
        theme: 'dark',
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false,
          budgetAlerts: true,
          goalReminders: true,
          weeklyReports: true,
        },
        privacy: {
          profileVisibility: 'private',
          shareAnalytics: false,
        },
        ...backendUser.preferences
      },
      createdAt: backendUser.created_at,
      updatedAt: backendUser.updated_at || backendUser.created_at,
      emailVerified: backendUser.email_verified || false,
    };
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<ApiResponse<{
        user: User;
        token: string;
      }>>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          auth: {
            email: credentials.email,
            password: credentials.password
          }
        }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const transformedUser = this.transformUser(response.data.user);

      return {
        user: transformedUser,
        token: response.data.token,
        refreshToken: response.data.token, // Using same token for now
        expiresIn: 3600000, // 1 hour - you may want to get this from backend
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Sending registration data:', {
        auth: {  // Changed from 'user' to 'auth'
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password: data.password
        }
      });

      const response = await this.request<ApiResponse<{
        user: User;
        token: string;
      }>>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          auth: {  // Changed from 'user' to 'auth' to match backend
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password
            // Note: backend doesn't use password_confirmation
          }
        }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed');
      }

      const transformedUser = this.transformUser(response.data.user);

      return {
        user: transformedUser,
        token: response.data.token,
        refreshToken: response.data.token,
        expiresIn: 3600000,
      };
    } catch (error) {
      console.error('Registration error:', error);
      // Log more details if available
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request<ApiResponse>('/auth/logout', {
        method: 'DELETE',
      });
    } catch (error) {
      // Logout should succeed even if API call fails
      console.warn('Logout API call failed:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    try {
      const response = await this.request<ApiResponse<{
        token: string;
        expires_in?: number;
      }>>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: refreshToken
        }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Token refresh failed');
      }

      return {
        token: response.data.token,
        expiresIn: response.data.expires_in || 3600000,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Password reset endpoints
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      const response = await this.request<ApiResponse>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    try {
      const response = await this.request<ApiResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: data.token,
          password: data.newPassword,
          password_confirmation: data.confirmPassword
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    try {
      const response = await this.request<ApiResponse>('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: data.currentPassword,
          password: data.newPassword,
          password_confirmation: data.confirmPassword
        }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  // Profile management endpoints
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      const response = await this.request<ApiResponse<{
        user: User;
      }>>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          user: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            date_of_birth: data.dateOfBirth
          }
        }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Profile update failed');
      }

      return this.transformUser(response.data.user);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.request<ApiResponse<{
        user: User;
      }>>('/users/profile', {
        method: 'GET',
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user profile');
      }

      return this.transformUser(response.data.user);
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      const response = await this.request<ApiResponse>('/users/profile', {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Account deletion failed');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<boolean> {
    try {
      // Your backend has health check at root path (not /api/v1/health)
      const baseUrl = this.baseURL.replace('/api/v1', '');
      const response = await fetch(`${baseUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check for common health check response formats
        return data.status === 'ok' || data.success === true || response.status === 200;
      }
      
      return false;
    } catch (error) {
      console.warn('Backend connection check failed:', error);
      return false;
    }
  }

  // Transform backend transaction format to frontend format
  private transformTransaction(backendTransaction: any): Transaction {
    return {
      id: backendTransaction.id,
      userId: backendTransaction.user_id,
      type: backendTransaction.transaction_type,
      amount: parseFloat(backendTransaction.amount),
      description: backendTransaction.description,
      category: backendTransaction.category,
      date: backendTransaction.transaction_date,
      notes: backendTransaction.notes || undefined,
      createdAt: backendTransaction.created_at,
      updatedAt: backendTransaction.updated_at,
    };
  }

  // Transaction endpoints
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    try {
      const response = await this.request<ApiResponse<{
        transaction: any;
      }>>('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          transaction: {
            transaction_type: data.type,
            amount: data.amount,
            description: data.description,
            category: data.category,
            transaction_date: data.date,
            notes: data.notes || null
          }
        }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Transaction creation failed');
      }

      return this.transformTransaction(response.data.transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);
      if (filters?.minAmount) params.append('min_amount', filters.minAmount.toString());
      if (filters?.maxAmount) params.append('max_amount', filters.maxAmount.toString());
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';

      const response = await this.request<ApiResponse<{
        transactions: any[];
      }>>(endpoint, {
        method: 'GET',
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch transactions');
      }

      return response.data.transactions.map(t => this.transformTransaction(t));
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    }
  }

  async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await this.request<ApiResponse<{
        transaction: any;
      }>>(`/transactions/${id}`, {
        method: 'GET',
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch transaction');
      }

      return this.transformTransaction(response.data.transaction);
    } catch (error) {
      console.error('Get transaction error:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
    try {
      const updateData: any = {};
      if (data.type !== undefined) updateData.transaction_type = data.type;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.date !== undefined) updateData.transaction_date = data.date;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const response = await this.request<ApiResponse<{
        transaction: any;
      }>>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          transaction: updateData
        }),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Transaction update failed');
      }

      return this.transformTransaction(response.data.transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const response = await this.request<ApiResponse>(`/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Transaction deletion failed');
      }
    } catch (error) {
      console.error('Delete transaction error:', error);
      throw error;
    }
  }

  async getTransactionSummary(startDate?: string, endDate?: string): Promise<TransactionSummary> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const queryString = params.toString();
      const endpoint = queryString ? `/transactions/summary?${queryString}` : '/transactions/summary';

      const response = await this.request<ApiResponse<{
        summary: any;
      }>>(endpoint, {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch transaction summary');
      }

      // Handle case where data or summary might be undefined
      const summary = response.data?.summary || {};
      
      return {
        totalIncome: parseFloat(summary.total_income || '0'),
        totalExpenses: parseFloat(summary.total_expenses || '0'),
        balance: parseFloat(summary.balance || '0'),
        transactionCount: parseInt(summary.transaction_count || '0', 10),
        period: {
          startDate: summary.start_date || startDate || '',
          endDate: summary.end_date || endDate || '',
        },
      };
    } catch (error) {
      console.error('Get transaction summary error:', error);
      // Return empty summary instead of throwing
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
        period: {
          startDate: startDate || '',
          endDate: endDate || '',
        },
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;