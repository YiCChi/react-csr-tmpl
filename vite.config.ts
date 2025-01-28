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
          'react-router': ['react-router'],
          lodash: ['lodash'],
        },
      },
    },
  },
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['**/**.tsx'],
      perFile: true,
      all: true,
      '100': true,
    },
    poolOptions: {
      threads: {
        minThreads: 4,
        maxThreads: 8,
        singleThread: true,
      },
    },
  },
}));
