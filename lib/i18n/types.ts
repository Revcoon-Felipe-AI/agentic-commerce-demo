export type Locale = 'en' | 'pt'

export const LOCALES: readonly Locale[] = ['en', 'pt'] as const

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
