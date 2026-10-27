import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// The opening frame is already painted from the document's own bytes — see
// #boot-shell in index.html, which carries its own styles inline. The app's
// stylesheet used to be a render-blocking request in front of that frame, so the
// first paint waited on 58 KiB it did not need yet. It is served as a preload and
// promoted to a stylesheet the moment it lands: same bytes, same cascade, but the
// opening no longer waits behind it. React mounts far later than the sheet
// arrives, so nothing flashes unstyled.
function asyncAppCss() {
  return {
    name: 'async-app-css',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const html = Object.values(bundle).find(
        (f) => f.type === 'asset' && typeof f.fileName === 'string' && f.fileName.endsWith('.html')
      );
      if (!html) return;
      const source = String(html.source);
      if (source.includes('rel="preload" as="style"')) return;
      html.source = source.replace(/<link\b[^>]*>/g, (tag) => {
        if (!/rel="stylesheet"/.test(tag) || !/\.css"/.test(tag)) return tag;
        const href = (tag.match(/href="([^"]+)"/) || [])[1];
        if (!href) return tag;
        const cors = /\scrossorigin\b/.test(tag) ? ' crossorigin' : '';
        return (
          `<link rel="preload" as="style" href="${href}"${cors} ` +
          `onload="this.onload=null;this.rel='stylesheet'">` +
          `<noscript><link rel="stylesheet" href="${href}"${cors}></noscript>`
        );
      });
    },
  };
}

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
    asyncAppCss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
    // Ship ES2020 as written. esbuild otherwise rewrites syntax the platform's browsers
    // all speak natively (async/await, optional chaining, class fields) and injects the
    // helpers it needs to do it — bytes no visitor here ever runs. The modulepreload
    // polyfill goes with it: it only exists for browsers that will never load this app.
    target: 'es2020',
    modulePreload: { polyfill: false },
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