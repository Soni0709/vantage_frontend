// Budget Types
export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';
export type AlertSeverity = 'warning' | 'critical';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: BudgetPeriod;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetData {
  category: string;
  amount: number;
  period: BudgetPeriod;
  startDate?: string;
}

export interface UpdateBudgetData {
  category?: string;
  amount?: number;
  period?: BudgetPeriod;
  isActive?: boolean;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  severity: AlertSeverity;
  message: string;
  threshold: number;
  isRead: boolean;
  isAcknowledged: boolean;
  createdAt: string;
}

export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  categoryBreakdown: CategoryBudgetSummary[];
}

export interface CategoryBudgetSummary {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetFilters {
  category?: string;
  period?: BudgetPeriod;
  isActive?: boolean;
}

export interface AlertFilters {
  isRead?: boolean;
  severity?: AlertSeverity;
}

// Backend response types (snake_case from Rails)
export interface BackendBudget {
  id: string;
  user_id: string;
  category: string;
  amount: number | string;
  period: BudgetPeriod;
  spent: number | string;
  remaining: number | string;
  percentage_used: number | string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface BackendBudgetAlert {
  id: string;
  budget_id: string;
  severity: AlertSeverity;
  message: string;
  threshold: number;
  is_read: boolean;
  is_acknowledged: boolean;
  created_at: string;
}

export interface BackendBudgetSummary {
  total_budgeted: number | string;
  total_spent: number | string;
  total_remaining: number | string;
  overall_percentage: number | string;
  category_breakdown: BackendCategoryBudgetSummary[];
}

export interface BackendCategoryBudgetSummary {
  category: string;
  budgeted: number | string;
  spent: number | string;
  remaining: number | string;
  percentage: number | string;
}
