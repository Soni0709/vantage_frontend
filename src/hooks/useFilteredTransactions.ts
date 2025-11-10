import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  useLazyGetTransactionsQuery, 
  useGetTransactionSummaryQuery,
  transactionsApi
} from '../store/api/transactionsApi';
import type { Transaction, TransactionFilters, TransactionSummary } from '../types/transaction';

/**
 * New approach: useFilteredTransactions
 * 
 * Key features:
 * - Uses lazy query for manual control
 * - Filters trigger immediate API calls
 * - Simple state management
 * - No caching issues
 * - Clear debugging with console logs
 */
export function useFilteredTransactions() {
  const dispatch = useDispatch();
  
  // Filter state - local component state
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [queryParams, setQueryParams] = useState<TransactionFilters>({});
  
  // Lazy query hook - returns trigger function and result
  const [trigger, { data = [], isLoading, error }] = useLazyGetTransactionsQuery();
  const { data: summary } = useGetTransactionSummaryQuery();
  
  // Update a single filter
  const updateFilter = useCallback((key: keyof TransactionFilters, value: unknown) => {
    setFilters(prev => {
      const updated = { ...prev };
      
      // Remove if empty
      if (value === '' || value === undefined || value === null) {
        delete updated[key];
      } else {
        // Type-safe assignment for known keys in TransactionFilters
        if (key === 'minAmount' || key === 'maxAmount') {
          updated[key] = value as number;
        } else if (key === 'isRecurring') {
          updated[key] = value as boolean;
        } else if (key === 'type') {
          // TransactionFilters.type is 'income' | 'expense' | undefined
          updated[key] = value as 'income' | 'expense';
        } else {
          // category, dates, search, etc. are strings
          updated[key] = value as string;
        }
      }
      
      return updated;
    });
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Trigger API call when queryParams change
  useEffect(() => {
    // Build the URL to see what we're actually sending
    const params = new URLSearchParams();
    if (queryParams.type) params.append('type', queryParams.type);
    if (queryParams.category) params.append('category', queryParams.category);
    if (queryParams.startDate) params.append('start_date', queryParams.startDate);
    if (queryParams.endDate) params.append('end_date', queryParams.endDate);
    if (queryParams.minAmount) params.append('min_amount', queryParams.minAmount.toString());
    if (queryParams.maxAmount) params.append('max_amount', queryParams.maxAmount.toString());
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.isRecurring !== undefined) params.append('is_recurring', queryParams.isRecurring.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';
    
    console.log('🔍 Fetching URL:', url);
    console.log('📊 Query Params:', queryParams);
    
    trigger(queryParams, true); // Force fresh fetch
  }, [queryParams, trigger]);
  
  // Apply current filters (triggers refetch)
  const applyFilters = useCallback(() => {
    console.log('📡 Applying filters:', filters);
    
    // Invalidate the transaction cache to force fresh fetch
    dispatch(transactionsApi.util.invalidateTags([{ type: 'Transaction', id: 'LIST' }]));
    
    // Create new object reference to force update
    setQueryParams({ ...filters });
  }, [filters, dispatch]);
  
  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    v => v !== undefined && v !== '' && v !== null && v !== false
  ).length;
  
  return {
    // Data
    transactions: data as Transaction[],
    summary: summary as TransactionSummary | undefined,
    isLoading,
    error,
    
    // Filter state
    filters,
    activeFilterCount,
    
    // Actions
    updateFilter,
    clearFilters,
    applyFilters,
  };
}
