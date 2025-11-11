import React from 'react';
import type { ThemeContextType } from '../types/theme';

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);