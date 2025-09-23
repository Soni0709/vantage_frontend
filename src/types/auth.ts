// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    shareAnalytics: boolean;
  };
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile Update Types
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: File;
}

export interface PreferencesUpdateData {
  theme?: 'light' | 'dark' | 'system';
  currency?: string;
  language?: string;
  notifications?: Partial<UserPreferences['notifications']>;
  privacy?: Partial<UserPreferences['privacy']>;
}

// API Error Types
export interface ApiError {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Auth State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Registration state
  registrationLoading: boolean;
  registrationError: string | null;
  
  // Password reset state
  passwordResetLoading: boolean;
  passwordResetError: string | null;
  passwordResetEmailSent: boolean;
  
  // Profile update state
  profileUpdateLoading: boolean;
  profileUpdateError: string | null;
  
  // Password change state
  passwordChangeLoading: boolean;
  passwordChangeError: string | null;
  
  // Session management
  tokenExpiresAt: number | null;
  lastActivity: number;
}