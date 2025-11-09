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
        tabler: ['compass', 'chart-line', 'heart-handshake', 'network', 'rocket', 'sparkles']
      }
    })
  ]
});
