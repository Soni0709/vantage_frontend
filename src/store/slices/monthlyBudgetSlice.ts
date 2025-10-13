import { createSlice, createListenerMiddleware } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { transactionsApi } from '../api/transactionsApi';

export type BudgetAlertLevel = 'none' | 'warning' | 'critical';

interface MonthlyBudgetState {
  // Monthly budget amount set by user
  amount: number;
  
  // Computed values (derived from transactions)
  totalIncome: number;
  totalExpense: number;
  remainingBudget: number;
  usagePercentage: number;
  
  // Alert state
  alertLevel: BudgetAlertLevel;
  alertMessage: string | null;
  
  // Metadata
  lastUpdated: string | null;
  month: string; // Format: YYYY-MM
}

const initialState: MonthlyBudgetState = {
  amount: 50000, // Default monthly budget (₹50,000)
  totalIncome: 0,
  totalExpense: 0,
  remainingBudget: 50000,
  usagePercentage: 0,
  alertLevel: 'none',
  alertMessage: null,
  lastUpdated: null,
  month: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
};

const monthlyBudgetSlice = createSlice({
  name: 'monthlyBudget',
  initialState,
  reducers: {
    // Set the monthly budget amount
    setBudgetAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
      state.remainingBudget = action.payload - state.totalExpense;
      state.usagePercentage = state.amount > 0 
        ? (state.totalExpense / state.amount) * 100 
        : 0;
      state.lastUpdated = new Date().toISOString();
      
      // Recalculate alert level
      state.alertLevel = calculateAlertLevel(state.usagePercentage);
      state.alertMessage = generateAlertMessage(state.alertLevel, state.usagePercentage, state.amount);
    },
    
    // Update budget calculations (called automatically via listener)
    updateBudgetCalculations: (
      state, 
      action: PayloadAction<{ totalIncome: number; totalExpense: number }>
    ) => {
      const { totalIncome, totalExpense } = action.payload;
      
      state.totalIncome = totalIncome;
      state.totalExpense = totalExpense;
      state.remainingBudget = state.amount - totalExpense;
      state.usagePercentage = state.amount > 0 
        ? (totalExpense / state.amount) * 100 
        : 0;
      state.lastUpdated = new Date().toISOString();
      
      // Determine alert level
      const newAlertLevel = calculateAlertLevel(state.usagePercentage);
      const previousAlertLevel = state.alertLevel;
      
      state.alertLevel = newAlertLevel;
      state.alertMessage = generateAlertMessage(newAlertLevel, state.usagePercentage, state.amount);
      
      // Log alert level changes for debugging
      if (newAlertLevel !== previousAlertLevel && newAlertLevel !== 'none') {
        console.log(`🚨 Budget Alert: ${newAlertLevel.toUpperCase()} - ${state.alertMessage}`);
      }
    },
    
    // Reset budget for new month
    resetMonthlyBudget: (state) => {
      const newMonth = new Date().toISOString().slice(0, 7);
      state.month = newMonth;
      state.totalIncome = 0;
      state.totalExpense = 0;
      state.remainingBudget = state.amount;
      state.usagePercentage = 0;
      state.alertLevel = 'none';
      state.alertMessage = null;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Dismiss alert (user acknowledged)
    dismissAlert: (state) => {
      state.alertMessage = null;
    },
    
    // Reset everything to defaults
    resetBudgetState: () => initialState,
  },
});

// Helper function to calculate alert level
function calculateAlertLevel(usagePercentage: number): BudgetAlertLevel {
  if (usagePercentage >= 100) {
    return 'critical';
  } else if (usagePercentage >= 80) {
    return 'warning';
  }
  return 'none';
}

// Helper function to generate alert messages
function generateAlertMessage(
  level: BudgetAlertLevel, 
  percentage: number,
  budgetAmount: number
): string | null {
  if (level === 'critical') {
    return `Budget exceeded! You've spent ${percentage.toFixed(1)}% of your ₹${budgetAmount.toLocaleString()} monthly budget.`;
  } else if (level === 'warning') {
    return `Warning: You've used ${percentage.toFixed(1)}% of your monthly budget. Consider reducing expenses.`;
  }
  return null;
}

// Create listener middleware to watch for transaction changes
export const budgetListenerMiddleware = createListenerMiddleware();

// Listen for transaction summary updates
budgetListenerMiddleware.startListening({
  matcher: transactionsApi.endpoints.getTransactionSummary.matchFulfilled,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Only update if we're looking at current month data
    if (state.monthlyBudget.month === currentMonth) {
      const { totalIncome, totalExpenses } = action.payload;
      
      listenerApi.dispatch(
        monthlyBudgetSlice.actions.updateBudgetCalculations({
          totalIncome,
          totalExpense: totalExpenses,
        })
      );
    }
  },
});

// Listen for transaction creation
budgetListenerMiddleware.startListening({
  matcher: transactionsApi.endpoints.createTransaction.matchFulfilled,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;
    const transaction = action.payload;
    
    // Update budget calculations immediately for optimistic UI
    if (transaction.type === 'expense') {
      const newTotalExpense = state.monthlyBudget.totalExpense + transaction.amount;
      listenerApi.dispatch(
        monthlyBudgetSlice.actions.updateBudgetCalculations({
          totalIncome: state.monthlyBudget.totalIncome,
          totalExpense: newTotalExpense,
        })
      );
    } else if (transaction.type === 'income') {
      const newTotalIncome = state.monthlyBudget.totalIncome + transaction.amount;
      listenerApi.dispatch(
        monthlyBudgetSlice.actions.updateBudgetCalculations({
          totalIncome: newTotalIncome,
          totalExpense: state.monthlyBudget.totalExpense,
        })
      );
    }
  },
});

// Listen for transaction deletion
budgetListenerMiddleware.startListening({
  matcher: transactionsApi.endpoints.deleteTransaction.matchFulfilled,
  effect: (_action, listenerApi) => {
    // Trigger a summary refetch to get accurate totals
    listenerApi.dispatch(
      transactionsApi.endpoints.getTransactionSummary.initiate(undefined, {
        forceRefetch: true,
      })
    );
  },
});

// Listen for transaction updates
budgetListenerMiddleware.startListening({
  matcher: transactionsApi.endpoints.updateTransaction.matchFulfilled,
  effect: (_action, listenerApi) => {
    // Trigger a summary refetch to get accurate totals
    listenerApi.dispatch(
      transactionsApi.endpoints.getTransactionSummary.initiate(undefined, {
        forceRefetch: true,
      })
    );
  },
});

export const {
  setBudgetAmount,
  updateBudgetCalculations,
  resetMonthlyBudget,
  dismissAlert,
  resetBudgetState,
} = monthlyBudgetSlice.actions;

// Selectors
export const selectMonthlyBudget = (state: RootState) => state.monthlyBudget;
export const selectBudgetAmount = (state: RootState) => state.monthlyBudget.amount;
export const selectTotalIncome = (state: RootState) => state.monthlyBudget.totalIncome;
export const selectTotalExpense = (state: RootState) => state.monthlyBudget.totalExpense;
export const selectRemainingBudget = (state: RootState) => state.monthlyBudget.remainingBudget;
export const selectUsagePercentage = (state: RootState) => state.monthlyBudget.usagePercentage;
export const selectAlertLevel = (state: RootState) => state.monthlyBudget.alertLevel;
export const selectAlertMessage = (state: RootState) => state.monthlyBudget.alertMessage;

export default monthlyBudgetSlice.reducer;
