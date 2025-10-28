import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout, PageHeader } from '../../components/layout';

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <PageHeader
          title="Analytics"
          description="Deep insights into your financial patterns and trends"
        />

        {/* Coming Soon Card */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-12 border border-white/5">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold mb-3">Advanced Analytics Coming Soon</h2>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              We're building powerful analytics tools to help you understand your finances better. Meanwhile, check out the insights and charts available on your dashboard!
            </p>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-400">In Development</span>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Spending Trends</p>
                    <p className="text-sm text-gray-400">Monthly and yearly comparison charts</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Category Breakdown</p>
                    <p className="text-sm text-gray-400">Detailed expense distribution</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Income Analysis</p>
                    <p className="text-sm text-gray-400">Track income sources and growth</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Custom Reports</p>
                    <p className="text-sm text-gray-400">Generate detailed financial reports</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Time-based Insights</p>
                    <p className="text-sm text-gray-400">Daily, weekly, monthly patterns</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Goal Tracking</p>
                    <p className="text-sm text-gray-400">Monitor progress towards targets</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-medium transition-all inline-flex items-center gap-2"
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

export default AnalyticsPage;
