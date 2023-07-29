import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
  },
  build: {
    sourcemap: mode === 'production' ? 'hidden' : true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          lodash: ['lodash'],
        },
      },
    },
  },
  plugins: [react()],
}));
