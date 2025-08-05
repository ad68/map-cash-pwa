import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // آپدیت خودکار سرویس‌ورکر
      devOptions: {
        enabled: true, // فعال کردن PWA تو حالت dev برای تست
      },
      manifest: {
        name: 'My Map PWA',
        short_name: 'MapPWA',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // الگوی URL برای درخواست‌های Tile نقشه
            urlPattern: /^https?:\/\/37\.32\.26\.141:8080\/wmts\/gm_layer\/gm_grid\/\d+\/\d+\/\d+\.png$/,
            handler: 'CacheFirst',       // اول کش رو چک کن، در صورت نبود fetch کن
            options: {
              cacheName: 'tile-cache',   // نام کش برای tileها
              expiration: {
                maxEntries: 1000,        // حداکثر تعداد کش شده‌ها
                maxAgeSeconds: 30 * 24 * 60 * 60, // ۳۰ روز اعتبار کش
              },
              cacheableResponse: {
                statuses: [0, 200],      // فقط پاسخ‌های موفق کش میشن
              },
            },
          },
        ],
      },
    }),
  ],
})
