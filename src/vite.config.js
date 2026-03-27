import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import base44Plugin from '@base44/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [react(), base44Plugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Force recharts and its d3 dependencies into the main vendor chunk
          // to avoid circular dependency "Cannot access 'X' before initialization" in production
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor';
          }
        },
      },
    },
  },
});