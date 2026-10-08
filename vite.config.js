import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Embute o código e os estilos no index.html; os vídeos de public/midia/ vão como arquivos em dist/midia/
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
})
