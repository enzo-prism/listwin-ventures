import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.listwinventures.com',
  server: {
    port: 8080
  },
  // compressHTML strips the newline between running text and an inline element
  // ("founded the<a>Canary Foundation</a>"), which glued words together across the old site.
  compressHTML: false,
  devToolbar: {
    enabled: false
  },
  // Hover/focus prefetch makes same-site navigation feel instant. It is a tiny same-origin
  // inline script, so the existing CSP needs no change.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
