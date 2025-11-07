import { baseApi } from './baseApi';
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionSummary,
  BackendTransaction,
  BackendTransactionSummary,
  BackendPagination,
  PaginationParams,
  PaginatedResponse,
} from '../../types/transaction';

// API Response interface
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Transform backend transaction to frontend format
const transformTransaction = (backendTransaction: BackendTransaction): Transaction => {
  let notes: string | undefined;
  if (backendTransaction.metadata && typeof backendTransaction.metadata === 'object') {
    const meta = backendTransaction.metadata as { notes?: string };
    notes = meta.notes;
  }

  return {
    id: backendTransaction.id,
    userId: '',
    type: backendTransaction.type,
    amount: parseFloat(backendTransaction.amount.toString()),
    description: backendTransaction.description,
    category: backendTransaction.category,
    date: backendTransaction.transaction_date,
    notes,
    isRecurring: backendTransaction.is_recurring || false,
    recurringId: backendTransaction.recurring_id,
    createdAt: backendTransaction.created_at,
    updatedAt: backendTransaction.updated_at,
  };
};

// Transform summary data
const transformSummary = (backendSummary: BackendTransactionSummary): TransactionSummary => {
  return {
    totalIncome: parseFloat(backendSummary.total_income?.toString() || '0'),
    totalExpenses: parseFloat(backendSummary.total_expense?.toString() || '0'),
    balance: parseFloat(backendSummary.balance?.toString() || '0'),
    transactionCount: parseInt(backendSummary.transaction_count?.toString() || '0', 10),
    period: {
      startDate: '',
      endDate: '',
    },
    incomeByCategory: backendSummary.income_by_category,
    expenseByCategory: backendSummary.expense_by_category,
  };
};

// Transform backend pagination to frontend format
const transformPagination = (backendPagination: BackendPagination) => {
  return {
    currentPage: backendPagination.current_page || 1,
    perPage: backendPagination.per_page || 20,
    totalPages: backendPagination.total_pages || 1,
    totalCount: backendPagination.total_count || 0,
  };
};

// Build query string from filters
const buildQueryString = (filters?: TransactionFilters, pagination?: PaginationParams): string => {
  const params = new URLSearchParams();
  
  if (filters?.type) params.append('type', filters.type);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.startDate) params.append('start_date', filters.startDate);
  if (filters?.endDate) params.append('end_date', filters.endDate);
  if (filters?.minAmount) params.append('min_amount', filters.minAmount.toString());
  if (filters?.maxAmount) params.append('max_amount', filters.maxAmount.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.isRecurring !== undefined) params.append('is_recurring', filters.isRecurring.toString());
  
  if (pagination) {
    params.append('page', pagination.page.toString());
    params.append('per_page', pagination.perPage.toString());
  }
  
  return params.toString();
};

