import { baseApi } from './baseApi';
import type { 
  SavingsGoal, 
  SavingsGoalFormData, 
  SavingsGoalSummary} from '../../types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const savingsGoalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/savings_goals
    getSavingsGoals: builder.query<SavingsGoal[], { status?: 'active' | 'completed' | 'paused' }>({
      query: (params) => ({
        url: '/savings_goals',
        params,
      }),
      transformResponse: (response: ApiResponse<{ savings_goals: SavingsGoal[] }>) => 
        response.data.savings_goals,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SavingsGoal' as const, id })),
              { type: 'SavingsGoal', id: 'LIST' },
            ]
          : [{ type: 'SavingsGoal', id: 'LIST' }],
    }),

    // GET /api/v1/savings_goals/summary
    getSavingsGoalsSummary: builder.query<SavingsGoalSummary, void>({
      query: () => ({
        url: '/savings_goals/summary'
      }),
      transformResponse: (response: ApiResponse<SavingsGoalSummary>) => response.data,
      providesTags: [{ type: 'SavingsGoal', id: 'SUMMARY' }],
    }),

    // GET /api/v1/savings_goals/:id
    getSavingsGoal: builder.query<SavingsGoal, string>({
      query: (id) => ({
        url: `/savings_goals/${id}`
      }),
      transformResponse: (response: ApiResponse<{ savings_goal: SavingsGoal }>) => 
        response.data.savings_goal,
      providesTags: (_result, _error, id) => [{ type: 'SavingsGoal', id }],
    }),

    // POST /api/v1/savings_goals
    createSavingsGoal: builder.mutation<SavingsGoal, SavingsGoalFormData>({
      query: (data) => ({
        url: '/savings_goals',
        method: 'POST',
        body: { savings_goal: data },
      }),
      transformResponse: (response: ApiResponse<{ savings_goal: SavingsGoal }>) => 
        response.data.savings_goal,
      invalidatesTags: [{ type: 'SavingsGoal', id: 'LIST' }, { type: 'SavingsGoal', id: 'SUMMARY' }],
    }),

    // PUT /api/v1/savings_goals/:id
    updateSavingsGoal: builder.mutation<SavingsGoal, { id: string; data: Partial<SavingsGoalFormData> }>({
      query: ({ id, data }) => ({
        url: `/savings_goals/${id}`,
        method: 'PUT',
        body: { savings_goal: data },
      }),
      transformResponse: (response: ApiResponse<{ savings_goal: SavingsGoal }>) => 
        response.data.savings_goal,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SavingsGoal', id },
        { type: 'SavingsGoal', id: 'LIST' },
        { type: 'SavingsGoal', id: 'SUMMARY' },
      ],
    }),

    // DELETE /api/v1/savings_goals/:id
    deleteSavingsGoal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/savings_goals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SavingsGoal', id },
        { type: 'SavingsGoal', id: 'LIST' },
        { type: 'SavingsGoal', id: 'SUMMARY' },
      ],
    }),

    // PATCH /api/v1/savings_goals/:id/add_amount
    addAmountToGoal: builder.mutation<SavingsGoal, { id: string; amount: number }>({
      query: ({ id, amount }) => ({
        url: `/savings_goals/${id}/add_amount`,
        method: 'PATCH',
        body: { amount },
      }),
      transformResponse: (response: ApiResponse<{ savings_goal: SavingsGoal }>) => 
        response.data.savings_goal,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SavingsGoal', id },
        { type: 'SavingsGoal', id: 'LIST' },
        { type: 'SavingsGoal', id: 'SUMMARY' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSavingsGoalsQuery,
  useGetSavingsGoalsSummaryQuery,
  useGetSavingsGoalQuery,
  useCreateSavingsGoalMutation,
  useUpdateSavingsGoalMutation,
  useDeleteSavingsGoalMutation,
  useAddAmountToGoalMutation,
} = savingsGoalsApi;
