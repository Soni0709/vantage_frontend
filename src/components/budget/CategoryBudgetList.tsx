import React, { useState } from 'react';
import { useGetBudgetsQuery, useDeleteBudgetMutation, useUpdateBudgetMutation } from '../../store/api';
import { formatINR } from '../../utils';
import type { Budget } from '../../types';

interface CategoryBudgetListProps {
  onEdit?: (budget: Budget) => void;
}

const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ onEdit }) => {
  const { data: budgets = [], isLoading, error } = useGetBudgetsQuery({ isActive: true });
  const [deleteBudget] = useDeleteBudgetMutation();
  const [updateBudget] = useUpdateBudgetMutation();
  const [expandedBudgetId, setExpandedBudgetId] = useState<string | null>(null);

  const handleDelete = async (budgetId: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(budgetId).unwrap();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const handleToggleActive = async (budget: Budget) => {
    try {
      await updateBudget({
        id: budget.id,
        data: { isActive: !budget.isActive }
      }).unwrap();
    } catch (error) {
      console.error('Failed to toggle budget:', error);
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return {
      bg: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500/30',
      bgLight: 'bg-red-500/10'
    };
    if (percentage >= 80) return {
      bg: 'bg-amber-500',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      bgLight: 'bg-amber-500/10'
    };
    if (percentage >= 60) return {
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      bgLight: 'bg-yellow-500/10'
    };
    return {
      bg: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500/30',
      bgLight: 'bg-green-500/10'
    };
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Food & Dining': '🍽️',
      'Groceries': '🛒',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Bills & Utilities': '💡',
      'Healthcare': '🏥',
      'Education': '📚',
      'Housing': '🏠',
      'Insurance': '🛡️',
      'Travel': '✈️',
      'Personal Care': '💆',
      'Gifts & Donations': '🎁',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/5 animate-pulse">
            <div className="h-6 bg-white/5 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-red-400 text-sm">Failed to load budgets. Please try again.</p>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white/[0.02] rounded-xl p-8 border border-white/5 text-center">
        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Category Budgets</h3>
        <p className="text-sm text-gray-400 mb-4">
          Create category-specific budgets to track your spending by category
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {budgets.map(budget => {
        const colors = getProgressColor(budget.percentageUsed);
        const isExpanded = expandedBudgetId === budget.id;

        return (
          <div
            key={budget.id}
            className={`bg-white/[0.02] rounded-xl border transition-all ${
              budget.percentageUsed >= 100 
                ? 'border-red-500/30' 
                : budget.percentageUsed >= 80 
                ? 'border-amber-500/30' 
                : 'border-white/5'
            }`}
          >
            {/* Main Content */}
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{getCategoryIcon(budget.category)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white truncate">{budget.category}</h4>
                    <p className="text-xs text-gray-400">{budget.period}</p>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedBudgetId(isExpanded ? null : budget.id)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Budget</p>
                  <p className="text-sm font-semibold">{formatINR(budget.amount, false)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Spent</p>
                  <p className={`text-sm font-semibold ${colors.text}`}>
                    {formatINR(budget.spent, false)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Left</p>
                  <p className={`text-sm font-semibold ${
                    budget.remaining < 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {formatINR(Math.abs(budget.remaining), false)}
                    {budget.remaining < 0 && <span className="text-xs ml-1">(over)</span>}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Progress</span>
                  <span className={`font-semibold ${colors.text}`}>
                    {budget.percentageUsed.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                  <div
                    className={`${colors.bg} h-2 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                  />
                </div>
                {budget.percentageUsed > 100 && (
                  <p className="text-xs text-red-400 text-right">
                    {(budget.percentageUsed - 100).toFixed(1)}% over budget
                  </p>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-white/5 px-4 py-3 space-y-3">
                {/* Date Range */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Period</span>
                  <span className="text-gray-200">
                    {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(budget)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm"
                  >
                    {budget.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(budget)}
                      className="flex-1 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg transition-colors text-purple-400 text-sm"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-red-400 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryBudgetList;
