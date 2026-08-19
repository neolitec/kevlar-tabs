interface ISite {
  title: string
  url: string
  subtitle?: string
  description?: string
  highlights?: string[]
  github?: string
  installScript?: string
  gettingStarted?: string
}

export const SITE: ISite = {
  title: 'Kevlar Tabs',
  url: 'https://neolitec.github.io/kevlar-tabs',
  subtitle: 'A simple tabs library for React.',
  description:
    'Bring your own styles — the keyboard and ARIA behaviour come for free.',
  // Facts, not adjectives: each one is checkable from the published package.
  // Keep the size in sync with a `pnpm build` at the repository root.
  highlights: [
    '0 dependencies',
    '~2.7 kB min+gzip',
    'WAI-ARIA APG',
    'React 17, 18, 19',
  ],
  github: 'https://github.com/neolitec/kevlar-tabs',
  // installScript: 'npm install kevlar-tabs',
}
