// packages/ui/src/ThemeProvider.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { ChakraProvider, useColorMode } from '@chakra-ui/react'
import { THEMES, THEME_META, THEME_ORDER } from './theme/themes'

type ThemeName = typeof THEME_ORDER[number]

interface ThemeContextValue {
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'light',
  setTheme: () => {},
})

export function useAppTheme() {
  return useContext(ThemeContext)
}

// Syncs Chakra colorMode to the selected theme's target mode
function ColorModeSync({ targetMode }: { targetMode: 'light' | 'dark' }) {
  const { setColorMode } = useColorMode()
  useEffect(() => {
    setColorMode(targetMode)
  }, [targetMode, setColorMode])
  return null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(
    () => (localStorage.getItem('app-theme') as ThemeName) ?? 'light'
  )

  const selectedTheme = THEMES[themeName] ?? THEMES.light
  const targetMode = THEME_META[themeName]?.mode ?? 'light'

  const setTheme = (name: ThemeName) => {
    localStorage.setItem('app-theme', name)
    setThemeName(name)
  }

  return (
    <ThemeContext.Provider value={{ themeName, setTheme }}>
      <ChakraProvider theme={selectedTheme}>
        <ColorModeSync targetMode={targetMode} />
        {children}
      </ChakraProvider>
    </ThemeContext.Provider>
  )
}
