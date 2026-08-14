import { defineConfig } from 'vite'

// https://vitejs.dev/config/
//
// No react() plugin here on purpose: Ladle injects its own @vitejs/plugin-react,
// pinned to the Vite major it runs. Adding the root one — version 6, which the
// Vite 8 library build needs — makes the dev server transform every module
// through a rolldown builtin that Ladle's Vite 6 rejects with
// `Missing field moduleType`, and nothing gets served. See issue #125.
export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    hmr: {
      host: '0.0.0.0',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
