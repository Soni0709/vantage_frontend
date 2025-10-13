import React from 'react';
import { useGetBudgetsQuery } from '../../store/api';
import { formatINR } from '../../utils';
import type { TransactionSummary } from '../../types';

interface InsightsSectionProps {
  summary: TransactionSummary | null;
  financialData: {
    balance: number;
    income: number;
    expenses: number;
  };
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ summary, financialData }) => {
  const { data: budgets = [] } = useGetBudgetsQuery();

  const savingsRate = financialData.income > 0 
    ? ((financialData.balance / financialData.income) * 100).toFixed(0)
    : '0';

  const avgDailySpend = (financialData.expenses / 30).toFixed(0);

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Insights</h3>
        <p className="text-sm text-gray-400 mt-0.5">Financial patterns</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 mb-1">Transactions</p>
          <p className="text-2xl font-bold">{summary?.transactionCount || 0}</p>
        </div>
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 mb-1">Avg. Daily</p>
          <p className="text-2xl font-bold">{formatINR(parseFloat(avgDailySpend), false)}</p>
        </div>
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 mb-1">Active Budgets</p>
          <p className="text-2xl font-bold">{budgets.filter(b => b.isActive).length}</p>
        </div>
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 mb-1">Savings Rate</p>
          <p className="text-2xl font-bold">{savingsRate}%</p>
        </div>
      </div>

      {/* Top Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-3">Top Spending</h4>
        {summary?.expenseByCategory && Object.keys(summary.expenseByCategory).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(summary.expenseByCategory)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, amount]) => {
                const percent = (amount / financialData.expenses) * 100;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-300">{category}</span>
                      <span className="text-sm font-medium">{formatINR(amount, false)}</span>
                    </div>
                    <div className="w-full bg-gray-800/50 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 py-4">No expense data available</p>
        )}
      </div>
    </div>
  );
};

export default InsightsSection;
