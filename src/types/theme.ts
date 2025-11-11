export type Mode = 'light' | 'dark';
export type ColorTheme = 'purple' | 'blue' | 'green' | 'indigo';
export type AutoSwitch = 'off' | 'system' | 'schedule';

export interface ThemeColors {
  primary: string;
  dark: string;
  light: string;
  accent: string;
}

export interface ThemeConfig {
  mode: Mode;
  colorTheme: ColorTheme;
  autoSwitch: AutoSwitch;
  scheduleStart?: number;
  scheduleEnd?: number;
}

export interface ThemeContextType {
  mode: Mode;
  colorTheme: ColorTheme;
  colors: ThemeColors;
  autoSwitch: AutoSwitch;
  scheduleStart?: number;
  scheduleEnd?: number;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setAutoSwitch: (autoSwitch: AutoSwitch) => void;
  setSchedule: (start: number, end: number) => void;
  getThemeConfig: () => ThemeConfig;
}