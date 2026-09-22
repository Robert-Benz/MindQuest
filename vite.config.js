import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@google/generative-ai',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'framer-motion',
      'lucide-react',
      'react-router-dom'
    ]
  },
  server: {
    watch: {
      usePolling: true, // Garante que o Windows detecte salvamento instantaneamente
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  }
});