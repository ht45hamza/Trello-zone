/**
 * Centralized design system color constants for the Trello-Zone application.
 * All color values are curated and maintained here for UI consistency.
 */

export const brandColors = {
  50: '#f0f7ff',
  100: '#e0effe',
  200: '#badffd',
  300: '#7cc2fc',
  400: '#36a3f9',
  500: '#0c87eb',
  600: '#0069c7',
  700: '#0054a1',
  800: '#004785',
  900: '#063c6d',
  950: '#04264a',
};

export const trelloColors = {
  blue: '#0079bf',
  green: '#51a825',
  orange: '#ff9f1a',
  red: '#eb5a46',
  yellow: '#f2d600',
  purple: '#c377e0',
  pink: '#ff78cb',
  sky: '#00c2e0',
  lime: '#4bbf6b',
};

export const surfaceColors = {
  default: '#f1f2f4',
  hover: '#e2e4e9',
  dark: '#172b4d',
};

// Background presets for Board creation & views
export const boardBackgroundPresets = [
  { value: 'linear-gradient(135deg, #0c87eb 0%, #00f2fe 100%)', label: 'Ocean Blue' },
  { value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Mint Glow' },
  { value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Warm Flame' },
  { value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', label: 'Sunset Glow' },
  { value: 'linear-gradient(135deg, #89609e 0%, #e879f9 100%)', label: 'Purple Haze' },
  { value: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', label: 'Strawberry' },
  { value: '#0079bf', label: 'Trello Blue' },
  { value: '#519839', label: 'Forest Green' },
  { value: '#b04632', label: 'Burgundy' },
];

// Color palette options for Card Labels
export const labelColorPalette = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#64748b', // Slate
  '#000000', // Black
];

export const pageBackgrounds = {
  authDark: '#0b0f19',     // Background for BoardView loading, VerifyOTP, etc.
  dashboardLight: '#f8fafc', // Dashboard background
  sidebarDark: '#0f172a',   // Sidebar background
};
