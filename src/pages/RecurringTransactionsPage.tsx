import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRecurringTransactions } from '../hooks/useTransactions';
import { RecurringTransactionModal } from '../components/recurring';
import { formatINR } from '../utils';
import type { CreateRecurringTransactionData, RecurringTransaction } from '../types/transaction';

const RecurringTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    recurring,
    upcoming,
    isLoading,
    create,
    update,
    delete: deleteRecurring,
    toggle,
    process,
    isProcessing,
    error,
  } = useRecurringTransactions({ active: true });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | undefined>();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Handle create recurring transaction
  const handleCreate = async (data: CreateRecurringTransactionData) => {
    try {
      await create(data);
      setShowAddModal(false);
      alert('✅ Recurring transaction created successfully!');
    } catch (error) {
      console.error('Failed to create recurring transaction:', error);
      throw error; // Let the modal handle the error
    }
  };

  // Handle update recurring transaction
  const handleUpdate = async (data: CreateRecurringTransactionData) => {
    if (!editingTransaction) return;
    
    try {
      await update(editingTransaction.id, data);
      setEditingTransaction(undefined);
      alert('✅ Recurring transaction updated successfully!');
    } catch (error) {
      console.error('Failed to update recurring transaction:', error);
      throw error;
    }
  };

  // Handle delete recurring transaction
  const handleDelete = async (id: string) => {
    try {
      await deleteRecurring(id);
      setDeleteConfirmId(null);
      alert('✅ Recurring transaction deleted successfully!');
    } catch (error) {
      console.error('Failed to delete recurring transaction:', error);
      alert('❌ Failed to delete recurring transaction');
    }
  };

  // Handle process recurring transactions
  const handleProcess = async () => {
    try {
      const result = await process();
      alert(`✅ Successfully created ${result.count} transaction${result.count !== 1 ? 's' : ''} from recurring schedules!`);
    } catch (error) {
      alert('❌ Failed to process recurring transactions');
      console.error(error);
    }
  };

  // Handle toggle (pause/resume)
  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggle(id, !isActive);
      alert(isActive ? '⏸️ Recurring transaction paused' : '▶️ Recurring transaction resumed');
    } catch (error) {
      alert('❌ Failed to toggle recurring transaction');
      console.error(error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading recurring transactions...</p>
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
        {/* Header */}
        <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold">Recurring Transactions</h1>
                  <p className="text-sm text-gray-400">Manage automatic transactions</p>
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
          {/* Error Banner */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-300 text-sm">Failed to load recurring transactions. Please try again.</p>
              </div>
            </div>
          )}

          {/* Process Button */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Recurring Schedules</h2>
              <p className="text-gray-400 text-sm mt-1">
                {recurring.length} active recurring transaction{recurring.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <button
              onClick={handleProcess}
              disabled={isProcessing || recurring.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Process Due Transactions</span>
                </>
              )}
            </button>
          </div>

          {/* Upcoming Recurring Transactions */}
          {upcoming.length > 0 && (
            <div className="mb-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">Upcoming (Next 30 Days)</h3>
              <div className="space-y-3">
                {upcoming.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'income' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.type === 'income' ? '↑' : '↓'}
                      </div>
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-400">
                          {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)} • Due in {item.daysUntil} day{item.daysUntil !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${
                        item.type === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatINR(item.nextAmount)}
                      </p>
                      <p className="text-xs text-gray-500">{item.nextOccurrence}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Recurring Transactions */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">All Recurring Transactions</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Recurring</span>
              </button>
            </div>

            {recurring.length > 0 ? (
              <div className="space-y-4">
                {recurring.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.type === 'income' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{item.description}</p>
                          {!item.isActive && (
                            <span className="px-2 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded">
                              Paused
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)} • 
                          Next: {item.nextOccurrence}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`font-bold ${
                          item.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatINR(item.amount)}
                        </p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTransaction(item)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-all"
                          title="Edit"
                        >
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleToggle(item.id, item.isActive)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          item.isActive
                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30'
                            : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                        }`}
                      >
                        {item.isActive ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-400 mb-2">No recurring transactions yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Set up automatic transactions for rent, salary, subscriptions, and more!
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all"
                >
                  Create First Recurring Transaction
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Recurring Modal */}
      <RecurringTransactionModal
        isOpen={showAddModal || !!editingTransaction}
        onClose={() => {
          setShowAddModal(false);
          setEditingTransaction(undefined);
        }}
        onSubmit={editingTransaction ? handleUpdate : handleCreate}
        editData={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
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
                <h3 className="text-xl font-bold text-white">Delete Recurring Transaction</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this recurring transaction? This will stop all future automatic transactions from being created.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
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

export default RecurringTransactionsPage;
