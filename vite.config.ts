
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vercel 배포를 위해 루트 경로를 사용하며, process.env 객체를 브라우저에 안전하게 정의합니다.
  define: {
    'process.env': {}
  }
});
