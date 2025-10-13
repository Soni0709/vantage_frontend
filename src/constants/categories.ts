// Centralized category structure for expenses and budgets
// This ensures both Add Expense and Add Budget use the same categories

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Housing',
  'Insurance',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Other'
] as const;

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental Income',
  'Gift',
  'Bonus',
  'Other Income'
] as const;

// Type exports
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type Category = ExpenseCategory | IncomeCategory;

// Helper function to check if a category is an expense category
export const isExpenseCategory = (category: string): category is ExpenseCategory => {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
};

// Helper function to check if a category is an income category
export const isIncomeCategory = (category: string): category is IncomeCategory => {
  return INCOME_CATEGORIES.includes(category as IncomeCategory);
};
