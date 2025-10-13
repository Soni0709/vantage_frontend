import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import {
  selectMonthlyBudget,
  setBudgetAmount,
  dismissAlert,
} from '../../store/slices/monthlyBudgetSlice';
import { formatINR } from '../../utils';
import AddBudgetModal from './AddBudgetModal';

const UnifiedBudgetDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const monthlyBudget = useAppSelector(selectMonthlyBudget);
  
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editValue, setEditValue] = useState(monthlyBudget.amount.toString());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSaveBudget = () => {
    const newAmount = parseFloat(editValue);
    if (!isNaN(newAmount) && newAmount > 0) {
      dispatch(setBudgetAmount(newAmount));
      setIsEditingBudget(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(monthlyBudget.amount.toString());
    setIsEditingBudget(false);
  };

  // Determine color scheme based on usage
  const getColorScheme = () => {
    if (monthlyBudget.alertLevel === 'critical') {
      return {
        bg: 'from-red-500/10 to-red-600/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        progressBg: 'bg-red-500',
        icon: '🚨',
      };
    } else if (monthlyBudget.alertLevel === 'warning') {
      return {
        bg: 'from-amber-500/10 to-orange-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        progressBg: 'bg-amber-500',
        icon: '⚠️',
      };
    }
    return {
      bg: 'from-green-500/10 to-emerald-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      progressBg: 'bg-green-500',
      icon: '✅',
    };
  };

  const colors = getColorScheme();

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5">
      {/* Monthly Budget Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Monthly Budget</h3>
              <p className="text-xs text-gray-400">Track your spending</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isEditingBudget && (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-gray-300 hover:text-white text-sm font-medium"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all text-purple-400 font-medium text-sm"
            >
              + Add Category
            </button>
          </div>
        </div>

        {/* Budget Amount Edit */}
        {isEditingBudget ? (
          <div className="mb-6 p-4 bg-white/[0.02] rounded-xl border border-purple-500/20">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Set Monthly Budget
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full bg-gray-800/50 border border-white/10 rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Enter amount"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSaveBudget}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Budget Display */
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold">{formatINR(monthlyBudget.amount, false)}</span>
              <span className="text-sm text-gray-400">/ month</span>
            </div>
            <p className="text-xs text-gray-500">Your spending limit</p>
          </div>
        )}

        {/* Alert Banner */}
        {monthlyBudget.alertMessage && monthlyBudget.alertLevel !== 'none' && (
          <div className={`mb-6 p-4 bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl`}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{colors.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${colors.text}`}>
                  {monthlyBudget.alertMessage}
                </p>
              </div>
              <button
                onClick={() => dispatch(dismissAlert())}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-xs text-gray-400 mb-1">Total Spent</p>
            <p className="text-xl font-bold text-red-400">
              {formatINR(monthlyBudget.totalExpense, false)}
            </p>
          </div>
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-xs text-gray-400 mb-1">Remaining</p>
            <p className={`text-xl font-bold ${monthlyBudget.remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
              {formatINR(Math.abs(monthlyBudget.remainingBudget), false)}
              {monthlyBudget.remainingBudget < 0 && <span className="text-sm ml-1">(over)</span>}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Usage</span>
            <span className={`font-semibold ${colors.text}`}>
              {monthlyBudget.usagePercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
            <div
              className={`${colors.progressBg} h-3 rounded-full transition-all duration-500 ease-out relative`}
              style={{ width: `${Math.min(monthlyBudget.usagePercentage, 100)}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
          {monthlyBudget.usagePercentage > 100 && (
            <p className="text-xs text-red-400 text-right">
              {(monthlyBudget.usagePercentage - 100).toFixed(1)}% over budget
            </p>
          )}
        </div>

        {/* Income Display */}
        {monthlyBudget.totalIncome > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Income</span>
              <span className="font-semibold text-blue-400">
                {formatINR(monthlyBudget.totalIncome, false)}
              </span>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {monthlyBudget.lastUpdated && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 text-center">
              Last updated: {new Date(monthlyBudget.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default UnifiedBudgetDashboard;
