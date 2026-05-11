// packages/ui/src/theme/themes.ts
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

export const THEME_ORDER = ['light', 'dark', 'ocean', 'rose', 'forest', 'mono'] as const
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
  light: makeTheme('light', {
    colors: {
      brand: { 50:'#e8f4fd',100:'#bee3f8',200:'#90cdf4',300:'#63b3ed',400:'#4299e1',500:'#3182ce',600:'#2b6cb0',700:'#2c5282',800:'#2a4365',900:'#1A365D' },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
  dark: makeTheme('dark', {
    colors: {
      brand: { 50:'#e8f4fd',100:'#bee3f8',200:'#90cdf4',300:'#63b3ed',400:'#4299e1',500:'#3182ce',600:'#2b6cb0',700:'#2c5282',800:'#2a4365',900:'#1A365D' },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
  ocean: makeTheme('dark', {
    colors: {
      brand: { 50:'#e0f7ff',100:'#bae6fd',200:'#7dd3fc',300:'#38bdf8',400:'#0ea5e9',500:'#0284c7',600:'#0369a1',700:'#075985',800:'#0c4a6e',900:'#082f49' },
      gray: { 50:'#f0f9ff',100:'#e0f2fe',200:'#bae6fd',300:'#7dd3fc',400:'#38bdf8',500:'#94a3b8',600:'#475569',700:'#1e3a5f',800:'#0f2744',900:'#0c1a2e',950:'#060e1a' },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg': { _dark: '#0a1628' },
        'chakra-subtle-bg': { _dark: '#0c1a2e' },
        'chakra-border-color': { _dark: '#1e3a5f' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
  rose: makeTheme('light', {
    colors: {
      brand: { 50:'#fff1f2',100:'#ffe4e6',200:'#fecdd3',300:'#fda4af',400:'#fb7185',500:'#f43f5e',600:'#e11d48',700:'#be123c',800:'#9f1239',900:'#881337' },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
  forest: makeTheme('dark', {
    colors: {
      brand: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d' },
      gray: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#6b7280',600:'#374151',700:'#1f3a2a',800:'#14291d',900:'#0f3d22',950:'#071a0f' },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg': { _dark: '#071a0f' },
        'chakra-subtle-bg': { _dark: '#0f3d22' },
        'chakra-border-color': { _dark: '#1f3a2a' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
  mono: makeTheme('dark', {
    colors: {
      brand: { 50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#a1a1aa',500:'#71717a',600:'#52525b',700:'#3f3f46',800:'#27272a',900:'#18181b' },
      gray: { 50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#a1a1aa',500:'#71717a',600:'#52525b',700:'#3f3f46',800:'#27272a',900:'#18181b',950:'#09090b' },
    },
    semanticTokens: {
      colors: {
        'chakra-body-bg': { _dark: '#09090b' },
        'chakra-subtle-bg': { _dark: '#18181b' },
        'chakra-border-color': { _dark: '#27272a' },
      },
    },
    components: { Button: { defaultProps: { colorScheme: 'brand' } } },
  }),
}

export const THEME_META: Record<ThemeKey, { label: string; swatch: string; mode: 'light' | 'dark' }> = {
  light:  { label: 'Light',  swatch: '#3182ce', mode: 'light' },
  dark:   { label: 'Dark',   swatch: '#4a5568', mode: 'dark'  },
  ocean:  { label: 'Ocean',  swatch: '#0284c7', mode: 'dark'  },
  rose:   { label: 'Rose',   swatch: '#e11d48', mode: 'light' },
  forest: { label: 'Forest', swatch: '#16a34a', mode: 'dark'  },
  mono:   { label: 'Mono',   swatch: '#52525b', mode: 'dark'  },
}
