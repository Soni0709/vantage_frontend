export type Mode = 'light' | 'dark';
export type AutoSwitch = 'off' | 'system' | 'schedule';

export interface ThemeConfig {
  mode: Mode;
  autoSwitch: AutoSwitch;
  scheduleStart?: number;
  scheduleEnd?: number;
}

export interface ThemeContextType {
  mode: Mode;
  autoSwitch: AutoSwitch;
  scheduleStart?: number;
  scheduleEnd?: number;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  setAutoSwitch: (autoSwitch: AutoSwitch) => void;
  setSchedule: (start: number, end: number) => void;
  getThemeConfig: () => ThemeConfig;
}