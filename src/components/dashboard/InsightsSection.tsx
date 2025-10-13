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
        <h3 className="text-lg font-semibold">Financial Insights</h3>
        <p className="text-sm text-gray-400 mt-0.5">Your spending patterns and key metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats Grid */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-4">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Transactions</p>
              </div>
              <p className="text-2xl font-bold">{summary?.transactionCount || 0}</p>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-amber-500/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Avg. Daily</p>
              </div>
              <p className="text-2xl font-bold">{formatINR(parseFloat(avgDailySpend), false)}</p>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Budgets</p>
              </div>
              <p className="text-2xl font-bold">{budgets.filter(b => b.isActive).length}</p>
            </div>

            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-green-500/20 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400">Savings</p>
              </div>
              <p className="text-2xl font-bold">{savingsRate}%</p>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-4">Top Spending Categories</h4>
          {summary?.expenseByCategory && Object.keys(summary.expenseByCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(summary.expenseByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => {
                  const percent = (amount / financialData.expenses) * 100;
                  return (
                    <div key={category} className="group hover:bg-white/[0.02] p-2 rounded-lg transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-300 font-medium">{category}</span>
                        <span className="text-sm font-semibold text-purple-400">{formatINR(amount, false)}</span>
                      </div>
                      <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-white/5">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm text-gray-500">No expense data yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;
