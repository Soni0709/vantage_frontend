import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionSummaryQuery,
  useBulkDeleteTransactionsMutation,
} from '../store/api/transactionsApi';
import {
  useGetRecurringTransactionsQuery,
  useCreateRecurringTransactionMutation,
  useUpdateRecurringTransactionMutation,
  useDeleteRecurringTransactionMutation,
  useToggleRecurringTransactionMutation,
  useProcessRecurringTransactionsMutation,
  useGetUpcomingRecurringQuery,
} from '../store/api/recurringTransactionsApi';
import {
  selectActiveFilters,
  selectSelectedTransaction,
  selectIsAddModalOpen,
  selectIsEditModalOpen,
  selectIsDeleteConfirmOpen,
  selectSelectedTransactionIds,
  selectExpenseCategories,
  selectIncomeCategories,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteConfirm,
  closeDeleteConfirm,
  setFilters,
  updateFilter,
  clearFilters,
  clearSelection,
} from '../store/slices/transactionSlice';
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
} from '../types/transaction';

/**
 * Custom hook for transaction management
 * Combines RTK Query hooks with Redux actions for complete transaction handling
 */
export function useTransactions(filters?: TransactionFilters) {
  const dispatch = useAppDispatch();
  const activeFilters = useAppSelector(selectActiveFilters);
  const selectedTransaction = useAppSelector(selectSelectedTransaction);
  const selectedIds = useAppSelector(selectSelectedTransactionIds);
  
  // Use provided filters or active filters from Redux
  const queryFilters = filters || activeFilters;
  
  // Queries
  const transactionsQuery = useGetTransactionsQuery(queryFilters);
  const summaryQuery = useGetTransactionSummaryQuery();
  
  // Mutations
  const [createTransaction, createState] = useCreateTransactionMutation();
  const [updateTransaction, updateState] = useUpdateTransactionMutation();
  const [deleteTransaction, deleteState] = useDeleteTransactionMutation();
  const [bulkDelete, bulkDeleteState] = useBulkDeleteTransactionsMutation();
  
  // Actions
  const handleSetFilters = useCallback(
    (newFilters: TransactionFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );
  
  const handleUpdateFilter = useCallback(
    (partialFilters: Partial<TransactionFilters>) => {
      dispatch(updateFilter(partialFilters));
    },
    [dispatch]
  );
  
  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);
  
  const handleCreate = useCallback(
    async (data: CreateTransactionData) => {
      const result = await createTransaction(data).unwrap();
      dispatch(closeAddModal());
      return result;
    },
    [createTransaction, dispatch]
  );
  
  const handleUpdate = useCallback(
    async (id: string, data: UpdateTransactionData) => {
      const result = await updateTransaction({ id, data }).unwrap();
      dispatch(closeEditModal());
      return result;
    },
    [updateTransaction, dispatch]
  );
  
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTransaction(id).unwrap();
      dispatch(closeDeleteConfirm());
    },
    [deleteTransaction, dispatch]
  );
  
  const handleBulkDelete = useCallback(
    async (ids?: string[]) => {
      const idsToDelete = ids || selectedIds;
      if (idsToDelete.length === 0) return;
      
      await bulkDelete(idsToDelete).unwrap();
      dispatch(clearSelection());
    },
    [bulkDelete, selectedIds, dispatch]
  );
  
  return {
    // Data
    transactions: transactionsQuery.data || [],
    summary: summaryQuery.data,
    selectedTransaction,
    selectedIds,
    
    // Loading states
    isLoading: transactionsQuery.isLoading,
    isSummaryLoading: summaryQuery.isLoading,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    isBulkDeleting: bulkDeleteState.isLoading,
    
    // Error states
    error: transactionsQuery.error,
    summaryError: summaryQuery.error,
    createError: createState.error,
    updateError: updateState.error,
    deleteError: deleteState.error,
    
    // Query methods
    refetch: transactionsQuery.refetch,
    refetchSummary: summaryQuery.refetch,
    
    // Actions
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    bulkDelete: handleBulkDelete,
    
    // Filter actions
    setFilters: handleSetFilters,
    updateFilter: handleUpdateFilter,
    clearFilters: handleClearFilters,
    
    // Current filters
    filters: activeFilters,
  };
}

/**
 * Custom hook for recurring transactions
 */
