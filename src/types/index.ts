// Test that all exports are working
export * from './auth';

// Re-export key types explicitly to ensure they're available
export type {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  ApiError,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordChangeRequest,
  ProfileUpdateData,
  PreferencesUpdateData,
  UserPreferences
} from './auth';