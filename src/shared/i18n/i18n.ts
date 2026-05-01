import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources'

const DEFAULT_LANGUAGE = 'en'
const LANGUAGE_STORAGE_KEY = 'cp-editorial-language'
const SUPPORTED_LANGUAGE_CODES = ['en', 'ko', 'ja'] as const
const SUPPORTED_LANGUAGE_SET = new Set<string>(SUPPORTED_LANGUAGE_CODES)

type SupportedLanguage = (typeof SUPPORTED_LANGUAGE_CODES)[number]

function normalizeLanguage(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }

  return value.toLowerCase().split(/[-_]/)[0] ?? null
}

function toSupportedLanguage(value: string | null | undefined): SupportedLanguage | null {
  const normalized = normalizeLanguage(value)
  if (!normalized || !SUPPORTED_LANGUAGE_SET.has(normalized)) {
    return null
  }

  return normalized as SupportedLanguage
}

function resolveInitialLanguage() {
  return toSupportedLanguage(globalThis.localStorage.getItem(LANGUAGE_STORAGE_KEY)) ?? DEFAULT_LANGUAGE
}

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language
}

function syncLanguagePreference(language: string) {
  const supportedLanguage = toSupportedLanguage(language)
  if (!supportedLanguage) {
    return
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, supportedLanguage)
}

function handleLanguageChange(language: string) {
  syncDocumentLanguage(language)
  syncLanguagePreference(language)
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    handleLanguageChange(i18n.resolvedLanguage ?? i18n.language)
  })

i18n.on('languageChanged', handleLanguageChange)
