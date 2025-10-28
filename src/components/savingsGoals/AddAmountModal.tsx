import React, { useState } from 'react';
import { formatINR } from '../../utils';
import type { SavingsGoal } from '../../types';

interface AddAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
  goal: SavingsGoal;
  isSubmitting?: boolean;
}

const AddAmountModal: React.FC<AddAmountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
  isSubmitting = false,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      await onSubmit(amount);
      setAmount(0);
      setError('');
      onClose();
    } catch (error) {
      console.error('Failed to add amount:', error);
    }
  };

  const newTotal = goal.current_amount + amount;
  const newProgress = goal.target_amount > 0 ? ((newTotal / goal.target_amount) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-green-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Add Savings</h3>
              <p className="text-xs text-gray-400">{goal.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Progress */}
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Current</span>
              <span className="text-sm font-semibold text-purple-400">
                {formatINR(goal.current_amount, false)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Target</span>
              <span className="text-sm font-semibold">
                {formatINR(goal.target_amount, false)}
              </span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Number(goal.progress_percentage) || 0, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {Number(goal.progress_percentage || 0).toFixed(1)}% completed
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount to Add (₹) *
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => {
                setAmount(parseFloat(e.target.value) || 0);
                setError('');
              }}
              placeholder="10000"
              min="0"
              step="100"
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                error ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl focus:outline-none focus:border-green-500/50 transition-colors text-white placeholder-gray-500`}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
          </div>

          {/* Preview */}
          {amount > 0 && (
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">New Total</span>
                <span className="text-lg font-bold text-green-400">
                  {formatINR(newTotal, false)}
                </span>
              </div>
              <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(newProgress, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Will be {newProgress.toFixed(1)}% completed
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add {formatINR(amount, false)}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAmountModal;
