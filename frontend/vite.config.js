import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Default output directory
  }
//   server: {
//     // proxy: {
//     //     '/api': {
//     //         target: 'http://localhost:3000/api/v1',
//     //         changeOrigin: true,
//     //         secure: false,
//     //         rewrite: (path) => path.replace(/^\/api/, '')
//     //     },
//     // },
// },
})
