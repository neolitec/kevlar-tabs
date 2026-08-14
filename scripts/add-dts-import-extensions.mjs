// Guards the node16 types contract (issue #167): this package is
// `"type": "module"`, so consumers on `moduleResolution: "node16"`/`"nodenext"`
// read dist/*.d.ts as ES modules, where relative import specifiers MUST carry
// an explicit extension. tsc emits declarations with the same extensionless
// specifiers we write in src (`export * from './Tab'`), which makes every
// `import ... from 'kevlar-tabs'` fail to type-check under node16 resolution
// (`InternalResolutionError` in @arethetypeswrong/cli), even though the
// runtime import works.
//
// We deliberately keep src extensionless — the alternatives were rejected:
//   - `.js` extensions in src (what Headless UI and Base UI ship): works, but
//     noisy at every import site;
//   - bundling declarations into one file (what Radix does via tsup): adds a
//     build dependency this repo doesn't otherwise need.
// Instead this script runs right after `tsc --emitDeclarationOnly` and
// rewrites relative specifiers in the emitted dist/**/*.d.ts to their
// explicit `.js` form (`./Tab` → `./Tab.js`, which node16 resolves to
// `Tab.d.ts`). Every rewritten specifier is verified against the declaration
// files actually on disk; an unresolvable specifier fails `pnpm build`.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const distDir = path.resolve(import.meta.dirname, '../dist')

function collectDtsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectDtsFiles(entryPath)
    return entry.name.endsWith('.d.ts') ? [entryPath] : []
  })
}

// Matches the specifier of static imports/exports (`from './x'`) and of
// inline type imports (`import('./x')`), single- or double-quoted.
const specifierPattern = /(\bfrom\s*|\bimport\s*\()(['"])(\.\.?\/[^'"]+)\2/g

function withExtension(specifier, containingFile) {
  if (/\.[cm]?js$/.test(specifier)) return specifier // already explicit
  const base = path.resolve(path.dirname(containingFile), specifier)
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`
  if (existsSync(path.join(base, 'index.d.ts'))) return `${specifier}/index.js`
  console.error(
    `✖ ${path.relative(process.cwd(), containingFile)}: cannot resolve '${specifier}' to a declaration file in dist.`
  )
  process.exit(1)
}

let rewritten = 0
for (const file of collectDtsFiles(distDir)) {
  const source = readFileSync(file, 'utf8')
  const output = source.replace(specifierPattern, (_, prefix, quote, specifier) => {
    const explicit = withExtension(specifier, file)
    if (explicit !== specifier) rewritten += 1
    return `${prefix}${quote}${explicit}${quote}`
  })
  if (output !== source) writeFileSync(file, output)
}

console.log(
  `✔ dist declarations use explicit extensions on relative imports (${rewritten} specifier${rewritten === 1 ? '' : 's'} rewritten).`
)
