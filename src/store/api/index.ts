// Export all API endpoints
export * from './baseApi';
export * from './transactionsApi';
export * from './recurringTransactionsApi';
export * from './budgetsApi';
export * from './savingsGoalsApi';

// Explicitly re-export savings goals hooks
export {
  useGetSavingsGoalsQuery,
  useGetSavingsGoalsSummaryQuery,
  useGetSavingsGoalQuery,
  useCreateSavingsGoalMutation,
  useUpdateSavingsGoalMutation,
  useDeleteSavingsGoalMutation,
  useAddAmountToGoalMutation,
} from './savingsGoalsApi';
