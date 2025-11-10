import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'auto' | 'light' | 'dark';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  variant = 'auto',
  className = '',
  id,
  ...props
}) => {
  const { mode } = useTheme();
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Auto-select variant based on theme if 'auto'
  const actualVariant = variant === 'auto' ? (mode === 'dark' ? 'dark' : 'light') : variant;
  
  const baseClasses = 'px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const variantClasses = {
    light: {
      input: error 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-white text-gray-900 placeholder-gray-400' 
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400',
      label: 'text-gray-700',
      error: 'text-red-600',
      helper: 'text-gray-500',
      icon: 'text-gray-400',
      ringOffset: 'focus:ring-offset-white'
    },
    dark: {
      input: error 
        ? 'border-red-500 focus:border-red-400 focus:ring-red-500 bg-white/[0.05] text-white placeholder-gray-400' 
        : 'border-white/10 focus:border-purple-500 focus:ring-purple-500 bg-white/[0.05] text-white placeholder-gray-500',
      label: 'text-gray-300',
      error: 'text-red-400',
      helper: 'text-gray-400',
      icon: 'text-gray-400',
      ringOffset: 'focus:ring-offset-gray-900'
    }
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  const iconPadding = icon ? 'pl-10' : '';
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className={`block text-sm font-medium mb-1 ${variantClasses[actualVariant].label}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={variantClasses[actualVariant].icon}>
              {icon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={`${baseClasses} ${variantClasses[actualVariant].input} ${variantClasses[actualVariant].ringOffset} ${widthClasses} ${iconPadding} ${className}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className={`mt-1 text-sm ${variantClasses[actualVariant].error}`}>{error}</p>
      )}
      
      {helperText && !error && (
        <p className={`mt-1 text-sm ${variantClasses[actualVariant].helper}`}>{helperText}</p>
      )}
    </div>
  );
};

export default Input;
