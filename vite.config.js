import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/order':   'http://localhost:8080',
      '/process': 'http://localhost:8080',
      '/queue':   'http://localhost:8080',
      '/history': 'http://localhost:8080',
      '/stats':   'http://localhost:8080',
    }
  }
})