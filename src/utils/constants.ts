export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const STORAGE_KEYS = {
  USER: '@blogapp_user',
  THEME: '@blogapp_theme',
} as const;