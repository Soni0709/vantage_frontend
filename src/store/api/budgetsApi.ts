// ✅ Import the base API configuration (with token handling, re-auth logic)
import { baseApi } from './baseApi';

// ✅ Import type definitions for strong typing throughout the file
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


// --------------------
// TRANSFORM FUNCTIONS
// --------------------
// These help convert raw backend data (snake_case, decimal strings)
// into clean frontend types (camelCase, numbers, etc.)

const transformBudget = (backend: BackendBudget): Budget => ({
  id: backend.id,
  userId: backend.user_id,                  // Convert backend snake_case → camelCase
  category: backend.category,
  amount: parseFloat(backend.amount.toString()), // Convert string/decimal → number
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
  // Map over each category in the backend response
  categoryBreakdown: backend.category_breakdown.map(cat => ({
    category: cat.category,
    budgeted: parseFloat(cat.budgeted.toString()),
    spent: parseFloat(cat.spent.toString()),
    remaining: parseFloat(cat.remaining.toString()),
    percentage: parseFloat(cat.percentage.toString()),
  })),
});


// --------------------
// BUDGETS API ENDPOINTS
// --------------------
// Inject all budget-related endpoints into baseApi (inherits baseQueryWithReauth)
export const budgetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🧩 GET: all budgets (with optional filters)
    getBudgets: builder.query<Budget[], BudgetFilters | void>({
      // Build query string based on filters (category, period, isActive)
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.period) params.append('period', filters.period);
        if (filters?.isActive !== undefined)
          params.append('is_active', filters.isActive.toString());
        
        const queryString = params.toString();
        // Return final URL as object with url property
        return {
          url: queryString ? `/budgets?${queryString}` : '/budgets'
        };
      },
      // Convert backend budgets → frontend Budget[]
      transformResponse: (response: { success: boolean; data: { budgets: BackendBudget[] } }) =>
        response.data.budgets.map(transformBudget),
      // Cache tagging: each budget + the list tag
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Budget' as const, id })), { type: 'Budget', id: 'LIST' }]
          : [{ type: 'Budget', id: 'LIST' }],
    }),

    // 🧩 GET: single budget by ID
    getBudget: builder.query<Budget, string>({
      query: (id) => ({
        url: `/budgets/${id}`
      }),
      transformResponse: (response: { success: boolean; data: { budget: BackendBudget } }) =>
        transformBudget(response.data.budget),
      providesTags: (result, error, id) => [{ type: 'Budget', id }],
    }),

    // 🧩 POST: create a new budget
    createBudget: builder.mutation<Budget, CreateBudgetData>({
      query: (data) => ({
        url: '/budgets',
        method: 'POST',
        body: {
          budget: {
            category: data.category,
            amount: data.amount,
            period: data.period,
            start_date: data.startDate, // Backend expects snake_case
          },
        },
      }),
      transformResponse: (response: { success: boolean; data: { budget: BackendBudget } }) =>
        transformBudget(response.data.budget),
      // Invalidate relevant caches so UI refetches fresh data
      invalidatesTags: [
        { type: 'Budget', id: 'LIST' },
        { type: 'Summary' },
        { type: 'Transaction', id: 'SUMMARY' },
      ],
    }),

    // 🧩 PUT: update existing budget by ID
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
        { type: 'Budget', id },         // refresh updated budget
        { type: 'Budget', id: 'LIST' }, // refresh list view
        { type: 'Summary' },
        { type: 'Alert', id: 'LIST' },
      ],
    }),

    // 🧩 DELETE: remove budget by ID
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

    // 🧩 GET: overall summary across all budgets
    getBudgetSummary: builder.query<BudgetSummary, void>({
      query: () => ({
        url: '/budgets/summary'
      }),
      transformResponse: (response: { success: boolean; data: BackendBudgetSummary }) =>
        transformSummary(response.data),
      providesTags: [{ type: 'Summary' }],
    }),

    // 🧩 GET: budget alerts (warnings, overuse, etc.)
    getAlerts: builder.query<BudgetAlert[], AlertFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.isRead !== undefined)
          params.append('is_read', filters.isRead.toString());
        if (filters?.severity) params.append('severity', filters.severity);
        
        const queryString = params.toString();
        return {
          url: queryString ? `/budgets/alerts?${queryString}` : '/budgets/alerts'
        };
      },
      transformResponse: (response: { success: boolean; data: { alerts: BackendBudgetAlert[] } }) =>
        response.data.alerts.map(transformAlert),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Alert' as const, id })), { type: 'Alert', id: 'LIST' }]
          : [{ type: 'Alert', id: 'LIST' }],
    }),

    // 🧩 POST: recalculate budgets on backend (useful if data changed)
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

    // 🧩 POST: mark an alert as read
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

    // 🧩 PATCH: acknowledge an alert (e.g., user accepted it)
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


// --------------------
// AUTO-GENERATED HOOKS
// --------------------
// RTK Query automatically generates React hooks for each endpoint above.
// These hooks handle data fetching, caching, re-fetching, and mutations.
export const {
  useGetBudgetsQuery,           // GET /budgets
  useGetBudgetQuery,            // GET /budgets/:id
  useCreateBudgetMutation,      // POST /budgets
  useUpdateBudgetMutation,      // PUT /budgets/:id
  useDeleteBudgetMutation,      // DELETE /budgets/:id
  useGetBudgetSummaryQuery,     // GET /budgets/summary
  useGetAlertsQuery,            // GET /budgets/alerts with filters
  useRefreshBudgetsMutation,    // POST /budgets/refresh
  useMarkAlertReadMutation,     // PATCH /budgets/:id/alerts/:alertId/read
  useAcknowledgeAlertMutation,  // PATCH /budgets/:id/alerts/:alertId/acknowledge
} = budgetsApi;
