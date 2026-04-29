import { useTranslation } from 'react-i18next'

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
]

export function LanguageSelector() {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage ?? 'en'

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
