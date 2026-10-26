import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isHmrDisabled = process.env.DISABLE_HMR === 'true' || env.DISABLE_HMR === 'true' || process.env.VITE_ENABLE_HMR !== 'true';

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'Morocco Nursery & Produce Market',
          short_name: 'AgriMaroc',
          description: 'Nursery stock inventory management and agricultural marketplace for fruits and vegetables across Morocco.',
          theme_color: '#15803d',
          background_color: '#fafaf9',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1200,
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
            'vendor-export-tools': ['jspdf', 'xlsx'],
            'vendor-ui-motion': ['lucide-react', 'motion'],
            'vendor-dataviz': ['d3', 'qrcode'],
            'vendor-maps': ['@vis.gl/react-google-maps'],
          },
        },
      },
    },
    esbuild: mode === 'production' ? { drop: ['debugger' as const] } : undefined,
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
      cors: true,
      // HMR is disabled in AI Studio via DISABLE_HMR to prevent WebSocket conflicts inside iframe
      hmr: isHmrDisabled ? false : { port: 3000 },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits
      watch: (process.env.DISABLE_HMR === 'true' || env.DISABLE_HMR === 'true') ? null : {},
    },
  };
});
