import React, { useState } from 'react';
import { DashboardLayout, PageHeader } from '../../components/layout';
import { useFilteredTransactions, useCategories } from '../../hooks';
import { formatINR } from '../../utils';
import { useToast } from '../../contexts';
import { useDeleteTransactionMutation } from '../../store/api/transactionsApi';
import type { TransactionFilters } from '../../types/transaction';

const TransactionsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Use new filtered transactions hook
  const {
    transactions,
    summary,
    isLoading,
    error,
    filters,
    activeFilterCount,
    updateFilter,
    clearFilters,
    applyFilters,
  } = useFilteredTransactions();

  const { incomeCategories, expenseCategories } = useCategories();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const toast = useToast();

  const allCategories = [...incomeCategories, ...expenseCategories];

  // Handle filter changes
  const handleFilterChange = (key: keyof TransactionFilters, value: unknown) => {
    updateFilter(key, value);
  };

  // Apply filters and fetch
  const handleApplyFilters = () => {
    console.log('✅ User clicked Apply - Current filters:', filters);
    applyFilters();
  };

  // Clear and refetch
  const handleClearFilters = () => {
    clearFilters();
    setTimeout(() => applyFilters(), 0); // Apply after clearing
  };

  // Handle delete
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

  if (isLoading && transactions.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading transactions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="All Transactions"
          description="Search and filter your transactions"
        />

        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300 text-sm">Failed to load transactions.</p>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
          {/* Search and Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search transactions by description..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
                showFilters
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:border-purple-500'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl font-medium transition-colors text-red-400"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer hover:bg-white/10 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1e293b', color: 'white' }}>All Types</option>
                    <option value="income" style={{ backgroundColor: '#1e293b', color: 'white' }}>Income</option>
                    <option value="expense" style={{ backgroundColor: '#1e293b', color: 'white' }}>Expense</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer hover:bg-white/10 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1e293b', color: 'white' }}>All Categories</option>
                    {allCategories.map((cat, index) => {
                      const name = typeof cat === 'string' ? cat : cat.name || '';
                      return (
                        <option key={index} value={name} style={{ backgroundColor: '#1e293b', color: 'white' }}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Min Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Max Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>


              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-400">{formatINR(summary.totalIncome)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400">{formatINR(summary.totalExpenses)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Net Balance</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatINR(summary.balance)}
              </p>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/5">
          <div className="mb-6">
            <h3 className="text-xl font-bold">
              {activeFilterCount > 0 ? 'Filtered ' : ''}Transactions
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/5 rounded-xl transition-all group border border-white/5"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'income'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.isRecurring && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                            Recurring
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatINR(transaction.type === 'income' ? transaction.amount : -transaction.amount)}
                      </p>
                    </div>

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
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">No transactions found</p>
              <p className="text-sm text-gray-500">
                {activeFilterCount > 0
                  ? 'Try adjusting your filters or search terms'
                  : 'Start by adding your first transaction!'}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors text-purple-400"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
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

            <div className="flex gap-3">
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
    </DashboardLayout>
  );
};

export default TransactionsPage;
