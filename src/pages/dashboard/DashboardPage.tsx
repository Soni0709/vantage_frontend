import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useTransactions, useRecurringTransactions } from '../../hooks';
import { formatINR, formatPercentage } from '../../utils';
import { AddTransactionModal } from '../../components/modals';
import type { TransactionFormData } from '../../components/modals';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  
  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Use the new hook! 🎉
  const {
    transactions,
    summary,
    isLoading,
    error,
    create,
    delete: deleteTransaction,
  } = useTransactions();

  // Get recurring transactions data
  const {
    upcoming,
    recurring,
    isLoading: isRecurringLoading,
  } = useRecurringTransactions({ active: true });

  // Calculate pending recurring transactions (due today or overdue)
  const pendingRecurring = upcoming.filter(item => item.daysUntil <= 0).length;

  // Calculate previous month for comparison (mock data for now)
  // In a real app, you'd fetch this from API
  const previousSummary = {
    balance: summary ? summary.balance * 0.9 : 0,
    totalIncome: summary ? summary.totalIncome * 0.95 : 0,
    totalExpenses: summary ? summary.totalExpenses * 1.05 : 0,
  };

  // Calculate percentage change helper
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  // Calculate financial data
  const financialData = {
    balance: summary?.balance || 0,
    income: summary?.totalIncome || 0,
    expenses: summary?.totalExpenses || 0,
    savingsGoal: 5000000,
    currentSavings: summary?.balance || 0
  };

  // Calculate percentage changes
  const percentageChanges = {
    balance: calculatePercentageChange(
      financialData.balance,
      previousSummary.balance
    ),
    income: calculatePercentageChange(
      financialData.income,
      previousSummary.totalIncome
    ),
    expenses: calculatePercentageChange(
      financialData.expenses,
      previousSummary.totalExpenses
    )
  };

  // Get recent transactions (last 4)
  const recentTransactions = transactions.slice(0, 4);

  const savingsProgress = (financialData.currentSavings / financialData.savingsGoal) * 100;

  // Handle opening modal
  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleTransactionSubmit = async (transaction: TransactionFormData) => {
    try {
      await create(transaction);
      setIsModalOpen(false);
      alert(`${transaction.type === 'income' ? 'Income' : 'Expense'} of ${formatINR(transaction.amount)} added successfully!`);
    } catch (err) {
      console.error('Failed to create transaction:', err);
      alert(`Failed to add transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setDeleteConfirmId(null);
      alert('Transaction deleted successfully!');
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      alert(`Failed to delete transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
                <p className="text-red-300 text-sm">Failed to load some data.</p>
              </div>
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

          {/* Pending Recurring Transactions Alert */}
          {pendingRecurring > 0 && (
            <div className="mb-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-300">
                      {pendingRecurring} Recurring Transaction{pendingRecurring !== 1 ? 's' : ''} Due
                    </p>
                    <p className="text-sm text-gray-400">
                      Click "Process Due Transactions" on the Recurring page to create them
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/recurring')}
                  className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg transition-colors text-orange-400 font-medium"
                >
                  Process Now
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Recurring Transactions */}
          {!isRecurringLoading && upcoming.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">Upcoming Recurring</h3>
                  <p className="text-sm text-gray-400">Next {Math.min(upcoming.length, 5)} scheduled transactions</p>
                </div>
                <button
                  onClick={() => navigate('/recurring')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcoming.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-800/30 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {item.type === 'income' ? '↑' : '↓'}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${item.daysUntil === 0 ? 'bg-orange-500/20 text-orange-400' : item.daysUntil <= 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-400'}`}>
                        {item.daysUntil === 0 ? 'Today' : item.daysUntil === 1 ? 'Tomorrow' : `${item.daysUntil}d`}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1 truncate">{item.description}</p>
                    <p className={`font-bold text-sm ${item.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatINR(item.nextAmount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
                    </p>
                  </div>
                ))}
              </div>
              {recurring.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                  <p className="text-sm text-gray-400">
                    {recurring.length} active recurring schedule{recurring.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

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
                    style={{ width: `${Math.min(savingsProgress, 100)}%` }}
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
                <button
                  onClick={() => navigate('/transactions')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                >
                  View All →
                </button>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 hover:bg-gray-700/30 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '↑' : '↓'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-400">{transaction.category} • {transaction.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <p className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatINR(transaction.type === 'income' ? transaction.amount : -transaction.amount)}
                        </p>
                        
                        {/* NEW: Delete Button */}
                        <button
                          onClick={() => setDeleteConfirmId(transaction.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete transaction"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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

                <button 
                  onClick={() => navigate('/recurring')}
                  className="w-full py-4 px-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <svg className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-medium text-purple-400">Recurring</span>
                </button>

                <button
                  onClick={() => navigate('/transactions')}
                  className="w-full py-4 px-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium text-blue-400">View All</span>
                </button>
              </div>

              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-sm text-purple-300">
                  💡 <strong>Tip:</strong> Set up recurring transactions for regular income and expenses!
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

      {/* NEW: Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-500/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Transaction</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this transaction?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTransaction(deleteConfirmId)}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
