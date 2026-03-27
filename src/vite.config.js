import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import base44Plugin from '@base44/vite-plugin';

export default defineConfig({
  plugins: [react(), base44Plugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'tailwind-merge',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      'lucide-react',
      '@tanstack/react-query',
      'sonner',
      'clsx',
    ],
  },
});