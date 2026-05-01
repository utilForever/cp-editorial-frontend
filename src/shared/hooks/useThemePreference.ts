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
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function isStorageUnavailableError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'SecurityError' || error.name === 'QuotaExceededError')
  )
}

function getStoredTheme(): Theme | null {
  try {
    return toTheme(globalThis.localStorage.getItem(THEME_STORAGE_KEY))
  } catch (error) {
    if (isStorageUnavailableError(error)) {
      return null
    }

    throw error
  }
}

function persistTheme(theme: Theme) {
  try {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch (error) {
    if (isStorageUnavailableError(error)) {
      return
    }

    throw error
  }
}

function getInitialTheme(): Theme {
  const savedTheme = getStoredTheme()
  if (savedTheme) {
    return savedTheme
  }

  return getSystemTheme()
}

function applyThemeToDocument(theme: Theme) {
  globalThis.document.documentElement.dataset.theme = theme
  globalThis.document.documentElement.style.colorScheme = theme
}

export function useThemePreference() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())

  useEffect(() => {
    applyThemeToDocument(theme)
    persistTheme(theme)
  }, [theme])

  return { theme, setTheme }
}
