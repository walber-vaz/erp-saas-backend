import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@generated': path.resolve(__dirname, 'src/generated'),
    },
  },
  test: {
    globals: true,
    root: './',
    include: ['**/*.{test,spec,e2e-spec}.{ts,js}'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
