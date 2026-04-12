import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/resign-stamp/',
  envDir: '../../',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
