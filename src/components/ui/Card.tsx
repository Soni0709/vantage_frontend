import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined';
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  variant = 'default',
  style = {}
}) => {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const baseClasses = 'rounded-lg border transition-all duration-200';
  
  const variantClasses = {
    default: isDark
      ? 'bg-white/[0.02] border-white/5 hover:border-white/10'
      : 'bg-white border-gray-200 hover:border-gray-300',
    elevated: isDark
      ? 'bg-white/[0.05] border-white/10 shadow-lg'
      : 'bg-gray-50 border-gray-200 shadow-lg',
    outlined: isDark
      ? 'bg-transparent border-white/10'
      : 'bg-transparent border-gray-300'
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-2xl'
  };

  const themeStyles: React.CSSProperties = isDark
    ? {
        color: 'white'
      }
    : {
        color: 'rgb(17, 24, 39)'
      };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`}
      style={{ ...themeStyles, ...style }}
    >
      {children}
    </div>
  );
};

export default Card;
