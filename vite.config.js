// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-splat-files',
      closeBundle() {
        const source = resolve(__dirname, 'public/living-room.splat')
        const dest = resolve(__dirname, 'dist/living-room.splat')
        mkdirSync(dirname(dest), { recursive: true })
        copyFileSync(source, dest)
        console.log('✓ Copied living-room.splat')
      }
    }
  ],
  build: {
    assetsInlineLimit: 0,
    minify: false  // Try building without minification
  }
})