// Transactions API
export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all transactions with optional filters
    getTransactions: builder.query<Transaction[], TransactionFilters | void>({
      query: (filters) => {
        const queryString = buildQueryString(filters || undefined);
        return {
          url: queryString ? `/transactions?${queryString}` : '/transactions'
        };
      },
      transformResponse: (response: ApiResponse<{ transactions: BackendTransaction[] }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch transactions');
        }
        return response.data.transactions.map(transformTransaction);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    // Get paginated transactions
    getPaginatedTransactions: builder.query<
      PaginatedResponse<Transaction>,
      { filters?: TransactionFilters; pagination: PaginationParams }
    >({
      query: ({ filters, pagination }) => {
        const queryString = buildQueryString(filters, pagination);
        return {
          url: `/transactions?${queryString}`
        };
      },
      transformResponse: (response: ApiResponse<{
        transactions: BackendTransaction[];
        pagination: BackendPagination;
      }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch transactions');
        }
        return {
          data: response.data.transactions.map(transformTransaction),
          pagination: response.data.pagination
            ? transformPagination(response.data.pagination)
            : {
                currentPage: 1,
                perPage: 20,
                totalPages: 1,
                totalCount: response.data.transactions.length,
              },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    // Get single transaction
    getTransaction: builder.query<Transaction, string>({
      query: (id) => ({
        url: `/transactions/${id}`
      }),
      transformResponse: (response: ApiResponse<{ transaction: BackendTransaction }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch transaction');
        }
        return transformTransaction(response.data.transaction);
      },
      providesTags: (_result, _error, id) => [{ type: 'Transaction', id }],
    }),

    // Create transaction
    createTransaction: builder.mutation<Transaction, CreateTransactionData>({
      query: (data) => ({
        url: '/transactions',
        method: 'POST',
        body: {
          transaction: {
            type: data.type,
            amount: data.amount,
            description: data.description,
            category: data.category,
            transaction_date: data.date,
            metadata: data.notes ? { notes: data.notes } : {},
            is_recurring: data.isRecurring || false,
          },
        },
      }),
      transformResponse: (response: ApiResponse<{ transaction: BackendTransaction }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Transaction creation failed');
        }
        return transformTransaction(response.data.transaction);
      },
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Summary', id: 'LIST' },
        { type: 'Budget', id: 'LIST' },
        { type: 'Alert', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        // Optimistically update the transaction list
        const patchResult = dispatch(
          transactionsApi.util.updateQueryData('getTransactions', undefined, (draft) => {
            const newTransaction: Transaction = {
              id: `temp-${Date.now()}`,
              userId: '',
              type: data.type,
              amount: data.amount,
              description: data.description,
              category: data.category,
              date: data.date,
              notes: data.notes,
              isRecurring: data.isRecurring,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.unshift(newTransaction);
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          // Undo optimistic update on error
          patchResult.undo();
        }
      },
    }),

    // Update transaction
    updateTransaction: builder.mutation<Transaction, { id: string; data: UpdateTransactionData }>({
      query: ({ id, data }) => {
        const updateData: Partial<{
          type: string;
          amount: number;
          description: string;
          category: string;
          transaction_date: string;
          metadata: Record<string, unknown>;
        }> = {};
        
        if (data.type !== undefined) updateData.type = data.type;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.date !== undefined) updateData.transaction_date = data.date;
        if (data.notes !== undefined) updateData.metadata = { notes: data.notes };

        return {
          url: `/transactions/${id}`,
          method: 'PUT',
          body: { transaction: updateData },
        };
      },
      transformResponse: (response: ApiResponse<{ transaction: BackendTransaction }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Transaction update failed');
        }
        return transformTransaction(response.data.transaction);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        { type: 'Summary', id: 'LIST' },
        { type: 'Budget', id: 'LIST' },
        { type: 'Alert', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          transactionsApi.util.updateQueryData('getTransactions', undefined, (draft) => {
            const transaction = draft.find((t) => t.id === id);
            if (transaction) {
              Object.assign(transaction, data, { updatedAt: new Date().toISOString() });
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Delete transaction
    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        { type: 'Summary', id: 'LIST' },
        { type: 'Budget', id: 'LIST' },
        { type: 'Alert', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          transactionsApi.util.updateQueryData('getTransactions', undefined, (draft) => {
            const index = draft.findIndex((t) => t.id === id);
            if (index !== -1) {
              draft.splice(index, 1);
            }
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Get transaction summary
    getTransactionSummary: builder.query<
      TransactionSummary,
      { startDate?: string; endDate?: string } | void
    >({
      query: (params) => {
        if (!params) return { url: '/transactions/summary' };
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append('start_date', params.startDate);
        if (params.endDate) queryParams.append('end_date', params.endDate);
        return {
          url: `/transactions/summary?${queryParams.toString()}`
        };
      },
      transformResponse: (response: ApiResponse<BackendTransactionSummary>) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch transaction summary');
        }
        const summary = transformSummary(response.data || {} as BackendTransactionSummary);
        return summary;
      },
      providesTags: [{ type: 'Summary' }],
    }),

    // Bulk delete transactions
    bulkDeleteTransactions: builder.mutation<void, string[]>({
      query: (ids) => ({
        url: '/transactions/bulk_delete',
        method: 'POST',
        body: { transaction_ids: ids },
      }),
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'Summary', id: 'LIST' },
        { type: 'Budget', id: 'LIST' },
        { type: 'Alert', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetPaginatedTransactionsQuery,
  useGetTransactionQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionSummaryQuery,
  useBulkDeleteTransactionsMutation,
  useLazyGetTransactionsQuery,
  useLazyGetTransactionSummaryQuery,
} = transactionsApi;
