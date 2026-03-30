import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: true
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          if (id.includes('/three/') || id.includes('/globe.gl/')) return 'vendor-3d';
          if (id.includes('/recharts/')) return 'vendor-recharts';
          if (id.includes('/d3-') || id.includes('/d3/')) return 'vendor-d3';
          if (id.includes('/react-leaflet/') || id.includes('/leaflet/')) return 'vendor-maps';
          if (id.includes('/@radix-ui/') || id.includes('/framer-motion/') || id.includes('/@floating-ui/') || id.includes('/cmdk/') || id.includes('/vaul/') || id.includes('/react-day-picker/') || id.includes('/embla-carousel')) return 'vendor-ui';
          if (id.includes('/@tanstack/')) return 'vendor-query';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'vendor-react';
          if (id.includes('/lodash')) return 'vendor-utils';
        },
      },
    },
  },
});