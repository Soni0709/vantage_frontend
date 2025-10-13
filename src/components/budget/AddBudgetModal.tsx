import React, { useState } from 'react';
import { useCreateBudgetMutation } from '../../store/api';
import type { BudgetPeriod, CreateBudgetData } from '../../types';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose }) => {
  const [createBudget, { isLoading }] = useCreateBudgetMutation();
  
  const [formData, setFormData] = useState<CreateBudgetData>({
    category: '',
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createBudget(formData).unwrap();
      // Reset form and close modal
      setFormData({
        category: '',
        amount: 0,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0]
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleChange = (field: keyof CreateBudgetData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Add Budget</h2>
            <p className="text-sm text-gray-400 mt-0.5">Set spending limits</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
            <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`w-full bg-gray-800/50 border ${
            errors.category ? 'border-red-500/50' : 'border-white/10'
            } rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
            >
            <option value="">Select category</option>
            {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
            ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-xs mt-1.5">{errors.category}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Budget Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={`w-full bg-gray-800/50 border ${
                  errors.amount ? 'border-red-500/50' : 'border-white/10'
                } rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
              />
            </div>
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1.5">{errors.amount}</p>
            )}
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Period</label>
            <div className="grid grid-cols-3 gap-2">
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('period', value)}
                  className={`py-3 rounded-xl border transition-all ${
                    formData.period === value
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-gray-800/30 border-white/10 text-gray-300 hover:border-purple-500/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full bg-gray-800/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;
