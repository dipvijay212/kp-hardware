export const COLORS = {
  primary: '#0A1E6A', // Modern Dark Navy Blue
  secondary: '#F5F7FA', // Off-white/Light Grey background
  accent: '#00C853', // Vibrant Green for success/WhatsApp
  background: '#FFFFFF',
  
  // Neutral tones
  textPrimary: '#1E293B', // Slate 800
  textSecondary: '#64748B', // Slate 500
  textLight: '#94A3B8', // Slate 400
  
  cardBackground: '#F8FAFC', // Slate 50
  border: '#E2E8F0', // Slate 200
  
  // Status Colors
  success: '#00C853', // Modern green
  warning: '#F59E0B', // Amber 500
  danger: '#EF4444', // Red 500
  brandRed: '#D60000', // Previous secondary red
  
  // Other colors
  white: '#FFFFFF',
  shadowColor: '#0F172A',
  whatsappGreen: '#00C853'
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16, // Modern 16px border radius
  xl: 20,
  round: 9999
};

export const SHADOWS = {
  subtle: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  }
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const
  }
};
export type ColorsType = typeof COLORS;
export type SpacingType = typeof SPACING;
export type BorderRadiusType = typeof BORDER_RADIUS;
export type ShadowsType = typeof SHADOWS;
export type TypographyType = typeof TYPOGRAPHY;
