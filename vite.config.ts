import { defineConfig } from 'vite';

export default defineConfig({
  base: '/slide/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        slideShow: 'slide_show.html',
      },
    },
  },
});