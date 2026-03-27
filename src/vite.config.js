import { defineConfig } from 'vite';
import base44Plugin from '@base44/vite-plugin';

export default defineConfig({
  plugins: [base44Plugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Prevent recharts and d3 from being split into a separate chunk
          // which causes "Cannot access 'X' before initialization" in production
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-') ||
              id.includes('node_modules/internmap') ||
              id.includes('node_modules/delaunator')) {
            return 'vendor';
          }
        },
      },
    },
  },
});