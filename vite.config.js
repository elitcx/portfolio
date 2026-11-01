import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Admin is its own entry, so public pages never load its code.
      input: { main: 'index.html', admin: 'admin/index.html' },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react-vendor';
        },
      },
    },
  },
})
