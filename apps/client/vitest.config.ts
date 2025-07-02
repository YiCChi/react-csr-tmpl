import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
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
