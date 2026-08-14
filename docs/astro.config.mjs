import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'

// Sass' modern API resolves `@use` relative to the importing file, where the
// legacy API Astro 2 used resolved it from the working directory. The shared
// partials below are addressed from the project root, so it has to be on the
// load path explicitly.
const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://astro.build/config
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  site: 'https://neolitec.github.com/kevlar-tabs',
  base: '/kevlar-tabs',
  trailingSlash: 'never',
  integrations: [react()],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [projectRoot],
          // include-media still uses the deprecated `if()` syntax. Nothing we
          // can fix from here, and it warns on every stylesheet.
          quietDeps: true,
          additionalData: `
            @use "src/styles/typography" as *;
            @use "src/styles/colors" as *;
            @use "src/styles/metrics" as *;
            @use "src/styles/effects" as *;
            @use "node_modules/include-media/dist/include-media" as *;
            $breakpoints: (small: 800px, medium: 1024px, large: 1440px);
          `,
        },
      },
    },
  },
})
