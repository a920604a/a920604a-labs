import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import type { UserConfig } from 'vite'

/**
 * Base Vite config shared across all apps.
 * Each app should spread this and add its own `base` and `resolve.alias` if needed.
 */
export function createViteConfig(appRoot: string, overrides: Partial<UserConfig> = {}): UserConfig {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(appRoot, 'src'),
      },
    },
    ...overrides,
  }
}
