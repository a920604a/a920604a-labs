import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#e8f4fd',
    100: '#bee3f8',
    200: '#90cdf4',
    300: '#63b3ed',
    400: '#4299e1',
    500: '#3182ce',
    600: '#2b6cb0',
    700: '#2c5282',
    800: '#2a4365',
    900: '#1A365D',
  },
}

const fonts = {
  heading: `'Noto Sans TC', 'Inter', sans-serif`,
  body: `'Noto Sans TC', 'Inter', sans-serif`,
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'brand',
    },
  },
}

export const theme = extendTheme({ config, colors, fonts, components })
