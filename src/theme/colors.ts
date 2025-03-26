/**
 * Color palette for the Provider Frontend app
 * Using blue and green to signify trust and loyalty with a modern minimal aesthetic
 */
export const colors = {
  // Primary colors
  primary: {
    main: '#1976D2', // Blue
    light: '#4791DB',
    dark: '#115293',
    contrastText: '#FFFFFF',
  },
  
  // Secondary colors
  secondary: {
    main: '#2E7D32', // Green
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#FFFFFF',
  },
  
  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    lightest: '#F5F5F5',
    lighter: '#EEEEEE',
    light: '#E0E0E0',
    medium: '#9E9E9E',
    dark: '#616161',
    darker: '#424242',
    darkest: '#212121',
    black: '#000000',
  },
  
  // Semantic colors
  semantic: {
    success: '#4CAF50',
    info: '#2196F3',
    warning: '#FF9800',
    error: '#F44336',
  },
  
  // Background colors
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
    card: '#FFFFFF',
  },
  
  // Text colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    hint: '#9E9E9E',
  },
  
  // Border colors
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E',
  },
};

export type ColorPalette = typeof colors;
