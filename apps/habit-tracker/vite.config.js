import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  base: '/habit-tracker/',
  plugins: [react()],
  envDir: '../../',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
