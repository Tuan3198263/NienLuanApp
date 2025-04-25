import { useColorScheme as _useColorScheme } from 'react-native';

// Bạn có thể sử dụng value này nếu bạn muốn sử dụng 'light' | 'dark'
export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  return _useColorScheme() as ColorScheme;
}
