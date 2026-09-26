import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages 子路徑，見 docs/entities/github.io架站.md
const base = '/healbuddy/';

export default defineConfig({
  base,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'healbuddy',
        short_name: 'healbuddy',
        description: '只記多吃的東西和運動的紀錄本',
        lang: 'zh-Hant',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#fbf7f2',
        theme_color: '#f2a65a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html'
      }
    })
  ],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js'],
    setupFiles: ['tests/setup.js']
  },
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined
});
