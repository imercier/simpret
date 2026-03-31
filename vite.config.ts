import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
const buildDate = new Date().toISOString().slice(0, 16).replace('T', ' ');
const buildNumber = Math.floor(Date.now() / 1000);

export default defineConfig({
  base: '/simpret/',
  plugins: [svelte()],
  define: {
    __BUILD_DATE__: JSON.stringify(buildDate),
    __BUILD_NUMBER__: JSON.stringify(buildNumber),
  },
})
