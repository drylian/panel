import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import TanStackRouterVite from '@tanstack/router-plugin/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), TanStackRouterVite({
    generatedRouteTree: 'src/assets/__gerated_routes.ts'
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    outDir: '../dist/build', 
  },
  server: {
    port:5173,
    strictPort: true
  },
})
