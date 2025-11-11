import React, { useEffect, useState, useCallback } from 'react';
import type { Mode, AutoSwitch, ThemeConfig, ThemeContextType } from '../types/theme';
import { ThemeContext } from './theme';

const DEFAULT_CONFIG: ThemeConfig = {
  mode: 'dark',
  autoSwitch: 'off',
  scheduleStart: 6,
  scheduleEnd: 20,
};

// Load theme immediately and apply to document root
const loadAndApplyTheme = (): ThemeConfig => {
  try {
    const stored = localStorage.getItem('vantage_theme_config');
    const parsed = stored ? JSON.parse(stored) : {};
    const config: ThemeConfig = { ...DEFAULT_CONFIG, ...parsed };
    
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the correct mode class
    root.classList.add(config.mode);
    
    console.log('Theme loaded from storage:', config);
    return config;
  } catch (error) {
    console.error('Error loading theme:', error);
    return DEFAULT_CONFIG;
  }
};

// Apply theme immediately on script load (before React renders)
loadAndApplyTheme();

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    try {
      const stored = localStorage.getItem('vantage_theme_config');
      const parsed = stored ? JSON.parse(stored) : {};
      return { ...DEFAULT_CONFIG, ...parsed } as ThemeConfig;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Determine effective mode based on autoSwitch
  const [effectiveMode, setEffectiveMode] = useState<Mode>(config.mode);

  // Update effective mode when config changes or on schedule
  useEffect(() => {
    const updateEffectiveMode = () => {
      if (config.autoSwitch === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setEffectiveMode(prefersDark ? 'dark' : 'light');
      } else if (config.autoSwitch === 'schedule' && config.scheduleStart && config.scheduleEnd) {
        const now = new Date();
        const hour = now.getHours();
        const isNightTime = hour < config.scheduleStart || hour >= config.scheduleEnd;
        setEffectiveMode(isNightTime ? 'dark' : 'light');
      } else {
        setEffectiveMode(config.mode);
      }
    };

    updateEffectiveMode();

    // Check every minute if schedule mode is active
    if (config.autoSwitch === 'schedule') {
      const interval = setInterval(updateEffectiveMode, 60000);
      return () => clearInterval(interval);
    }

    // Listen for system preference changes
    if (config.autoSwitch === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateEffectiveMode);
      return () => mediaQuery.removeEventListener('change', updateEffectiveMode);
    }
  }, [config]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply mode - remove both first, then add the correct one
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveMode);
    
    // Log for debugging
    console.log('HTML class updated to:', effectiveMode);
    console.log('HTML classList:', Array.from(root.classList));
    
    console.log('Theme applied:', { mode: effectiveMode });
    
    // Save to localStorage
    localStorage.setItem('vantage_theme_config', JSON.stringify(config));
  }, [config, effectiveMode]);

  const toggleMode = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
      autoSwitch: 'off',
    }));
  }, []);

  const setMode = useCallback((mode: Mode) => {
    setConfig(prev => ({
      ...prev,
      mode,
      autoSwitch: 'off',
    }));
  }, []);

  const setAutoSwitch = useCallback((autoSwitch: AutoSwitch) => {
    setConfig(prev => ({
      ...prev,
      autoSwitch,
    }));
  }, []);

  const setSchedule = useCallback((start: number, end: number) => {
    setConfig(prev => ({
      ...prev,
      scheduleStart: start,
      scheduleEnd: end,
    }));
  }, []);

  const getThemeConfig = useCallback((): ThemeConfig => config, [config]);

  const value: ThemeContextType = {
    mode: effectiveMode,
    autoSwitch: config.autoSwitch,
    scheduleStart: config.scheduleStart,
    scheduleEnd: config.scheduleEnd,
    toggleMode,
    setMode,
    setAutoSwitch,
    setSchedule,
    getThemeConfig,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};