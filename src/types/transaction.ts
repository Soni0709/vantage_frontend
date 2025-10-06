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
  metadata?: { notes?: string } | Record<string, unknown> | null;
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
