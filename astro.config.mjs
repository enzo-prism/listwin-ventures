import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://listwinventures.com',
  server: {
    port: 8080
  },
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    react(),
    icon({
      include: {
        'heroicons-outline': ['book-open', 'academic-cap', 'heart', 'light-bulb'],
        tabler: [
          'compass',
          'chart-line',
          'heart-handshake',
          'network',
          'rocket',
          'sparkles',
          'briefcase',
          'chart-bar',
          'school',
          'heart',
          'hospital',
          'building-bank',
          'building-church',
          'shield-heart',
          'book',
          'user-heart',
          'news',
          'speakerphone',
          'video',
          'link',
          'brand-twitter',
          'brand-linkedin',
          'brand-facebook',
          'device-analytics',
          'stethoscope',
          'brain',
          'cloud-computing',
          'dna',
          'lungs',
          'wifi',
          'server',
          'database',
          'layers-linked',
          'apps',
          'device-desktop-analytics',
          'users-group',
          'bulb',
          'home'
        ]
      }
    })
  ]
});
