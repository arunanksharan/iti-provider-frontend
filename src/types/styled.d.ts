/**
 * Type declarations for styled-components
 * This provides proper typing for the theme in styled components
 */
import 'styled-components/native';
import { Theme } from '@theme';

declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {}
}
