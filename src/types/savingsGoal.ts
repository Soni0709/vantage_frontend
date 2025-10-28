export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  deadline: string | null;
  status: 'active' | 'completed' | 'paused';
  description: string | null;
  is_reached: boolean;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoalFormData {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string;
  status?: 'active' | 'completed' | 'paused';
  description?: string;
}

export interface SavingsGoalSummary {
  total_target: number;
  total_saved: number;
  total_remaining: number;
  overall_progress: number;
  goals_count: number;
  active_count: number;
  completed_count: number;
  goals: SavingsGoal[];
}

export interface AddAmountData {
  amount: number;
}
