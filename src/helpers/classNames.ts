type ClassValue = string | null | undefined | Record<string, boolean | undefined>

export function classNames(...values: ClassValue[]): string {
  const classes: string[] = []
  for (const value of values) {
    if (!value) {
      continue
    }
    if (typeof value === 'string') {
      classes.push(value)
    } else {
      classes.push(...Object.keys(value).filter((key) => value[key]))
    }
  }
  return classes.join(' ')
}
