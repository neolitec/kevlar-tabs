import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'node:url'
import theme from './shiki-theme.json'

// https://astro.build/config
export default defineConfig({
  integrations: [mdx({
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'nord' },
  }), react()],
  markdown: {
    syntaxHighlight: 'prism',
    shikiConfig: {
      // Choose from Shiki's built-in themes (or add your own)
      // https://github.com/shikijs/shiki/blob/main/docs/themes.md
      theme,
      // Add custom languages
      // Note: Shiki has countless langs built-in, including .astro!
      // https://github.com/shikijs/shiki/blob/main/docs/languages.md
      // langs: ['ts', 'tsx', 'js', 'jsx', 'json', 'css', 'html', 'astro'],
      langs: [
        'tsx',
        {
          language: 'source.css.styled',
          scopeName: 'source.css.styled',
          path: fileURLToPath(new URL('css.styled.json', import.meta.url)),
        },
        {
          injectTo: [
            'source.js',
            'source.ts',
            'source.jsx',
            'source.js.jsx',
            'source.tsx',
            'source.vue',
            'source.svelte',
          ],
          scopeName: 'styled',
          path: fileURLToPath(new URL('styled.json', import.meta.url)),
          embeddedLanguages: {
            'source.css.scss': 'css',
            'meta.embedded.line.ts': 'typescript',
          },
        },

        //   {
        //   id: 'styled',
        //   scopeName: 'tsx',
        //   path: fileURLToPath(new URL('styled.json', import.meta.url)),
        // }
      ],
      // Enable word wrap to prevent horizontal scrolling
      wrap: true,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
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
    // ssr: {
    //   noExternal: ['styled-components']
    // }
  },
})
