/**
 * Theme configuration for the Provider Frontend app
 * Using React Native Paper for UI components
 */
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.main,
    primaryContainer: colors.primary.light,
    secondary: colors.secondary.main,
    secondaryContainer: colors.secondary.light,
    background: colors.background.default,
    surface: colors.background.paper,
    error: colors.semantic.error,
    onPrimary: colors.primary.contrastText,
    onSecondary: colors.secondary.contrastText,
    onBackground: colors.text.primary,
    onSurface: colors.text.primary,
    onError: colors.neutral.white,
  },
  roundness: 8,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary.light,
    primaryContainer: colors.primary.dark,
    secondary: colors.secondary.light,
    secondaryContainer: colors.secondary.dark,
    background: colors.neutral.darkest,
    surface: colors.neutral.darker,
    error: colors.semantic.error,
    onPrimary: colors.primary.contrastText,
    onSecondary: colors.secondary.contrastText,
    onBackground: colors.neutral.white,
    onSurface: colors.neutral.white,
    onError: colors.neutral.white,
  },
  roundness: 8,
};

export type AppTheme = typeof lightTheme;

export default {
  light: lightTheme,
  dark: darkTheme,
};
