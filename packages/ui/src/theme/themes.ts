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
  // --bg #000000  --bg-secondary #1c1c1e  --bg-tertiary #2c2c2e
  // --label #ffffff  --label-secondary rgba(235,235,245,0.6)
  // --separator rgba(84,84,88,0.65)  --accent #0a84ff
  'apple-dark': makeTheme('dark', {
    colors: {
      brand: {
        50: '#e5f2ff', 100: '#b3d9ff', 200: '#80bfff', 300: '#4da6ff', 400: '#1a8cff',
        500: '#0a84ff', 600: '#0066cc', 700: '#004d99', 800: '#003366', 900: '#001a33',
      },
      gray: {
        900: '#1c1c1e', // bg-secondary → sidebarBg
        800: '#2c2c2e', // bg-tertiary → toggleBtnBg
        700: '#3a3a3c', // hover / active / border
        600: '#48484a',
        500: '#636366',
        400: '#8e8e93',
        300: '#aeaeb2',
        200: '#c7c7cc',
        100: '#e5e5ea',
        50:  '#f2f2f7',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#000000' },
        'chakra-subtle-bg':    { _dark: '#1c1c1e' },
        'chakra-border-color': { _dark: 'rgba(84,84,88,0.65)' },
        'chakra-body-text':    { _dark: '#ffffff' },
        'chakra-subtle-text':  { _dark: 'rgba(235,235,245,0.6)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  // --bg #f5f5f7  --bg-secondary #ffffff  --bg-tertiary #e5e5ea
  // --label #1d1d1f  --label-secondary rgba(60,60,67,0.6)
  // --separator rgba(60,60,67,0.18)  --accent #007aff
  'apple-light': makeTheme('light', {
    colors: {
      brand: {
        50: '#e5f0ff', 100: '#cce1ff', 200: '#99c3ff', 300: '#66a4ff', 400: '#3386ff',
        500: '#007aff', 600: '#005ecc', 700: '#004799', 800: '#002f66', 900: '#001833',
      },
      gray: {
        50:  '#ffffff', // bg-secondary → sidebarBg
        100: '#eeeef0', // hover
        200: '#e5e5ea', // bg-tertiary → active / border
        300: '#d1d1d6',
        400: '#aeaeb2',
        500: '#8e8e93',
        600: '#636366',
        700: '#48484a',
        800: '#3a3a3c',
        900: '#2c2c2e',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _light: '#f5f5f7' },
        'chakra-subtle-bg':    { _light: '#ffffff' },
        'chakra-border-color': { _light: 'rgba(60,60,67,0.18)' },
        'chakra-body-text':    { _light: '#1d1d1f' },
        'chakra-subtle-text':  { _light: 'rgba(60,60,67,0.6)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  // --bg #f7f3ea  --bg-secondary #fffaf0  --bg-tertiary #eee6d6
  // --label #24201a  --label-secondary rgba(51,43,34,0.68)
  // --separator rgba(92,76,57,0.18)  --accent #2563eb
  'warm': makeTheme('light', {
    colors: {
      brand: {
        50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
        500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af', 800: '#1e3a8a', 900: '#1e3270',
      },
      gray: {
        50:  '#fffaf0', // bg-secondary → sidebarBg
        100: '#f5ede0', // hover
        200: '#eee6d6', // bg-tertiary → active / border
        300: '#d9ccba',
        400: '#b8a898',
        500: '#8c7b68',
        600: '#6b5c4a',
        700: '#4a3d2e',
        800: '#332a1e',
        900: '#1e180e',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _light: '#f7f3ea' },
        'chakra-subtle-bg':    { _light: '#fffaf0' },
        'chakra-border-color': { _light: 'rgba(92,76,57,0.18)' },
        'chakra-body-text':    { _light: '#24201a' },
        'chakra-subtle-text':  { _light: 'rgba(51,43,34,0.68)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  // --bg #2e3440  --bg-secondary #3b4252  --bg-tertiary #434c5e
  // --label #eceff4  --label-secondary rgba(216,222,233,0.75)
  // --separator rgba(76,86,106,0.8)  --accent #88c0d0
  'nord': makeTheme('dark', {
    colors: {
      brand: {
        50: '#f0f9fb', 100: '#d0edf2', 200: '#a8dae5', 300: '#8dcfe0', 400: '#88c0d0',
        500: '#81a1c1', 600: '#5e81ac', 700: '#4c6f96', 800: '#3a5578', 900: '#2a3f5f',
      },
      gray: {
        900: '#3b4252', // bg-secondary → sidebarBg
        800: '#434c5e', // bg-tertiary → toggleBtnBg
        700: '#4c566a', // hover / active / border
        600: '#616e88',
        500: '#7b88a0',
        400: '#9aa5ba',
        300: '#b8c3d4',
        200: '#d8dee9',
        100: '#e5e9f0',
        50:  '#eceff4',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#2e3440' },
        'chakra-subtle-bg':    { _dark: '#3b4252' },
        'chakra-border-color': { _dark: 'rgba(76,86,106,0.8)' },
        'chakra-body-text':    { _dark: '#eceff4' },
        'chakra-subtle-text':  { _dark: 'rgba(216,222,233,0.75)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  // --bg #1e1e2e  --bg-secondary #313244  --bg-tertiary #45475a
  // --label #cdd6f4  --label-secondary rgba(186,194,222,0.75)
  // --separator rgba(69,71,90,0.9)  --accent #89b4fa
  'catppuccin': makeTheme('dark', {
    colors: {
      brand: {
        50: '#eef4fe', 100: '#d5e7fc', 200: '#b9d5fb', 300: '#9dc4fa', 400: '#89b4fa',
        500: '#74a3f9', 600: '#5e8ef8', 700: '#4878f7', 800: '#2859f6', 900: '#1845d0',
      },
      gray: {
        900: '#313244', // bg-secondary → sidebarBg
        800: '#45475a', // bg-tertiary → toggleBtnBg
        700: '#585b70', // hover / active / border
        600: '#6c7086',
        500: '#7f849c',
        400: '#9399b2',
        300: '#a6adc8',
        200: '#bac2de',
        100: '#cdd6f4',
        50:  '#e6e9f4',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#1e1e2e' },
        'chakra-subtle-bg':    { _dark: '#313244' },
        'chakra-border-color': { _dark: 'rgba(69,71,90,0.9)' },
        'chakra-body-text':    { _dark: '#cdd6f4' },
        'chakra-subtle-text':  { _dark: 'rgba(186,194,222,0.75)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),

  // --bg #1a1b2e  --bg-secondary #24253a  --bg-tertiary #2d2f45
  // --label #c0caf5  --label-secondary rgba(154,165,206,0.8)
  // --separator rgba(65,72,104,0.8)  --accent #7aa2f7
  'tokyo': makeTheme('dark', {
    colors: {
      brand: {
        50: '#eef3fe', 100: '#d4e3fd', 200: '#b8d0fc', 300: '#9cbcfb', 400: '#7aa2f7',
        500: '#5e8cf5', 600: '#4172f3', 700: '#2659f1', 800: '#1344dd', 900: '#0f33b8',
      },
      gray: {
        900: '#24253a', // bg-secondary → sidebarBg
        800: '#2d2f45', // bg-tertiary → toggleBtnBg
        700: '#3d3f5c', // hover / active / border
        600: '#4e5178',
        500: '#6272a4',
        400: '#7c8bbf',
        300: '#9aa5d4',
        200: '#b4bee8',
        100: '#c0caf5',
        50:  '#e0e4f8',
      },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg':      { _dark: '#1a1b2e' },
        'chakra-subtle-bg':    { _dark: '#24253a' },
        'chakra-border-color': { _dark: 'rgba(65,72,104,0.8)' },
        'chakra-body-text':    { _dark: '#c0caf5' },
        'chakra-subtle-text':  { _dark: 'rgba(154,165,206,0.8)' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
}

export const THEME_META: Record<ThemeKey, { label: string; swatch: string; mode: 'light' | 'dark'; topbarBg: string }> = {
  'apple-dark':  { label: 'Apple Dark',  swatch: '#0a84ff', mode: 'dark',  topbarBg: 'rgba(28,28,30,0.88)'   },
  'apple-light': { label: 'Apple Light', swatch: '#007aff', mode: 'light', topbarBg: 'rgba(255,255,255,0.88)' },
  'warm':        { label: 'Warm Read',   swatch: '#d97706', mode: 'light', topbarBg: 'rgba(255,250,240,0.92)' },
  'nord':        { label: 'Nord',        swatch: '#88c0d0', mode: 'dark',  topbarBg: 'rgba(59,66,82,0.90)'   },
  'catppuccin':  { label: 'Catppuccin',  swatch: '#89b4fa', mode: 'dark',  topbarBg: 'rgba(49,50,68,0.90)'   },
  'tokyo':       { label: 'Tokyo Night', swatch: '#7aa2f7', mode: 'dark',  topbarBg: 'rgba(36,37,58,0.90)'   },
}
