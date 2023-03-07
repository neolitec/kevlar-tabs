interface ISite {
  title: string
  url: string
  subtitle?: string
  description?: string
  github?: string
  installScript?: string
  gettingStarted?: string
}

export const SITE: ISite = {
  title: 'Kevlar Tabs',
  url: 'https://neolitec.github.io/kevlar-tabs',
  subtitle: 'A simple tabs library for React.',
  description: '100% customizable, accessible and built with Typescript.',
  github: 'https://github.com/neolitec/kevlar-tabs',
  // installScript: 'npm install kevlar-tabs',
}
