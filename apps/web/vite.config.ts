import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The reader loads EPUBs same-origin through /proxy/gutenberg to avoid CORS
// with www.gutenberg.org. In production the same path is handled by the
// rewrites in vercel.json.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/proxy/gutenberg': {
        target: 'https://www.gutenberg.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gutenberg/, ''),
      },
    },
  },
});
