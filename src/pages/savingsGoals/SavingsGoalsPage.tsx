import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout';
import { useSavingsGoals } from '../../hooks';
import { useToast } from '../../contexts';
import { formatINR } from '../../utils';
import { SavingsGoalModal, AddAmountModal } from '../../components/savingsGoals';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

const SavingsGoalsPage: React.FC = () => {
  const { goals, summary, isLoading, create, update, delete: deleteGoal, addAmount } = useSavingsGoals({ status: 'active' });
  const toast = useToast();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAddAmountModalOpen, setIsAddAmountModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreateGoal = async (data: SavingsGoalFormData) => {
    try {
      await create(data);
      toast.success('Savings goal created successfully!');
      setIsGoalModalOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to create savings goal');
    }
  };

  const handleUpdateGoal = async (data: SavingsGoalFormData) => {
    if (!selectedGoal) return;
    
    try {
      await update(selectedGoal.id, data);
      toast.success('Savings goal updated successfully!');
      setIsGoalModalOpen(false);
      setSelectedGoal(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update savings goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
      toast.success('Savings goal deleted successfully!');
      setDeleteConfirmId(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to delete savings goal');
    }
  };

  const handleAddAmount = async (amount: number) => {
    if (!selectedGoal) return;
    
    try {
      await addAmount(selectedGoal.id, amount);
      toast.success(`Added ${formatINR(amount)} to ${selectedGoal.name}!`);
      setIsAddAmountModalOpen(false);
      setSelectedGoal(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to add amount');
    }
  };

  const openEditModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsGoalModalOpen(true);
  };

  const openAddAmountModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setIsAddAmountModalOpen(true);
  };

  const closeModals = () => {
    setIsGoalModalOpen(false);
    setIsAddAmountModalOpen(false);
    setSelectedGoal(undefined);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading savings goals...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Savings Goals</h1>
            <p className="text-gray-400">Track and manage your savings targets</p>
          </div>
          
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-xl transition-all font-medium text-sm flex items-center gap-2 w-fit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Savings Goal</span>
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">Total Target</p>
                <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold">{formatINR(summary.total_target, false)}</h3>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-green-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">Total Saved</p>
                <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-green-400">{formatINR(summary.total_saved, false)}</h3>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">Remaining</p>
                <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold">{formatINR(summary.total_remaining, false)}</h3>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-blue-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">Overall Progress</p>
                <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold">{Number(summary.overall_progress || 0).toFixed(1)}%</h3>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1 truncate">{goal.name}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{goal.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => openAddAmountModal(goal)}
                      className="p-2 hover:bg-green-500/10 rounded-lg transition-all"
                      title="Add amount"
                    >
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-2 hover:bg-purple-500/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(goal.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Current</span>
                    <span className="font-semibold text-purple-400">
                      {formatINR(goal.current_amount, false)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Number(goal.progress_percentage) || 0, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Target</span>
                    <span className="font-semibold">
                      {formatINR(goal.target_amount, false)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {goal.is_reached && (
                      <div className="flex items-center gap-1 text-xs text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Goal Reached!</span>
                      </div>
                    )}
                    
                    {goal.is_overdue && !goal.is_reached && (
                      <div className="flex items-center gap-1 text-xs text-red-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Overdue</span>
                      </div>
                    )}
                  </div>
                  
                  <span className="text-sm font-semibold text-purple-400">
                    {Number(goal.progress_percentage || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-12 border border-white/5 text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium mb-2">No savings goals yet</p>
            <p className="text-sm text-gray-500 mb-6">Create your first savings goal to start tracking your progress</p>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-xl transition-all font-medium text-sm inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create Your First Goal</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={closeModals}
        onSubmit={selectedGoal ? handleUpdateGoal : handleCreateGoal}
        goal={selectedGoal}
      />

      {selectedGoal && (
        <AddAmountModal
          isOpen={isAddAmountModalOpen}
          onClose={closeModals}
          onSubmit={handleAddAmount}
          goal={selectedGoal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-500/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Savings Goal</h3>
                <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 text-sm">
              Are you sure you want to delete this savings goal? All progress will be lost.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGoal(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SavingsGoalsPage;
