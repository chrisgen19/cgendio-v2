import {defineConfig} from 'vitest/config';

/* Unit tests sit next to the code they cover. The e2e suite in e2e/ runs with Playwright instead. */
export default defineConfig({
  resolve: {tsconfigPaths: true},
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
