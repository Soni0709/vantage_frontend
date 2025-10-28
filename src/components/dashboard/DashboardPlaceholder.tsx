import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import { useAuth } from '../../hooks/useAuth';

const DashboardPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to Dashboard!</h1>
        <p className="text-gray-400 mb-2">Hello, {currentUser?.firstName || 'User'}!</p>
        <p className="text-gray-500 mb-8 text-sm">This will be replaced with the actual dashboard later.</p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/profile')}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Go to Profile Settings
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white font-semibold rounded-xl transition-all duration-200"
          >
            Back to Landing
          </button>
        </div>

        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <p className="text-green-400 text-sm">
            ✅ You are authenticated! Auth Status: {isLoggedIn ? 'Logged In' : 'Not Logged In'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPlaceholder;