import { baseApi } from './baseApi';
import type {
  RecurringTransaction,
  CreateRecurringTransactionData,
  UpdateRecurringTransactionData,
  BackendRecurringTransaction,
  RecurringConfig,
} from '../../types/transaction';

// API Response interface
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Transform backend recurring transaction to frontend format
const transformRecurringTransaction = (
  backendTransaction: BackendRecurringTransaction
): RecurringTransaction => {
  return {
    id: backendTransaction.id,
    userId: backendTransaction.user_id, // Optional field
    type: backendTransaction.type,
    amount: parseFloat(backendTransaction.amount.toString()),
    description: backendTransaction.description,
    category: backendTransaction.category,
    notes: backendTransaction.notes || undefined,
    frequency: backendTransaction.frequency,
    startDate: backendTransaction.start_date,
    endDate: backendTransaction.end_date || undefined,
    lastProcessed: backendTransaction.last_processed || undefined,
    nextOccurrence: backendTransaction.next_occurrence,
    isActive: backendTransaction.is_active,
    config: (backendTransaction.config || {}) as unknown as RecurringConfig,
    createdAt: backendTransaction.created_at,
    updatedAt: backendTransaction.updated_at,
  };
};

// Recurring Transactions API
export const recurringTransactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all recurring transactions
    getRecurringTransactions: builder.query<RecurringTransaction[], { active?: boolean } | void>({
      query: (params) => {
        if (!params) return { url: '/recurring_transactions' };
        const queryParams = new URLSearchParams();
        // Backend expects 'is_active' not 'active'
        if (params.active !== undefined) queryParams.append('is_active', params.active.toString());
        return {
          url: `/recurring_transactions?${queryParams.toString()}`
        };
      },
      transformResponse: (response: ApiResponse<{ recurring_transactions: BackendRecurringTransaction[] }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch recurring transactions');
        }
        return response.data.recurring_transactions.map(transformRecurringTransaction);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'RecurringTransaction' as const, id })),
              { type: 'RecurringTransaction', id: 'LIST' },
            ]
          : [{ type: 'RecurringTransaction', id: 'LIST' }],
    }),

    // Get single recurring transaction
    getRecurringTransaction: builder.query<RecurringTransaction, string>({
      query: (id) => ({
        url: `/recurring_transactions/${id}`
      }),
      transformResponse: (response: ApiResponse<{ recurring_transaction: BackendRecurringTransaction }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch recurring transaction');
        }
        return transformRecurringTransaction(response.data.recurring_transaction);
      },
      providesTags: (_result, _error, id) => [{ type: 'RecurringTransaction', id }],
    }),

    // Create recurring transaction
    createRecurringTransaction: builder.mutation<RecurringTransaction, CreateRecurringTransactionData>({
      query: (data) => ({
        url: '/recurring_transactions',
        method: 'POST',
        body: {
          recurring_transaction: {
            type: data.type,
            amount: data.amount,
            description: data.description,
            category: data.category,
            notes: data.notes,
            frequency: data.frequency,
            start_date: data.startDate,
            end_date: data.endDate,
            config: data.config,
          },
        },
      }),
      transformResponse: (response: ApiResponse<{ recurring_transaction: BackendRecurringTransaction }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Recurring transaction creation failed');
        }
        return transformRecurringTransaction(response.data.recurring_transaction);
      },
      invalidatesTags: [{ type: 'RecurringTransaction', id: 'LIST' }],
    }),

    // Update recurring transaction
    updateRecurringTransaction: builder.mutation<
      RecurringTransaction,
      { id: string; data: UpdateRecurringTransactionData }
    >({
      query: ({ id, data }) => {
        const updateData: Partial<{
          type: string;
          amount: number;
          description: string;
          category: string;
          notes?: string;
          frequency: string;
          end_date?: string;
          is_active: boolean;
          config: Partial<RecurringConfig>;
        }> = {};
        
        if (data.type !== undefined) updateData.type = data.type;
        if (data.amount !== undefined) updateData.amount = data.amount;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.notes !== undefined) updateData.notes = data.notes;
        if (data.frequency !== undefined) updateData.frequency = data.frequency;
        if (data.endDate !== undefined) updateData.end_date = data.endDate;
        if (data.isActive !== undefined) updateData.is_active = data.isActive;
        if (data.config !== undefined) updateData.config = data.config;

        return {
          url: `/recurring_transactions/${id}`,
          method: 'PUT',
          body: { recurring_transaction: updateData },
        };
      },
      transformResponse: (response: ApiResponse<{ recurring_transaction: BackendRecurringTransaction }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Recurring transaction update failed');
        }
        return transformRecurringTransaction(response.data.recurring_transaction);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecurringTransaction', id },
        { type: 'RecurringTransaction', id: 'LIST' },
      ],
    }),

    // Delete recurring transaction
    deleteRecurringTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recurring_transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'RecurringTransaction', id },
        { type: 'RecurringTransaction', id: 'LIST' },
      ],
    }),

    // Pause/Resume recurring transaction
    toggleRecurringTransaction: builder.mutation<RecurringTransaction, { id: string; isActive: boolean }>({
      query: ({ id }) => ({
        url: `/recurring_transactions/${id}/toggle`,
        method: 'PATCH',
        // Backend's toggle_active! method doesn't need the is_active param
      }),
      transformResponse: (response: ApiResponse<{ recurring_transaction: BackendRecurringTransaction }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to toggle recurring transaction');
        }
        return transformRecurringTransaction(response.data.recurring_transaction);
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RecurringTransaction', id },
        { type: 'RecurringTransaction', id: 'LIST' },
      ],
    }),

    // Process recurring transactions (generate due transactions)
    processRecurringTransactions: builder.mutation<{ count: number; transactions: string[] }, void>({
      query: () => ({
        url: '/recurring_transactions/process_due',
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ 
        processed_count: number; 
        processed: Array<{ transaction_id: string; recurring_transaction_id: string; amount: number }>;
      }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to process recurring transactions');
        }
        return {
          count: response.data.processed_count,
          transactions: response.data.processed.map(p => p.transaction_id),
        };
      },
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        { type: 'RecurringTransaction', id: 'LIST' },
        { type: 'Summary' },
      ],
    }),

    // Get upcoming recurring transactions
    getUpcomingRecurring: builder.query<
      Array<RecurringTransaction & { nextAmount: number; daysUntil: number }>,
      { days?: number } | void
    >({
      query: (params) => {
        const days = params?.days || 30;
        return {
          url: `/recurring_transactions/upcoming?days=${days}`
        };
      },
      transformResponse: (response: ApiResponse<{
        recurring_transactions: BackendRecurringTransaction[];
      }>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch upcoming recurring transactions');
        }
        // Calculate days until for each transaction since backend doesn't provide it
        return response.data.recurring_transactions.map((item) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextDate = new Date(item.next_occurrence);
          nextDate.setHours(0, 0, 0, 0);
          const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...transformRecurringTransaction(item),
            nextAmount: parseFloat(item.amount.toString()),
            daysUntil: daysUntil,
          };
        });
      },
      providesTags: [{ type: 'RecurringTransaction', id: 'UPCOMING' }],
    }),
  }),
});

export const {
  useGetRecurringTransactionsQuery,
  useGetRecurringTransactionQuery,
  useCreateRecurringTransactionMutation,
  useUpdateRecurringTransactionMutation,
  useDeleteRecurringTransactionMutation,
  useToggleRecurringTransactionMutation,
  useProcessRecurringTransactionsMutation,
  useGetUpcomingRecurringQuery,
  useLazyGetRecurringTransactionsQuery,
  useLazyGetUpcomingRecurringQuery,
} = recurringTransactionsApi;
