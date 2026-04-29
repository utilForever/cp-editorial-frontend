import type { LocalizedContent } from '../../entities/editorial/model/types'

const FALLBACK_LOCALES = ['en', 'ko', 'ja']

export function getLocalizedText(
  content: LocalizedContent,
  preferredLocale: string | undefined,
): string {
  if (preferredLocale && content[preferredLocale]) {
    return content[preferredLocale]
  }

  const fallback = FALLBACK_LOCALES.find((locale) => content[locale])
  if (fallback) {
    return content[fallback]
  }

  const firstAvailable = Object.values(content).find((value) => value.trim().length > 0)
  return firstAvailable ?? ''
}
