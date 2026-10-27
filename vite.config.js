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
          // The bundler's own helper shims (interop, _extends) are virtual modules with
          // no path. Left to chance they get parked inside whichever chunk first needs
          // them — which is how a 200-byte helper ended up inside the 1.5 MB 3D chunk,
          // making the entry screen import three.js and recharts to reach it. They get
          // their own tiny chunk instead, so a page that draws no chart and no globe
          // downloads neither.
          if (!id.includes('/node_modules/') && !id.includes('/src/')) return 'helpers';
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