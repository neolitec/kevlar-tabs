import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'kevlar-tabs',
      formats: ['es'],
      fileName: (format) => `kevlar-tabs.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './setupTests.ts',
    coverage: {
      exclude: ['setupTests.ts', '**/*.test.tsx', '**/*.stories.tsx'],
      reporter: ['text', 'json', 'html'],
    },
  },
})
