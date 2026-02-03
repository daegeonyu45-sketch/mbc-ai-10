
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel deployment requires base: '/' and standard browser environment
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    historyApiFallback: true,
  }
});
