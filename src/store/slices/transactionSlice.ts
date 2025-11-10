import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Transaction,
  TransactionFilters,
  Category,
} from '../../types/transaction';

// Default categories
const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: '1', name: 'Salary', type: 'income', icon: '💰', color: '#10b981', isDefault: true, createdAt: new Date().toISOString() },
  { id: '2', name: 'Freelance', type: 'income', icon: '💼', color: '#3b82f6', isDefault: true, createdAt: new Date().toISOString() },
  { id: '3', name: 'Investment', type: 'income', icon: '📈', color: '#8b5cf6', isDefault: true, createdAt: new Date().toISOString() },
  { id: '4', name: 'Bonus', type: 'income', icon: '🎁', color: '#ec4899', isDefault: true, createdAt: new Date().toISOString() },
  { id: '5', name: 'Other Income', type: 'income', icon: '💵', color: '#14b8a6', isDefault: true, createdAt: new Date().toISOString() },
];

const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: '6', name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444', budget: 15000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '7', name: 'Transportation', type: 'expense', icon: '🚗', color: '#f59e0b', budget: 8000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '8', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', budget: 10000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '9', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8b5cf6', budget: 5000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '10', name: 'Bills & Utilities', type: 'expense', icon: '📄', color: '#6366f1', budget: 12000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '11', name: 'Healthcare', type: 'expense', icon: '🏥', color: '#14b8a6', budget: 5000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '12', name: 'Education', type: 'expense', icon: '📚', color: '#3b82f6', budget: 8000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '13', name: 'Rent', type: 'expense', icon: '🏠', color: '#84cc16', budget: 25000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '14', name: 'Insurance', type: 'expense', icon: '🛡️', color: '#06b6d4', budget: 5000, isDefault: true, createdAt: new Date().toISOString() },
  { id: '15', name: 'Other Expense', type: 'expense', icon: '💳', color: '#64748b', isDefault: true, createdAt: new Date().toISOString() },
];

interface TransactionState {
  // Filters
  activeFilters: TransactionFilters;
  
  // Categories
  categories: Category[];
  
  // UI State
  selectedTransaction: Transaction | null;
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteConfirmOpen: boolean;
  
  // Selection for bulk operations
  selectedTransactionIds: string[];
  
  // View preferences
  viewMode: 'list' | 'grid' | 'calendar';
  sortBy: 'date' | 'amount' | 'category' | 'description';
  sortOrder: 'asc' | 'desc';
  
  // Recurring transaction state
  showRecurring: boolean;
  recurringFilter: 'all' | 'active' | 'inactive';
}

const initialState: TransactionState = {
  activeFilters: {},
  categories: [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES],
  selectedTransaction: null,
  isAddModalOpen: false,
  isEditModalOpen: false,
  isDeleteConfirmOpen: false,
  selectedTransactionIds: [],
  viewMode: 'list',
  sortBy: 'date',
  sortOrder: 'desc',
  showRecurring: false,
  recurringFilter: 'all',
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.activeFilters = action.payload;
    },
    
    clearFilters: (state) => {
      state.activeFilters = {};
    },
    
    updateFilter: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    
    // Category actions
    addCategory: (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    },
    
    updateCategory: (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
    
    resetCategories: (state) => {
      state.categories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
    },
    
    // UI state actions
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
    
    openAddModal: (state) => {
      state.isAddModalOpen = true;
      state.selectedTransaction = null;
    },
    
    closeAddModal: (state) => {
      state.isAddModalOpen = false;
    },
    
    openEditModal: (state, action: PayloadAction<Transaction>) => {
      state.isEditModalOpen = true;
      state.selectedTransaction = action.payload;
    },
    
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.selectedTransaction = null;
    },
    
    openDeleteConfirm: (state, action: PayloadAction<Transaction>) => {
      state.isDeleteConfirmOpen = true;
      state.selectedTransaction = action.payload;
    },
    
    closeDeleteConfirm: (state) => {
      state.isDeleteConfirmOpen = false;
      state.selectedTransaction = null;
    },
    
    // Selection actions
    toggleTransactionSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedTransactionIds.indexOf(action.payload);
      if (index > -1) {
        state.selectedTransactionIds.splice(index, 1);
      } else {
        state.selectedTransactionIds.push(action.payload);
      }
    },
    
    selectAllTransactions: (state, action: PayloadAction<string[]>) => {
      state.selectedTransactionIds = action.payload;
    },
    
    clearSelection: (state) => {
      state.selectedTransactionIds = [];
    },
    
    // View preferences
    setViewMode: (state, action: PayloadAction<'list' | 'grid' | 'calendar'>) => {
      state.viewMode = action.payload;
    },
    
    setSortBy: (state, action: PayloadAction<'date' | 'amount' | 'category' | 'description'>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    
    toggleSortOrder: (state) => {
      state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    
    // Recurring transaction filters
    setShowRecurring: (state, action: PayloadAction<boolean>) => {
      state.showRecurring = action.payload;
    },
    
    setRecurringFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.recurringFilter = action.payload;
    },
  },
});

export const {
  setFilters,
  clearFilters,
  updateFilter,
  addCategory,
  updateCategory,
  deleteCategory,
  resetCategories,
  setSelectedTransaction,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteConfirm,
  closeDeleteConfirm,
  toggleTransactionSelection,
  selectAllTransactions,
  clearSelection,
  setViewMode,
  setSortBy,
  setSortOrder,
  toggleSortOrder,
  setShowRecurring,
  setRecurringFilter,
} = transactionSlice.actions;

// Selectors
const selectTransactionState = (state: { transactions: TransactionState }) => 
  state.transactions;

const selectCategoriesRaw = (state: { transactions: TransactionState }) => 
  state.transactions.categories;

export const selectActiveFilters = createSelector(
  [selectTransactionState],
  (state) => state.activeFilters
);

export const selectCategories = createSelector(
  [selectCategoriesRaw],
  (categories) => categories
);

// Memoized selectors for filtered categories
export const selectIncomeCategories = createSelector(
  [selectCategoriesRaw],
  (categories) => categories.filter((c) => c.type === 'income' || c.type === 'both')
);

export const selectExpenseCategories = createSelector(
  [selectCategoriesRaw],
  (categories) => categories.filter((c) => c.type === 'expense' || c.type === 'both')
);

export const selectSelectedTransaction = createSelector(
  [selectTransactionState],
  (state) => state.selectedTransaction
);

export const selectIsAddModalOpen = createSelector(
  [selectTransactionState],
  (state) => state.isAddModalOpen
);

export const selectIsEditModalOpen = createSelector(
  [selectTransactionState],
  (state) => state.isEditModalOpen
);

export const selectIsDeleteConfirmOpen = createSelector(
  [selectTransactionState],
  (state) => state.isDeleteConfirmOpen
);

export const selectSelectedTransactionIds = createSelector(
  [selectTransactionState],
  (state) => state.selectedTransactionIds
);

export const selectViewMode = createSelector(
  [selectTransactionState],
  (state) => state.viewMode
);

export const selectSortBy = createSelector(
  [selectTransactionState],
  (state) => state.sortBy
);

export const selectSortOrder = createSelector(
  [selectTransactionState],
  (state) => state.sortOrder
);

export const selectShowRecurring = createSelector(
  [selectTransactionState],
  (state) => state.showRecurring
);

export const selectRecurringFilter = createSelector(
  [selectTransactionState],
  (state) => state.recurringFilter
);

export default transactionSlice.reducer;
