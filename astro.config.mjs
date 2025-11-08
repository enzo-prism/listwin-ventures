import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  server: {
    port: 8080
  },
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ]
});
