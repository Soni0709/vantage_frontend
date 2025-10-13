import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';

const BudgetsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Budgets</h1>
          <p className="text-gray-400">Manage your spending limits and track budget usage</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-12 border border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold mb-3">Budgets Management</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              You can already create and manage budgets from the Dashboard. A dedicated budgets page with advanced features is coming soon!
            </p>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Available Now</p>
                    <p className="text-sm text-gray-400">Create category budgets from dashboard</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Real-time Tracking</p>
                    <p className="text-sm text-gray-400">Monitor spending against budgets</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Coming Soon</p>
                    <p className="text-sm text-gray-400">Budget templates and presets</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Coming Soon</p>
                    <p className="text-sm text-gray-400">Budget history and trends</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-medium transition-all inline-flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BudgetsPage;
