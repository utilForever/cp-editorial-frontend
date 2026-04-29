import type { LocalizedContent } from '../../entities/editorial/model/types'

const FALLBACK_LOCALES = ['en', 'ko', 'ja']

export function getLocalizedText(
  content: LocalizedContent,
  preferredLocale: string | undefined,
): string {
  const preferredText = preferredLocale ? content[preferredLocale]?.trim() : undefined
  if (preferredText) {
    return preferredText
  }

  const fallback = FALLBACK_LOCALES.find((locale) => {
    const value = content[locale]
    return typeof value === 'string' && value.trim().length > 0
  })
  if (fallback) {
    return content[fallback].trim()
  }

  const firstAvailable = Object.values(content)
    .map((value) => value.trim())
    .find((value) => value.length > 0)
  return firstAvailable ?? ''
}
