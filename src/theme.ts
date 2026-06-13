import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: { fontSize: 36, fontWeight: '700' as const, lineHeight: 44 },
  displayMedium: { fontSize: 30, fontWeight: '700' as const, lineHeight: 38 },
  displaySmall: { fontSize: 26, fontWeight: '600' as const, lineHeight: 34 },
  headlineLarge: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
  headlineMedium: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  headlineSmall: { fontSize: 22, fontWeight: '600' as const, lineHeight: 30 },
  titleLarge: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  titleMedium: { fontSize: 18, fontWeight: '500' as const, lineHeight: 26 },
  titleSmall: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
  bodyMedium: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 22 },
  labelLarge: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  labelMedium: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  labelSmall: { fontSize: 12, fontWeight: '500' as const, lineHeight: 18 },
};

export const COLORS = {
  primaryGreen: '#4FA98C', // Mint green from the logo/buttons
  primaryGreenDark: '#3A8068',
  primaryGreenLight: '#8FD1BC',
  primaryGreenSoft: '#E6F4F0',
  secondaryWarning: '#F8B140', // Orange for the recipe expiration
  secondaryWarningLight: '#FDF1DD',
  neutralDark: '#2C3E50',
  neutralMedium: '#7F8C8D',
  white: '#FFFFFF',
  offWhite: '#F7F9F9',
  backgroundGradientStart: '#E6F4F0',
  backgroundGradientEnd: '#FFFFFF',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textMuted: '#95A5A6',
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(79, 169, 140, 0.08)',
  divider: '#EAEDED',
  primary: '#4FA98C',
  accent: '#F8B140',
  success: '#4FA98C',
  warning: '#F8B140',
  error: '#E74C3C',
  iconTint: '#4FA98C',
  stepCircle: '#4FA98C',
  stepCircleInactive: '#D5DBDB',
  overlay: 'rgba(79, 169, 140, 0.06)',
};

export const GRADIENTS = {
  greenToMint: ['#4FA98C', '#8FD1BC'],
  lightMint: ['#E6F4F0', '#FFFFFF'],
  hero: ['#2F7C63', '#4FA98C', '#8FD1BC'],
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primaryGreen,
    secondary: COLORS.secondaryWarning,
    background: COLORS.offWhite,
    surface: COLORS.white,
    surfaceVariant: COLORS.primaryGreenSoft,
    onPrimary: COLORS.white,
    onSecondary: COLORS.white,
    onBackground: COLORS.textPrimary,
    onSurface: COLORS.textPrimary,
    outline: COLORS.divider,
    elevation: {
      level0: 'transparent',
      level1: COLORS.white,
      level2: COLORS.offWhite,
      level3: COLORS.primaryGreenSoft,
      level4: COLORS.primaryGreenSoft,
      level5: COLORS.primaryGreenSoft,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
};
