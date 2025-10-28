import React, { useState, useEffect } from 'react';
import type { SavingsGoal, SavingsGoalFormData } from '../../types';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SavingsGoalFormData) => Promise<void>;
  goal?: SavingsGoal;
  isSubmitting?: boolean;
}

const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<SavingsGoalFormData>({
    name: '',
    target_amount: 0,
    current_amount: 0,
    deadline: '',
    status: 'active',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        deadline: goal.deadline || '',
        status: goal.status,
        description: goal.description || '',
      });
    } else {
      setFormData({
        name: '',
        target_amount: 0,
        current_amount: 0,
        deadline: '',
        status: 'active',
        description: '',
      });
    }
    setErrors({});
  }, [goal, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (formData.target_amount <= 0) {
      newErrors.target_amount = 'Target amount must be greater than 0';
    }

    if ((formData.current_amount ?? 0) < 0) {
      newErrors.current_amount = 'Current amount cannot be negative';
    }

    if ((formData.current_amount ?? 0) > (formData.target_amount ?? 0)) {
      newErrors.current_amount = 'Current amount cannot exceed target amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit goal:', error);
    }
  };

  const handleChange = (field: keyof SavingsGoalFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {goal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <p className="text-xs text-gray-400">
                {goal ? 'Update your savings goal details' : 'Set a new savings target'}
              </p>
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
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Emergency Fund, Vacation, House Down Payment"
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                errors.name ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-white placeholder-gray-500`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Amount (₹) *
            </label>
            <input
              type="number"
              value={formData.target_amount || ''}
              onChange={(e) => handleChange('target_amount', parseFloat(e.target.value) || 0)}
              placeholder="500000"
              min="0"
              step="1000"
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                errors.target_amount ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-white placeholder-gray-500`}
            />
            {errors.target_amount && (
              <p className="mt-1 text-xs text-red-400">{errors.target_amount}</p>
            )}
          </div>

          {/* Current Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Amount (₹)
            </label>
            <input
              type="number"
              value={formData.current_amount || ''}
              onChange={(e) => handleChange('current_amount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              min="0"
              step="1000"
              className={`w-full px-4 py-2.5 bg-white/5 border ${
                errors.current_amount ? 'border-red-500/50' : 'border-white/10'
              } rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-white placeholder-gray-500`}
            />
            {errors.current_amount && (
              <p className="mt-1 text-xs text-red-400">{errors.current_amount}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as 'active' | 'completed' | 'paused')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-white"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add notes about this savings goal..."
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-colors text-white placeholder-gray-500 resize-none"
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{goal ? 'Update Goal' : 'Create Goal'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsGoalModal;
