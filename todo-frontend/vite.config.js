import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    // Indispensable pour Docker : permet d'accéder au serveur depuis l'extérieur du conteneur
    host: true, 
    port: 5173,
    // Configuration du Proxy pour éviter les erreurs CORS lors du développement local
    proxy: {
      '/api': {
        target: 'http://backend:8080', // "backend" correspond au nom du service dans docker-compose.yml
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Dossier de sortie (utilisé par le Dockerfile pour Nginx)
    outDir: 'dist',
  }
})