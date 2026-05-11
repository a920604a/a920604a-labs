import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

export const THEME_ORDER = ['apple-dark', 'apple-light', 'warm', 'nord', 'catppuccin', 'tokyo'] as const
export type ThemeKey = typeof THEME_ORDER[number]

const fonts = {
  heading: `'Noto Sans TC', 'Inter', sans-serif`,
  body: `'Noto Sans TC', 'Inter', sans-serif`,
}

function makeTheme(
  colorMode: 'light' | 'dark',
  overrides: Parameters<typeof extendTheme>[0] = {}
) {
  const config: ThemeConfig = {
    initialColorMode: colorMode,
    useSystemColorMode: false,
  }
  return extendTheme({ config, fonts, ...overrides })
}

export const THEMES: Record<ThemeKey, ReturnType<typeof extendTheme>> = {
  'apple-dark': makeTheme('dark', {
    colors: {
      brand: {
        50: '#e5f2ff', 100: '#b3d9ff', 200: '#80bfff', 300: '#4da6ff', 400: '#1a8cff',
        500: '#0a84ff', 600: '#0066cc', 700: '#004d99', 800: '#003366', 900: '#001a33',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#000000' },
        'chakra-subtle-bg':    { _dark: '#1c1c1e' },
        'chakra-border-color': { _dark: 'rgba(84,84,88,0.65)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  'apple-light': makeTheme('light', {
    colors: {
      brand: {
        50: '#e5f0ff', 100: '#cce1ff', 200: '#99c3ff', 300: '#66a4ff', 400: '#3386ff',
        500: '#007aff', 600: '#005ecc', 700: '#004799', 800: '#002f66', 900: '#001833',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _light: '#f5f5f7' },
        'chakra-subtle-bg':    { _light: '#ffffff' },
        'chakra-border-color': { _light: 'rgba(60,60,67,0.18)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  'warm': makeTheme('light', {
    colors: {
      brand: {
        50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
        500: '#d97706', 600: '#b45309', 700: '#92400e', 800: '#78350f', 900: '#451a03',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _light: '#f7f3ea' },
        'chakra-subtle-bg':    { _light: '#fffaf0' },
        'chakra-border-color': { _light: 'rgba(92,76,57,0.18)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  'nord': makeTheme('dark', {
    colors: {
      brand: {
        50: '#f0f9fb', 100: '#d0edf2', 200: '#a8dae5', 300: '#8dcfe0', 400: '#88c0d0',
        500: '#81a1c1', 600: '#5e81ac', 700: '#4c6f96', 800: '#3a5578', 900: '#2a3f5f',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#2e3440' },
        'chakra-subtle-bg':    { _dark: '#3b4252' },
        'chakra-border-color': { _dark: 'rgba(76,86,106,0.8)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  'catppuccin': makeTheme('dark', {
    colors: {
      brand: {
        50: '#eef4fe', 100: '#d5e7fc', 200: '#b9d5fb', 300: '#9dc4fa', 400: '#89b4fa',
        500: '#74a3f9', 600: '#5e8ef8', 700: '#4878f7', 800: '#2859f6', 900: '#1845d0',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#1e1e2e' },
        'chakra-subtle-bg':    { _dark: '#313244' },
        'chakra-border-color': { _dark: 'rgba(69,71,90,0.9)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  'tokyo': makeTheme('dark', {
    colors: {
      brand: {
        50: '#eef3fe', 100: '#d4e3fd', 200: '#b8d0fc', 300: '#9cbcfb', 400: '#7aa2f7',
        500: '#5e8cf5', 600: '#4172f3', 700: '#2659f1', 800: '#1344dd', 900: '#0f33b8',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#1a1b2e' },
        'chakra-subtle-bg':    { _dark: '#24253a' },
        'chakra-border-color': { _dark: 'rgba(65,72,104,0.8)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
}

export const THEME_META: Record<ThemeKey, { label: string; swatch: string; mode: 'light' | 'dark' }> = {
  'apple-dark':  { label: 'Apple Dark',  swatch: '#0a84ff', mode: 'dark'  },
  'apple-light': { label: 'Apple Light', swatch: '#007aff', mode: 'light' },
  'warm':        { label: 'Warm Read',   swatch: '#d97706', mode: 'light' },
  'nord':        { label: 'Nord',        swatch: '#88c0d0', mode: 'dark'  },
  'catppuccin':  { label: 'Catppuccin',  swatch: '#89b4fa', mode: 'dark'  },
  'tokyo':       { label: 'Tokyo Night', swatch: '#7aa2f7', mode: 'dark'  },
}
