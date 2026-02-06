import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import solid from '@astrojs/solid-js';
import icon from 'astro-icon';

export default defineConfig({
  server: {
    port: 8080
  },
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    solid(),
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
