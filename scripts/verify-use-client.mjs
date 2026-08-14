// Guards the RSC contract: the published bundle must open with a single
// 'use client' directive, or importing from a React Server Component breaks.
// Rolldown currently hoists the directive from src/index.ts on its own; this
// check exists to fail `pnpm build` if a future bundler stops doing so.
import { readFileSync } from 'node:fs'
import path from 'node:path'

const bundlePath = path.resolve(import.meta.dirname, '../dist/kevlar-tabs.es.js')
const bundle = readFileSync(bundlePath, 'utf8')

const directive = /^(?:'use client'|"use client");?\s/
if (!directive.test(bundle)) {
  console.error(
    `✖ ${path.relative(process.cwd(), bundlePath)} does not start with a 'use client' directive.\n` +
      "  The bundler no longer hoists it from src/index.ts; React Server Components consumers would break."
  )
  process.exit(1)
}

const occurrences = bundle.match(/^(?:'use client'|"use client");?$/gm) ?? []
if (occurrences.length > 1) {
  console.error(
    `✖ ${path.relative(process.cwd(), bundlePath)} contains ${occurrences.length} 'use client' directives; expected exactly one at the top.`
  )
  process.exit(1)
}

console.log("✔ dist/kevlar-tabs.es.js starts with a single 'use client' directive.")
