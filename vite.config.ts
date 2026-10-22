import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import site from './site.config.json'
export default defineConfig(({ command, isPreview }) => ({
  plugins: [vue()],
  base: process.env.BASE_PATH || (command === 'serve' && !isPreview ? '/' : site.basePath),
  server: { port: 5173, strictPort: true },
}))
