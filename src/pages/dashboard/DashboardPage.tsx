import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useTransactions, useRecurringTransactions } from '../../hooks';
import { useGetAlertsQuery } from '../../store/api';
import { formatINR, formatPercentage } from '../../utils';
import { useToast } from '../../contexts';
import { AddTransactionModal } from '../../components/modals';
import { InsightsSection } from '../../components/dashboard';
import { UnifiedBudgetDashboard, BudgetCharts } from '../../components/budget';
import { DashboardLayout } from '../../components/layout';
import type { TransactionFormData } from '../../components/modals';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  
  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Existing hooks
  const {
    transactions,
    summary,
    isLoading,
    error,
    create,
    delete: deleteTransaction,
  } = useTransactions();

  const {
    upcoming,
    recurring,
    isLoading: isRecurringLoading,
    process: processRecurring,
    isProcessing,
  } = useRecurringTransactions({ active: true });

  // Budget hooks for alerts
  const { data: alerts = [], isLoading: alertsLoading } = useGetAlertsQuery({ isRead: false });

  // Calculate pending recurring transactions
  const pendingRecurring = upcoming.filter(item => item.daysUntil <= 0);
  const pendingCount = pendingRecurring.length;

  // Calculate previous month comparison
  const previousSummary = {
    balance: summary ? summary.balance * 0.9 : 0,
    totalIncome: summary ? summary.totalIncome * 0.95 : 0,
    totalExpenses: summary ? summary.totalExpenses * 1.05 : 0,
  };

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const financialData = {
    balance: summary?.balance || 0,
    income: summary?.totalIncome || 0,
    expenses: summary?.totalExpenses || 0,
    savingsGoal: 5000000,
    currentSavings: summary?.balance || 0
  };

  const percentageChanges = {
    balance: calculatePercentageChange(financialData.balance, previousSummary.balance),
    income: calculatePercentageChange(financialData.income, previousSummary.totalIncome),
    expenses: calculatePercentageChange(financialData.expenses, previousSummary.totalExpenses)
  };

  const recentTransactions = transactions.slice(0, 5);
  const savingsProgress = (financialData.currentSavings / financialData.savingsGoal) * 100;

  const openModal = (type: 'income' | 'expense') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const toast = useToast();

  const handleTransactionSubmit = async (transaction: TransactionFormData) => {
    try {
      await create(transaction);
      setIsModalOpen(false);
      toast.success(`${transaction.type === 'income' ? 'Income' : 'Expense'} of ${formatINR(transaction.amount)} added successfully!`);
    } catch (err) {
      console.error('Failed to create transaction:', err);
      toast.error(`Failed to add transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setDeleteConfirmId(null);
      toast.success('Transaction deleted successfully!');
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      toast.error(`Failed to delete transaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleProcessRecurring = async () => {
    try {
      const result = await processRecurring();
      toast.success(`Successfully created ${result.count} transaction${result.count !== 1 ? 's' : ''} from recurring schedules!`);
    } catch (err) {
      console.error('Failed to process recurring transactions:', err);
      toast.error('Failed to process recurring transactions');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, {currentUser?.firstName}
            </h1>
            <p className="text-gray-400">Here's your financial snapshot</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => openModal('income')}
              className="px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-all text-green-400 font-medium text-sm flex items-center gap-2"
            >
              <span>+</span>
              <span>Add Income</span>
            </button>
            <button 
              onClick={() => openModal('expense')}
              className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all text-red-400 font-medium text-sm flex items-center gap-2"
            >
              <span>−</span>
              <span>Add Expense</span>
            </button>
            <button 
              onClick={() => navigate('/recurring')}
              className="px-5 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-all text-purple-400 font-medium text-sm"
            >
              Recurring
            </button>
          </div>
        </div>

        {/* Budget Alerts */}
        {alerts.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/5 to-red-500/5 border border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-300 mb-2">
                  {alerts.length} Budget Alert{alerts.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-1.5">
                  {alerts.slice(0, 3).map(alert => (
                    <p key={alert.id} className="text-sm text-gray-300">• {alert.message}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Recurring Transactions Alert */}
        {pendingCount > 0 && (
          <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-purple-300 mb-2">
                  {pendingCount} Pending Recurring Transaction{pendingCount > 1 ? 's' : ''}
                </p>
                <div className="space-y-1.5 mb-4">
                  {pendingRecurring.slice(0, 3).map(item => (
                    <p key={item.id} className="text-sm text-gray-300">
                      • {item.description} - {formatINR(item.amount)} ({item.frequency})
                    </p>
                  ))}
                  {pendingCount > 3 && (
                    <p className="text-sm text-gray-400">and {pendingCount - 3} more...</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleProcessRecurring}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all text-purple-300 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Process Now</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/recurring')}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all text-gray-300 font-medium text-sm flex items-center gap-2"
                  >
                    <span>View All</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Balance */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-green-500/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Balance</p>
              <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{formatINR(financialData.balance, false)}</h3>
            <p className={`text-xs font-medium ${percentageChanges.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(percentageChanges.balance)} vs last month
            </p>
          </div>

          {/* Income */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-blue-500/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Income</p>
              <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{formatINR(financialData.income, false)}</h3>
            <p className={`text-xs font-medium ${percentageChanges.income >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatPercentage(percentageChanges.income)} vs last month
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-red-500/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Expenses</p>
              <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{formatINR(financialData.expenses, false)}</h3>
            <p className={`text-xs font-medium ${percentageChanges.expenses > 0 ? 'text-red-400' : percentageChanges.expenses < 0 ? 'text-green-400' : 'text-gray-400'}`}>
              {formatPercentage(percentageChanges.expenses)} vs last month
            </p>
          </div>

          {/* Savings */}
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Savings Goal</p>
              <div className="w-9 h-9 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">{formatINR(financialData.currentSavings, false)}</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-800/50 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(savingsProgress, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-purple-400 font-medium">{savingsProgress.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Budget & Insights */}
        <div className="space-y-6">
          <UnifiedBudgetDashboard />
          <InsightsSection summary={summary} financialData={financialData} />
        </div>

        {/* Budget Charts */}
        <BudgetCharts />

        {/* Recent Transactions */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <p className="text-sm text-gray-400 mt-0.5">Your latest activity</p>
            </div>
            <button
              onClick={() => navigate('/transactions')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center gap-1"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-all border border-white/5 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'income' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d={transaction.type === 'income' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{transaction.category}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-xs text-gray-400">{transaction.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <p className={`font-semibold text-lg ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatINR(transaction.type === 'income' ? transaction.amount : -transaction.amount, false)}
                    </p>
                    
                    <button
                      onClick={() => setDeleteConfirmId(transaction.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first transaction to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionType={modalType}
        onSubmit={handleTransactionSubmit}
      />

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
                <h3 className="text-lg font-semibold">Delete Transaction</h3>
                <p className="text-sm text-gray-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 text-sm">
              Are you sure you want to delete this transaction?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTransaction(deleteConfirmId)}
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

export default DashboardPage;
