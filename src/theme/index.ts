/**
 * Theme definitions for the application
 * Provides type safety for styled-components
 */
import { MD3Colors, MD2Colors } from 'react-native-paper';

export interface Theme {
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    secondary: string;
    accent: string;
    [key: string]: string;
  };
}

// Default theme configuration
const theme: Theme = {
  colors: {
    primary: '#2196F3',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    error: '#B00020',
    secondary: '#03DAC6',
    accent: '#03DAC6',
  },
};

export default theme;
