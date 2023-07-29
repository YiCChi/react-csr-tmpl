import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

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
  test: {
    root: `${process.cwd()}/src`,
    environment: 'jsdom',
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      exclude: ['**/**.tsx'],
      perFile: true,
      all: true,
      '100': true,
    },
  },
}));
