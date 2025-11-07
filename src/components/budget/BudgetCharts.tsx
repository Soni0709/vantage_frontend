import React, { useState, useMemo } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { selectMonthlyBudget } from '../../store/slices/monthlyBudgetSlice';
import { useGetBudgetsQuery } from '../../store/api';
import { formatINR } from '../../utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Cell,
} from 'recharts';

const BudgetCharts: React.FC = () => {
  const monthlyBudget = useAppSelector(selectMonthlyBudget);
  const { data: categoryBudgets = [], isLoading } = useGetBudgetsQuery();
  const [activeChart, setActiveChart] = useState<'bar' | 'radial'>('bar');

  // Prepare data for charts - MEMOIZED to prevent infinite loops
  const categoryData = useMemo(() => {
    return categoryBudgets.map(budget => ({
      name: budget.category,
      spent: budget.spent,
      budget: budget.amount,
      remaining: budget.amount - budget.spent,
      percentage: budget.percentageUsed,
    }));
  }, [categoryBudgets]);

  // Colors for charts
  const COLORS = [
    '#8b5cf6', // purple
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#a855f7', // violet
  ];

  // Custom tooltip - MEMOIZED
  const CustomTooltip = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gray-800 border border-white/10 rounded-lg p-3 shadow-xl">
            <p className="font-semibold text-white mb-2">{payload[0].payload.name}</p>
            <p className="text-sm text-blue-400">
              Budget: {formatINR(payload[0].payload.budget, false)}
            </p>
            <p className="text-sm text-red-400">
              Spent: {formatINR(payload[0].payload.spent, false)}
            </p>
            <p className="text-sm text-green-400">
              Remaining: {formatINR(payload[0].payload.remaining, false)}
            </p>
            <p className="text-sm text-purple-400 mt-1">
              {payload[0].payload.percentage.toFixed(1)}% used
            </p>
          </div>
        );
      }
      return null;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
        <div className="text-center py-12">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (categoryBudgets.length === 0) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold mb-2">Budget Analytics</h3>
        <p className="text-sm text-gray-400 mb-6">Visual insights into your spending</p>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 font-medium">No budget data to visualize</p>
          <p className="text-sm text-gray-500 mt-1">Add category budgets to see charts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Budget Analytics</h3>
          <p className="text-sm text-gray-400 mt-0.5">Visual insights into your spending</p>
        </div>
        
        {/* Chart Type Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChart('bar')}
            className={`p-2 rounded-lg transition-all ${
              activeChart === 'bar'
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
            }`}
            title="Bar Chart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          <button
            onClick={() => setActiveChart('radial')}
            className={`p-2 rounded-lg transition-all ${
              activeChart === 'radial'
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
            }`}
            title="Radial Chart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Monthly Overview Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
          <p className="text-xs text-purple-300 mb-1">Total Budget</p>
          <p className="text-xl font-bold">{formatINR(monthlyBudget.amount, false)}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20">
          <p className="text-xs text-red-300 mb-1">Total Spent</p>
          <p className="text-xl font-bold text-red-400">{formatINR(monthlyBudget.totalExpense, false)}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
          <p className="text-xs text-green-300 mb-1">Remaining</p>
          <p className={`text-xl font-bold ${monthlyBudget.remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
            {formatINR(Math.abs(monthlyBudget.remainingBudget), false)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
        {activeChart === 'bar' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">
              Budget vs Actual Spending
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={CustomTooltip} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" radius={[8, 8, 0, 0]} />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'radial' && (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4 text-center">
              Category Budget Usage
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="100%" 
                barSize={20} 
                data={categoryData}
              >
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                  background
                  dataKey="percentage"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentage >= 100 ? '#ef4444' : 
                            entry.percentage >= 80 ? '#f59e0b' : COLORS[index % COLORS.length]} 
                    />
                  ))}
                </RadialBar>
                <Tooltip content={CustomTooltip} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {categoryData.slice(0, 6).map((category, index) => (
          <div key={category.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{category.name}</p>
              <p className="text-xs text-gray-400">
                {formatINR(category.spent, false)} / {formatINR(category.budget, false)}
              </p>
            </div>
            <span className={`text-xs font-semibold ${
              category.percentage >= 100 ? 'text-red-400' :
              category.percentage >= 80 ? 'text-amber-400' : 'text-green-400'
            }`}>
              {category.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetCharts;
