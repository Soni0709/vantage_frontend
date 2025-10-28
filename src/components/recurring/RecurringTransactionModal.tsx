import React, { useState, useEffect } from 'react';
import type { 
  RecurringTransaction, 
  CreateRecurringTransactionData,
  RecurringFrequency,
  RecurringConfig 
} from '../../types/transaction';

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRecurringTransactionData) => Promise<void>;
  editData?: RecurringTransaction;
}

const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental Income',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Groceries',
  'Transport',
  'Entertainment',
  'Healthcare',
  'Insurance',
  'Subscriptions',
  'Loan Payment',
  'Other',
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
}) => {
  const [formData, setFormData] = useState<CreateRecurringTransactionData>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    notes: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    config: {
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      dayOfMonth: new Date().getDate(),
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setFormData({
        type: editData.type,
        amount: editData.amount,
        description: editData.description,
        category: editData.category,
        notes: editData.notes,
        frequency: editData.frequency,
        startDate: editData.startDate,
        endDate: editData.endDate,
        config: editData.config,
      });
    }
  }, [editData]);

  const handleChange = (field: keyof CreateRecurringTransactionData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleFrequencyChange = (frequency: RecurringFrequency) => {
    const config: RecurringConfig = {
      frequency,
      startDate: formData.startDate,
    };

    // Set default config based on frequency
    switch (frequency) {
      case 'weekly':
      case 'bi-weekly':
        config.dayOfWeek = new Date(formData.startDate).getDay();
        break;
      case 'monthly':
      case 'quarterly':
        config.dayOfMonth = new Date(formData.startDate).getDate();
        break;
      case 'yearly':
        { const startDate = new Date(formData.startDate);
        config.dayOfMonth = startDate.getDate();
        config.monthOfYear = startDate.getMonth() + 1;
        break; }
    }

    setFormData((prev) => ({
      ...prev,
      frequency,
      config,
    }));
  };

  const handleConfigChange = (field: keyof RecurringConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (formData.amount <= 0) {
      setError('Amount must be greater than zero');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        type: 'expense',
        amount: 0,
        description: '',
        category: '',
        notes: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: undefined,
        config: {
          frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          dayOfMonth: new Date().getDate(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recurring transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-gray-800 to-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {editData ? 'Edit' : 'Add'} Recurring Transaction
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Set up automatic transactions that repeat on a schedule
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  handleChange('type', 'income');
                  handleChange('category', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="font-medium">Income</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleChange('type', 'expense');
                  handleChange('category', '');
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span className="font-medium">Expense</span>
                </div>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="e.g., Monthly Rent, Netflix Subscription"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Amount and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (₹) *
              </label>
              <input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Frequency *
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleFrequencyChange(e.target.value as RecurringFrequency)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency-specific config */}
          {(formData.frequency === 'weekly' || formData.frequency === 'bi-weekly') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Day of Week
              </label>
              <select
                value={formData.config.dayOfWeek ?? 0}
                onChange={(e) => handleConfigChange('dayOfWeek', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(formData.frequency === 'monthly' || formData.frequency === 'quarterly') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Day of Month
              </label>
              <input
                type="number"
                value={formData.config.dayOfMonth ?? 1}
                onChange={(e) => handleConfigChange('dayOfMonth', parseInt(e.target.value))}
                min="1"
                max="31"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a number between 1 and 31
              </p>
            </div>
          )}

          {formData.frequency === 'yearly' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Month
                </label>
                <select
                  value={formData.config.monthOfYear ?? 1}
                  onChange={(e) => handleConfigChange('monthOfYear', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Day
                </label>
                <input
                  type="number"
                  value={formData.config.dayOfMonth ?? 1}
                  onChange={(e) => handleConfigChange('dayOfMonth', parseInt(e.target.value))}
                  min="1"
                  max="31"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Start and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  handleChange('startDate', e.target.value);
                  handleConfigChange('startDate', e.target.value);
                }}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value || undefined)}
                min={formData.startDate}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editData ? 'Update' : 'Create'} Recurring Transaction</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringTransactionModal;
