import React from 'react';
import { useTheme } from '../../hooks';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';
  
  const variantClasses = {
    primary: isDark
      ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl focus:ring-offset-gray-900'
      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white focus:ring-purple-500 shadow-lg hover:shadow-xl focus:ring-offset-white',
    secondary: isDark
      ? 'bg-white/[0.1] hover:bg-white/[0.15] text-white focus:ring-gray-400 border border-white/10'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500 border border-gray-200',
    outline: isDark
      ? 'border-2 border-purple-400 text-purple-400 hover:bg-purple-500/10 focus:ring-purple-400 focus:ring-offset-gray-900'
      : 'border-2 border-purple-500 text-purple-600 hover:bg-purple-500/10 focus:ring-purple-500 focus:ring-offset-white',
    danger: isDark
      ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl focus:ring-offset-gray-900'
      : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl focus:ring-offset-white',
    ghost: isDark
      ? 'text-gray-300 hover:text-white hover:bg-white/[0.05] focus:ring-gray-400 focus:ring-offset-gray-900'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 focus:ring-offset-white'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;