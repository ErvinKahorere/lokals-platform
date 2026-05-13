import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Keep the HTML entry name stable on Windows workspaces with spaces.
      input: {
        app: 'index.html',
      },
    },
  },
  server: {
    port: 5173,
  },
})
