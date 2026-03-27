import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Force recharts and its dependency d3 into the main vendor chunk
          // to avoid circular dependency "Cannot access 'X' before initialization" in production
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor';
          }
          // Keep other node_modules in default vendor splitting
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});