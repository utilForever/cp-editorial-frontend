import { useTranslation } from 'react-i18next'

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
]
const SUPPORTED_LANGUAGE_CODES = new Set(SUPPORTED_LANGUAGES.map((language) => language.code))
const DEFAULT_LANGUAGE = 'en'

function normalizeLanguage(language: string | undefined) {
  if (!language) {
    return DEFAULT_LANGUAGE
  }

  return language.toLowerCase().split(/[-_]/)[0] ?? DEFAULT_LANGUAGE
}

export function LanguageSelector() {
  const { t, i18n } = useTranslation()
  const normalizedLanguage = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language)
  const currentLanguage = SUPPORTED_LANGUAGE_CODES.has(normalizedLanguage)
    ? normalizedLanguage
    : DEFAULT_LANGUAGE

  return (
    <label className="muted" htmlFor="language-selector">
      {t('language.label')}{' '}
      <select
        className="language-selector"
        id="language-selector"
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value)
        }}
        value={currentLanguage}
      >
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
