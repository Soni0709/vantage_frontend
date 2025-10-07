// Transaction related types
export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
  isRecurring?: boolean;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
}

export interface UpdateTransactionData {
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
  notes?: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  isRecurring?: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  period: {
    startDate: string;
    endDate: string;
  };
  incomeByCategory?: Record<string, number>;
  expenseByCategory?: Record<string, number>;
}

// Recurring Transaction Types
export type RecurringFrequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringConfig {
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  monthOfYear?: number; // 1-12 for yearly
}

export interface RecurringTransaction {
  id: string;
  userId?: string; // Optional since backend may not return it
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  notes?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  nextOccurrence: string;
  isActive: boolean;
  config: RecurringConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  notes?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  config: RecurringConfig;
}

export interface UpdateRecurringTransactionData {
  type?: 'income' | 'expense';
  amount?: number;
  description?: string;
  category?: string;
  notes?: string;
  frequency?: RecurringFrequency;
  endDate?: string;
  isActive?: boolean;
  config?: Partial<RecurringConfig>;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon?: string;
  color?: string;
  budget?: number;
  isDefault?: boolean;
  userId?: string;
  createdAt: string;
}

export interface CategoryWithTotal extends Category {
  total: number;
  transactionCount: number;
  percentage: number;
}

// Backend response types (snake_case from Rails)
export interface BackendTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number | string;
  description: string;
  category: string;
  transaction_date: string;
  payment_method?: string;
  is_recurring?: boolean;
  recurring_id?: string;
  metadata?: { notes?: string } | Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BackendRecurringTransaction {
  id: string;
  user_id?: string; // Optional since backend doesn't always return it
  type: 'income' | 'expense';
  amount: number | string;
  description: string;
  category: string;
  notes?: string;
  frequency: RecurringFrequency;
  start_date: string;
  end_date?: string;
  last_processed?: string;
  next_occurrence: string;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BackendTransactionSummary {
  total_income: number | string;
  total_expense: number | string;
  balance: number | string;
  transaction_count: number | string;
  income_by_category?: Record<string, number>;
  expense_by_category?: Record<string, number>;
}

export interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone?: string;
  date_of_birth?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  email_verified?: boolean;
}

// Pagination types
export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalCount: number;
  };
}
