import { useTranslation } from 'react-i18next'
import type { Theme } from '../hooks/useThemePreference'

interface ThemeSelectorProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="theme-toggle__icon"
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="theme-toggle__icon"
      fill="currentColor"
      role="img"
      viewBox="0 0 24 24"
    >
      <path d="M21 14.5A9 9 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5Z" />
    </svg>
  )
}

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  const { t } = useTranslation()
  const nextTheme: Theme = theme === 'light' ? 'dark' : 'light'
  const toggleLabel = theme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')

  return (
    <button
      aria-label={toggleLabel}
      aria-pressed={theme === 'dark'}
      className="theme-toggle"
      onClick={() => onThemeChange(nextTheme)}
      title={toggleLabel}
      type="button"
    >
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
