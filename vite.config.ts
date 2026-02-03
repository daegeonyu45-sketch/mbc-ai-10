
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel deployment requires base: '/' and a defined process.env for browser compatibility
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'process.env': {}
  },
  server: {
    historyApiFallback: true,
  }
});