export function useRecurringTransactions(params?: { active?: boolean }) {
  // Queries
  const recurringQuery = useGetRecurringTransactionsQuery(params);
  const upcomingQuery = useGetUpcomingRecurringQuery({ days: 30 });
  
  // Mutations
  const [createRecurring, createState] = useCreateRecurringTransactionMutation();
  const [updateRecurring, updateState] = useUpdateRecurringTransactionMutation();
  const [deleteRecurring, deleteState] = useDeleteRecurringTransactionMutation();
  const [toggleRecurring, toggleState] = useToggleRecurringTransactionMutation();
  const [processRecurring, processState] = useProcessRecurringTransactionsMutation();
  
  const handleCreate = useCallback(
    async (data: any) => {
      const result = await createRecurring(data).unwrap();
      return result;
    },
    [createRecurring]
  );
  
  const handleUpdate = useCallback(
    async (id: string, data: any) => {
      const result = await updateRecurring({ id, data }).unwrap();
      return result;
    },
    [updateRecurring]
  );
  
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteRecurring(id).unwrap();
    },
    [deleteRecurring]
  );
  
  const handleToggle = useCallback(
    async (id: string, isActive: boolean) => {
      await toggleRecurring({ id, isActive }).unwrap();
    },
    [toggleRecurring]
  );
  
  const handleProcess = useCallback(async () => {
    const result = await processRecurring().unwrap();
    return result;
  }, [processRecurring]);
  
  return {
    // Data
    recurring: recurringQuery.data || [],
    upcoming: upcomingQuery.data || [],
    
    // Loading states
    isLoading: recurringQuery.isLoading,
    isUpcomingLoading: upcomingQuery.isLoading,
    isCreating: createState.isLoading,
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
    isToggling: toggleState.isLoading,
    isProcessing: processState.isLoading,
    
    // Error states
    error: recurringQuery.error,
    upcomingError: upcomingQuery.error,
    
    // Actions
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    toggle: handleToggle,
    process: handleProcess,
    
    // Query methods
    refetch: recurringQuery.refetch,
    refetchUpcoming: upcomingQuery.refetch,
  };
}

/**
 * Custom hook for transaction modals
 */
export function useTransactionModals() {
  const dispatch = useAppDispatch();
  
  const isAddModalOpen = useAppSelector(selectIsAddModalOpen);
  const isEditModalOpen = useAppSelector(selectIsEditModalOpen);
  const isDeleteConfirmOpen = useAppSelector(selectIsDeleteConfirmOpen);
  const selectedTransaction = useAppSelector(selectSelectedTransaction);
  
  const handleOpenAdd = useCallback(() => {
    dispatch(openAddModal());
  }, [dispatch]);
  
  const handleCloseAdd = useCallback(() => {
    dispatch(closeAddModal());
  }, [dispatch]);
  
  const handleOpenEdit = useCallback(
    (transaction: Transaction) => {
      dispatch(openEditModal(transaction));
    },
    [dispatch]
  );
  
  const handleCloseEdit = useCallback(() => {
    dispatch(closeEditModal());
  }, [dispatch]);
  
  const handleOpenDelete = useCallback(
    (transaction: Transaction) => {
      dispatch(openDeleteConfirm(transaction));
    },
    [dispatch]
  );
  
  const handleCloseDelete = useCallback(() => {
    dispatch(closeDeleteConfirm());
  }, [dispatch]);
  
  return {
    // Modal states
    isAddModalOpen,
    isEditModalOpen,
    isDeleteConfirmOpen,
    selectedTransaction,
    
    // Modal actions
    openAdd: handleOpenAdd,
    closeAdd: handleCloseAdd,
    openEdit: handleOpenEdit,
    closeEdit: handleCloseEdit,
    openDelete: handleOpenDelete,
    closeDelete: handleCloseDelete,
  };
}

/**
 * Custom hook for categories
 */
export function useCategories() {
  const incomeCategories = useAppSelector(selectIncomeCategories);
  const expenseCategories = useAppSelector(selectExpenseCategories);
  
  return {
    incomeCategories,
    expenseCategories,
    allCategories: [...incomeCategories, ...expenseCategories],
  };
}

/**
 * Custom hook for a single transaction
 */
export function useTransaction(id: string) {
  const query = useGetTransactionQuery(id);
  const [updateTransaction, updateState] = useUpdateTransactionMutation();
  const [deleteTransaction, deleteState] = useDeleteTransactionMutation();
  
  const handleUpdate = useCallback(
    async (data: UpdateTransactionData) => {
      return await updateTransaction({ id, data }).unwrap();
    },
    [updateTransaction, id]
  );
  
  const handleDelete = useCallback(async () => {
    await deleteTransaction(id).unwrap();
  }, [deleteTransaction, id]);
  
  return {
    transaction: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    update: handleUpdate,
    delete: handleDelete,
    
    isUpdating: updateState.isLoading,
    isDeleting: deleteState.isLoading,
  };
}
