import React, { useState } from 'react';
import { useGetBudgetsQuery } from '../../store/api';
import { formatINR } from '../../utils';
import AddBudgetModal from '../budget/AddBudgetModal';

const BudgetSection: React.FC = () => {
  const { data: budgets = [], isLoading: budgetsLoading } = useGetBudgetsQuery();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Budget Tracking</h3>
            <p className="text-sm text-gray-400 mt-0.5">Monitor your spending</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all text-purple-400 font-medium text-sm"
          >
            + Add
          </button>
        </div>

        {budgetsLoading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">No budgets set</p>
            <p className="text-sm text-gray-500 mt-1">Create a budget to track spending</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.slice(0, 4).map(budget => {
              const percentUsed = budget.percentageUsed;
              const isOverBudget = percentUsed > 100;
              const isWarning = percentUsed > 80 && percentUsed <= 100;
              
              return (
                <div key={budget.id} className="p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium">{budget.category}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{budget.period}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {formatINR(budget.spent, false)} / {formatINR(budget.amount, false)}
                      </p>
                      <p className={`text-sm font-semibold mt-0.5 ${
                        isOverBudget ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-green-400'
                      }`}>
                        {percentUsed.toFixed(0)}% used
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800/50 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${
                        isOverBudget ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {budgets.length > 4 && (
          <div className="mt-4 text-center">
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              View All Budgets →
            </button>
          </div>
        )}
      </div>

      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
};

export default BudgetSection;
