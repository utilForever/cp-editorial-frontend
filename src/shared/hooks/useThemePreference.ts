import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'cp-editorial-theme'

function toTheme(value: string | null): Theme | null {
  if (value === 'light' || value === 'dark') {
    return value
  }

  return null
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): Theme {
  const savedTheme = toTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  if (savedTheme) {
    return savedTheme
  }

  return getSystemTheme()
}

function applyThemeToDocument(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function useThemePreference() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  useEffect(() => {
    applyThemeToDocument(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  return { theme, setTheme }
}
