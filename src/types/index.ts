// Test that all exports are working
export * from './auth';
export * from './transaction';

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

export type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionSummary,
  BackendTransaction,
  BackendTransactionSummary,
  BackendUser
} from './transaction';
