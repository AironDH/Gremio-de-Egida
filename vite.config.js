import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gremio de Égida',
        short_name: 'Gremio de Égida',
        description: 'Gestor de hojas de personaje DnD',
        theme_color: '#c084fc',
        background_color: '#e5e4e7',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'public/gremio-192.png', // No se usa '/' al inicio si usas el plugin
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'public/gremio-app-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'public/gremio-app-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Iconos de Android
          }
        ]
      }
    })
  ],
})
