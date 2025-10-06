import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatINR, formatPercentage } from '../../utils';
import { AddTransactionModal } from '../../components/modals';
import type { TransactionFormData } from '../../components/modals';
import { apiService } from '../../services/api';
import type { Transaction, TransactionSummary } from '../../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  
  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [previousSummary, setPreviousSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Get previous month dates
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      
      // Fetch current month transactions and summary, plus previous month summary
      const [transactionsData, currentSummaryData, previousSummaryData] = await Promise.all([
        apiService.getTransactions().catch(() => []),
        apiService.getTransactionSummary(currentMonthStart, currentMonthEnd).catch(() => ({
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          transactionCount: 0,
          period: { startDate: '', endDate: '' }
        })),
        apiService.getTransactionSummary(previousMonthStart, previousMonthEnd).catch(() => ({
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          transactionCount: 0,
          period: { startDate: '', endDate: '' }
        }))
      ]);
      
      setTransactions(transactionsData);
      setSummary(currentSummaryData);
      setPreviousSummary(previousSummaryData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      // Set empty data as fallback
      setTransactions([]);
      setSummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
        period: { startDate: '', endDate: '' }
      });
      setPreviousSummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
        period: { startDate: '', endDate: '' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate percentage change helper
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  // Calculate financial data from API
  const financialData = {
    balance: summary?.balance || 0,
    income: summary?.totalIncome || 0,
    expenses: summary?.totalExpenses || 0,
    savingsGoal: 5000000, // This should come from user preferences in the future
    currentSavings: summary?.balance || 0
  };

  // Calculate percentage changes
  const percentageChanges = {
    balance: calculatePercentageChange(
      financialData.balance,
      previousSummary?.balance || 0
    ),
    income: calculatePercentageChange(
      financialData.income,
      previousSummary?.totalIncome || 0
    ),
    expenses: calculatePercentageChange(
      financialData.expenses,
      previousSummary?.totalExpenses || 0
    )
  };

  // Get recent transactions (last 4)
  const recentTransactions = transactions.slice(0, 4).map(t => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date
  }));

  const savingsProgress = (financialData.currentSavings / financialData.savingsGoal) * 100;

  // Handle opening modal
  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleTransactionSubmit = async (transaction: TransactionFormData) => {
    try {
      // Call API to create transaction
      await apiService.createTransaction(transaction);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      // Show success message
      alert(`${transaction.type === 'income' ? 'Income' : 'Expense'} of ${formatINR(transaction.amount)} added successfully!`);
    } catch (err) {
      console.error('Failed to create transaction:', err);
      alert(`Failed to add transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border-b border-red-500/30 backdrop-blur-xl">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-300 text-sm">Failed to load some data. Showing cached or empty data.</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Vantage</h1>
                  <p className="text-sm text-gray-400">Financial Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </div>
                  <span className="hidden md:block">{currentUser?.firstName}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser?.firstName}! 👋
            </h2>
            <p className="text-gray-400">Here's your financial overview</p>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Total Balance</p>
              <h3 className="text-3xl font-bold text-white">{formatINR(financialData.balance)}</h3>
              <p className={`text-sm mt-2 ${percentageChanges.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(percentageChanges.balance)} from last month
              </p>
            </div>

            {/* Income Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Income (This Month)</p>
              <h3 className="text-3xl font-bold text-white">{formatINR(financialData.income)}</h3>
              <p className={`text-sm mt-2 ${percentageChanges.income >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatPercentage(percentageChanges.income)} from last month
              </p>
            </div>

            {/* Expenses Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-red-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Expenses (This Month)</p>
              <h3 className="text-3xl font-bold text-white">{formatINR(financialData.expenses)}</h3>
              <p className={`text-sm mt-2 ${
                percentageChanges.expenses > 0 ? 'text-red-400' : percentageChanges.expenses < 0 ? 'text-green-400' : 'text-gray-400'
              }`}>
                {formatPercentage(percentageChanges.expenses)} from last month
              </p>
            </div>

            {/* Savings Goal Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">Savings Goal</p>
              <h3 className="text-2xl font-bold text-white">{formatINR(financialData.currentSavings)}</h3>
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${savingsProgress}%` }}
                  ></div>
                </div>
                <p className="text-purple-400 text-sm mt-2">{savingsProgress.toFixed(1)}% of {formatINR(financialData.savingsGoal, false)}</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Recent Transactions</h3>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  View All →
                </button>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-700/30 rounded-xl transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '↑' : '↓'}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-400">{transaction.category} • {transaction.date}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatINR(transaction.type === 'income' ? transaction.amount : -transaction.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add your first transaction to get started!</p>
                </div>
              )}

              {recentTransactions.length > 0 && (
                <button className="w-full mt-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-gray-300 hover:text-white transition-colors font-medium">
                  Load More Transactions
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => openModal('income')}
                  className="w-full py-4 px-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <svg className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium text-green-400">Add Income</span>
                </button>

                <button 
                  onClick={() => openModal('expense')}
                  className="w-full py-4 px-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <svg className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                  <span className="font-medium text-red-400">Add Expense</span>
                </button>

                <button className="w-full py-4 px-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group">
                  <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium text-blue-400">View Reports</span>
                </button>

                <button className="w-full py-4 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group">
                  <svg className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span className="font-medium text-purple-400">Set Budget</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-purple-300">
                  💡 <strong>Tip:</strong> Track your expenses daily to stay on top of your budget!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionType={modalType}
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
};

export default DashboardPage;
