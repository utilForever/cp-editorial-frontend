import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

interface AppProvidersProps {
  children: ReactNode
}

function restoreGithubPagesPath() {
  const url = new URL(window.location.href)
  const redirectedPath = url.searchParams.get('p')
  if (!redirectedPath) {
    return
  }

  url.searchParams.delete('p')
  const normalizedPath = redirectedPath.startsWith('/') ? redirectedPath : `/${redirectedPath}`
  const remainingQuery = url.searchParams.toString()
  const nextUrl = `${normalizedPath}${remainingQuery ? `?${remainingQuery}` : ''}${url.hash}`
  window.history.replaceState(null, '', nextUrl)
}

export function AppProviders({ children }: AppProvidersProps) {
  restoreGithubPagesPath()
  return <BrowserRouter>{children}</BrowserRouter>
}
