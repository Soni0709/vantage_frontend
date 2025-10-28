import { 
  useGetSavingsGoalsQuery,
  useGetSavingsGoalsSummaryQuery,
  useGetSavingsGoalQuery,
  useCreateSavingsGoalMutation,
  useUpdateSavingsGoalMutation,
  useDeleteSavingsGoalMutation,
  useAddAmountToGoalMutation,
} from '../store/api';
import type { SavingsGoalFormData } from '../types';

interface UseSavingsGoalsOptions {
  status?: 'active' | 'completed' | 'paused';
}

export const useSavingsGoals = (options: UseSavingsGoalsOptions = {}) => {
  const { data: goals = [], isLoading, error } = useGetSavingsGoalsQuery(options);
  const { data: summary } = useGetSavingsGoalsSummaryQuery();
  
  const [createGoal, { isLoading: isCreating }] = useCreateSavingsGoalMutation();
  const [updateGoal, { isLoading: isUpdating }] = useUpdateSavingsGoalMutation();
  const [deleteGoal, { isLoading: isDeleting }] = useDeleteSavingsGoalMutation();
  const [addAmount, { isLoading: isAddingAmount }] = useAddAmountToGoalMutation();

  const create = async (data: SavingsGoalFormData) => {
    try {
      return await createGoal(data).unwrap();
    } catch (error) {
      console.error('Failed to create savings goal:', error);
      throw error;
    }
  };

  const update = async (id: string, data: Partial<SavingsGoalFormData>) => {
    try {
      return await updateGoal({ id, data }).unwrap();
    } catch (error) {
      console.error('Failed to update savings goal:', error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteGoal(id).unwrap();
    } catch (error) {
      console.error('Failed to delete savings goal:', error);
      throw error;
    }
  };

  const addAmountToGoal = async (id: string, amount: number) => {
    try {
      return await addAmount({ id, amount }).unwrap();
    } catch (error) {
      console.error('Failed to add amount to goal:', error);
      throw error;
    }
  };

  return {
    goals,
    summary,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    isAddingAmount,
    create,
    update,
    delete: remove,
    addAmount: addAmountToGoal,
  };
};

export const useSavingsGoal = (id: string) => {
  const { data: goal, isLoading, error } = useGetSavingsGoalQuery(id);
  
  return {
    goal,
    isLoading,
    error,
  };
};
