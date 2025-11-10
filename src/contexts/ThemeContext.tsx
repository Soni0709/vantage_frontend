import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Mode } from '../types/theme';

interface ThemeContextType {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_MODE: Mode = 'dark';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>(() => {
    try {
      const stored = localStorage.getItem('vantage_theme_mode') as Mode;
      return stored || DEFAULT_MODE;
    } catch {
      return DEFAULT_MODE;
    }
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply mode - remove both first, then add the correct one
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    
    // Log for debugging
    console.log('Theme updated:', mode);
    
    // Save to localStorage
    localStorage.setItem('vantage_theme_mode', mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setModeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
  }, []);

  const value: ThemeContextType = {
    mode,
    toggleMode,
    setMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
