import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        work: resolve(__dirname, 'work.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        'ai-platforms': resolve(__dirname, 'ai-platforms.html'),
        'sales-automation': resolve(__dirname, 'sales-automation.html'),
        'lead-generation': resolve(__dirname, 'lead-generation.html'),
        'hiring-automation': resolve(__dirname, 'hiring-automation.html'),
        'social-media': resolve(__dirname, 'social-media.html'),
        'code-generation': resolve(__dirname, 'code-generation.html'),
      },
    },
  },
});
