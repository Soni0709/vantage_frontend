import React from 'react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description: string;
  showBackButton?: boolean;
  backTo?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  showBackButton = true, 
  backTo = '/dashboard',
  children 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-start gap-4">
        {showBackButton && (
          <button
            onClick={() => navigate(backTo)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0 mt-1"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold mb-1">{title}</h1>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
      {children && (
        <div className="flex flex-wrap gap-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
