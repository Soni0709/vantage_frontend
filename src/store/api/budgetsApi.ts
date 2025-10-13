import { baseApi } from './baseApi';
import type {
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
  BudgetAlert,
  BudgetSummary,
  BudgetFilters,
  AlertFilters,
  BackendBudget,
  BackendBudgetAlert,
  BackendBudgetSummary,
} from '../../types';

// Transform functions
const transformBudget = (backend: BackendBudget): Budget => ({
  id: backend.id,
  userId: backend.user_id,
  category: backend.category,
  amount: parseFloat(backend.amount.toString()),
  period: backend.period,
  spent: parseFloat(backend.spent.toString()),
  remaining: parseFloat(backend.remaining.toString()),
  percentageUsed: parseFloat(backend.percentage_used.toString()),
  isActive: backend.is_active,
  startDate: backend.start_date,
  endDate: backend.end_date,
  createdAt: backend.created_at,
  updatedAt: backend.updated_at,
});

const transformAlert = (backend: BackendBudgetAlert): BudgetAlert => ({
  id: backend.id,
  budgetId: backend.budget_id,
  severity: backend.severity,
  message: backend.message,
  threshold: backend.threshold,
  isRead: backend.is_read,
  isAcknowledged: backend.is_acknowledged,
  createdAt: backend.created_at,
});

const transformSummary = (backend: BackendBudgetSummary): BudgetSummary => ({
  totalBudgeted: parseFloat(backend.total_budgeted.toString()),
  totalSpent: parseFloat(backend.total_spent.toString()),
  totalRemaining: parseFloat(backend.total_remaining.toString()),
  overallPercentage: parseFloat(backend.overall_percentage.toString()),
  categoryBreakdown: backend.category_breakdown.map(cat => ({
    category: cat.category,
    budgeted: parseFloat(cat.budgeted.toString()),
    spent: parseFloat(cat.spent.toString()),
    remaining: parseFloat(cat.remaining.toString()),
    percentage: parseFloat(cat.percentage.toString()),
  })),
});

export const budgetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all budgets
    getBudgets: builder.query<Budget[], BudgetFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.period) params.append('period', filters.period);
        if (filters?.isActive !== undefined) params.append('is_active', filters.isActive.toString());
        
        const queryString = params.toString();
        return queryString ? `/budgets?${queryString}` : '/budgets';
      },
      transformResponse: (response: { success: boolean; data: { budgets: BackendBudget[] } }) =>
        response.data.budgets.map(transformBudget),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Budget' as const, id })), { type: 'Budget', id: 'LIST' }]
          : [{ type: 'Budget', id: 'LIST' }],
    }),

    // Get single budget
    getBudget: builder.query<Budget, string>({
      query: (id) => `/budgets/${id}`,
      transformResponse: (response: { success: boolean; data: { budget: BackendBudget } }) =>
        transformBudget(response.data.budget),
      providesTags: (result, error, id) => [{ type: 'Budget', id }],
    }),

    // Create budget
    createBudget: builder.mutation<Budget, CreateBudgetData>({
      query: (data) => ({
        url: '/budgets',
        method: 'POST',
        body: {
          budget: {
            category: data.category,
            amount: data.amount,
            period: data.period,
            start_date: data.startDate,
          },
        },
      }),
      transformResponse: (response: { success: boolean; data: { budget: BackendBudget } }) =>
        transformBudget(response.data.budget),
      invalidatesTags: [
        { type: 'Budget', id: 'LIST' },
        { type: 'Summary' },
        { type: 'Transaction', id: 'SUMMARY' },
      ],
    }),

    // Update budget
    updateBudget: builder.mutation<Budget, { id: string; data: UpdateBudgetData }>({
      query: ({ id, data }) => ({
        url: `/budgets/${id}`,
        method: 'PUT',
        body: {
          budget: {
            category: data.category,
            amount: data.amount,
            period: data.period,
            is_active: data.isActive,
          },
        },
      }),
      transformResponse: (response: { success: boolean; data: { budget: BackendBudget } }) =>
        transformBudget(response.data.budget),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Budget', id },
        { type: 'Budget', id: 'LIST' },
        { type: 'Summary' },
        { type: 'Alert', id: 'LIST' },
      ],
    }),

    // Delete budget
    deleteBudget: builder.mutation<void, string>({
      query: (id) => ({
        url: `/budgets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Budget', id },
        { type: 'Budget', id: 'LIST' },
        { type: 'Summary' },
      ],
    }),

    // Get budget summary
    getBudgetSummary: builder.query<BudgetSummary, void>({
      query: () => '/budgets/summary',
      transformResponse: (response: { success: boolean; data: BackendBudgetSummary }) =>
        transformSummary(response.data),
      providesTags: [{ type: 'Summary' }],
    }),

    // Get alerts
    getAlerts: builder.query<BudgetAlert[], AlertFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.isRead !== undefined) params.append('is_read', filters.isRead.toString());
        if (filters?.severity) params.append('severity', filters.severity);
        
        const queryString = params.toString();
        return queryString ? `/budgets/alerts?${queryString}` : '/budgets/alerts';
      },
      transformResponse: (response: { success: boolean; data: { alerts: BackendBudgetAlert[] } }) =>
        response.data.alerts.map(transformAlert),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Alert' as const, id })), { type: 'Alert', id: 'LIST' }]
          : [{ type: 'Alert', id: 'LIST' }],
    }),

    // Refresh budgets (recalculate)
    refreshBudgets: builder.mutation<void, void>({
      query: () => ({
        url: '/budgets/refresh',
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Budget', id: 'LIST' },
        { type: 'Summary' },
        { type: 'Alert', id: 'LIST' },
      ],
    }),

    // Mark alert as read
    markAlertRead: builder.mutation<void, { budgetId: string; alertId: string }>({
      query: ({ budgetId, alertId }) => ({
        url: `/budgets/${budgetId}/alerts/${alertId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { alertId }) => [
        { type: 'Alert', id: alertId },
        { type: 'Alert', id: 'LIST' },
      ],
    }),

    // Acknowledge alert
    acknowledgeAlert: builder.mutation<void, { budgetId: string; alertId: string }>({
      query: ({ budgetId, alertId }) => ({
        url: `/budgets/${budgetId}/alerts/${alertId}/acknowledge`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, { alertId }) => [
        { type: 'Alert', id: alertId },
        { type: 'Alert', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetBudgetsQuery,
  useGetBudgetQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetSummaryQuery,
  useGetAlertsQuery,
  useRefreshBudgetsMutation,
  useMarkAlertReadMutation,
  useAcknowledgeAlertMutation,
} = budgetsApi;
