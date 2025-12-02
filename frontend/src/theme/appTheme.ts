// VETRA Depth Recorder - App Theme
// Material 3 inspired theme with green primary and amber secondary

export const AppColors = {
  // Primary colors
  primary: '#388E3C',
  primaryLight: '#4CAF50',
  primaryDark: '#2E7D32',
  
  // Secondary colors
  secondary: '#FFA000',
  secondaryLight: '#FFB300',
  secondaryDark: '#FF8F00',
  
  // Background colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#E8E8E8',
  
  // Text colors
  onPrimary: '#FFFFFF',
  onSecondary: '#000000',
  onBackground: '#212121',
  onSurface: '#212121',
  onSurfaceVariant: '#757575',
  
  // Status colors
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#FFA000',
  info: '#1976D2',
  
  // Misc
  divider: '#E0E0E0',
  disabled: '#BDBDBD',
  placeholder: '#9E9E9E',
};

export const AppSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const AppBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const AppTypography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const AppShadow = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Button style presets
export const ButtonStyles = {
  primary: {
    minHeight: 48,
    borderRadius: AppBorderRadius.xl,
    backgroundColor: AppColors.primary,
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
  },
  secondary: {
    minHeight: 48,
    borderRadius: AppBorderRadius.xl,
    backgroundColor: AppColors.secondary,
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
  },
  outlined: {
    minHeight: 48,
    borderRadius: AppBorderRadius.xl,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: AppColors.primary,
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
  },
};
