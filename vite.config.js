import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages project site: https://kunal4060.github.io/papervault/
  base: '/papervault/',
  build: {
    // firebase SDK is a real (lazy) dependency — bundle stays over the
    // default 500 kB warning line. TODO: code-split firebase + admin chunks.
    chunkSizeWarningLimit: 1200,
  },
})
