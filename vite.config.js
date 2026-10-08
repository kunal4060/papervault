import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // firebase SDK is a real (lazy) dependency — bundle stays over the
    // default 500 kB warning line. TODO: code-split firebase + admin chunks.
    chunkSizeWarningLimit: 1200,
  },
})
