import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4001,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 4001,
    },
    watch: {
      usePolling: true,
    },
  },
});
