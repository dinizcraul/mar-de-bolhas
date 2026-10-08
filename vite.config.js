import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Gera um único HTML com tudo embutido: abre com dois cliques, sem servidor
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
})
