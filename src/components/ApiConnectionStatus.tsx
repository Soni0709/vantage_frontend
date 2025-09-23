import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

const ApiConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await apiService.healthCheck();
        setIsConnected(connected);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  if (isChecking) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
          <span>Checking API...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-xs z-50 ${
      isConnected 
        ? 'bg-green-800 text-green-200' 
        : 'bg-red-800 text-red-200'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`}></div>
        <span>
          {isConnected ? 'API Connected' : 'API Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default ApiConnectionStatus;