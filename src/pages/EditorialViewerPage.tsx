import { PageState } from '../shared/ui/PageState'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { buildCategoryRoute, getDirectorySegments } from '../shared/api/categoryRoutes'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { usePageMetadata } from '../shared/hooks/usePageMetadata'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

export function EditorialViewerPage() {
  const { t, i18n } = useTranslation()
  const { editorialId } = useParams()
  const { data, isLoading, error } = useEditorialIndex()
  const [attempt, setAttempt] = useState(0)
  const [pdfResult, setPdfResult] = useState<{
    path: string
    attempt: number
    url?: string
    error?: 'timeout' | 'load'
  } | null>(null)

  const editorial = useMemo(
    () => data.editorials.find((item) => item.id === editorialId),
    [data.editorials, editorialId],
  )
  const isPdf = editorial?.path.toLowerCase().endsWith('.pdf') ?? false
  const currentPdf =
    pdfResult?.path === editorial?.path && pdfResult?.attempt === attempt ? pdfResult : null
  const pdfUrl = currentPdf?.url
  const pdfError = currentPdf?.error
  const viewerDescription = t(
    isPdf ? 'editorial.viewerDescription' : 'editorial.viewerSourceDescription',
  )

  const appTitle = t('appTitle')
  const localizedTitle = editorial
    ? getLocalizedText(editorial.title, i18n.resolvedLanguage)
    : appTitle
  const metadataDescription = editorial
    ? getLocalizedText(editorial.summary, i18n.resolvedLanguage)
    : viewerDescription

  usePageMetadata({
    title: editorial
      ? `${localizedTitle} (${t('editorial.view')}) | ${appTitle}`
      : `${t('editorial.view')} | ${appTitle}`,
    description: metadataDescription,
    locale: i18n.resolvedLanguage,
    type: editorial ? 'article' : 'website',
  })

  useEffect(() => {
    setPdfResult(null)
    if (!editorial || !isPdf) {
      return
    }

    const links = buildEditorialLinks(editorial.path)
    const request = { path: editorial.path, attempt }
    let objectUrl: string | null = null
    const abortController = new AbortController()
    const timeoutId = globalThis.setTimeout(() => {
      setPdfResult({ ...request, error: 'timeout' })
      abortController.abort()
    }, 15000)

    void fetch(links.downloadUrl, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load PDF. Status: ${response.status}`)
        }

        const bytes = await response.arrayBuffer()
        if (abortController.signal.aborted) {
          return
        }

        const pdfBlob = new Blob([bytes], { type: 'application/pdf' })
        objectUrl = URL.createObjectURL(pdfBlob)
        setPdfResult({ ...request, url: objectUrl })
      })
      .catch(() => {
        if (abortController.signal.aborted) {
          return
        }

        setPdfResult({ ...request, error: 'load' })
      })
      .finally(() => {
        globalThis.clearTimeout(timeoutId)
      })

    return () => {
      abortController.abort()
      globalThis.clearTimeout(timeoutId)
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [editorial, isPdf, attempt])

  if (isLoading) {
    return <PageState loading title={t('common.loading')} />
  }

  if (error) {
    return <PageState error={error} title={t('common.loadError')} />
  }

  if (!editorial) {
    return <PageState title={t('editorial.notFound')} />
  }

  const links = buildEditorialLinks(editorial.path)
  const detailRoute = `/editorials/${editorial.id}`
  const directorySegments = getDirectorySegments(editorial.path)
  const contestRoute = buildCategoryRoute(directorySegments)
  const categoryLinks = editorial.categories.map((category, index) => ({
    label: category,
    route: buildCategoryRoute(editorial.categories.slice(0, index + 1)),
  }))
  const categoryLabel = editorial.categories.length > 0 ? editorial.categories.join(' > ') : '-'

  return (
    <article className="page viewer-page">
      <h1>{localizedTitle}</h1>
      <p className="page__description">{viewerDescription}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">{t('editorial.contest')}</p>
          <Link className="stat-card__value stat-card__link" to={contestRoute}>
            {editorial.contest}
          </Link>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">{t('editorial.category')}</p>
          <p className="stat-card__value">{categoryLabel}</p>
        </div>
      </div>

      <div className="action-links">
        <Link className="action-link action-link--secondary" to={detailRoute}>
          {t('editorial.backToDetail')}
        </Link>
        <Link className="action-link action-link--secondary" to={contestRoute}>
          {t('editorial.browseContest')}
        </Link>
        {!isPdf && (
          <a className="action-link" href={links.downloadUrl} rel="noreferrer" target="_blank">
            {t('editorial.openSource')}
          </a>
        )}
        <a
          aria-label={t('editorial.downloadAria', { title: localizedTitle })}
          className="action-link action-link--secondary"
          href={links.downloadUrl}
          rel="noreferrer"
          target="_blank"
        >
          {t('editorial.download')}
        </a>
      </div>

      {categoryLinks.length > 0 && (
        <nav aria-label={t('editorial.categoryNavigation')} className="tag-list">
          {categoryLinks.map((category) => (
            <Link className="tag tag--link" key={category.route} to={category.route}>
              {category.label}
            </Link>
          ))}
        </nav>
      )}

      {isPdf && pdfError && (
        <section aria-label={t('editorial.viewerFailureActions')} className="viewer-fallback">
          <p className="error" role="alert">
            {t(pdfError === 'timeout' ? 'editorial.viewerTimeout' : 'editorial.viewerLoadFailed')}
          </p>
          <p className="muted">
            {t(
              pdfError === 'timeout'
                ? 'editorial.viewerTimeoutDescription'
                : 'editorial.viewerFailureDescription',
            )}
          </p>
          <div className="action-links">
            <button
              className="action-link"
              onClick={() => setAttempt((value) => value + 1)}
              type="button"
            >
              {t('editorial.retry')}
            </button>
            <a
              aria-label={t('editorial.downloadAria', { title: localizedTitle })}
              className="action-link"
              href={links.downloadUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t('editorial.download')}
            </a>
            <Link className="action-link action-link--secondary" to={detailRoute}>
              {t('editorial.backToDetail')}
            </Link>
          </div>
        </section>
      )}
      {isPdf && !pdfError && !pdfUrl && (
        <p className="page-state" role="status">
          {t('editorial.viewerLoading')}
        </p>
      )}

      {isPdf && pdfUrl && (
        <object
          aria-label={t('editorial.viewAria', { title: localizedTitle })}
          className="editorial-viewer"
          data={pdfUrl}
          type="application/pdf"
        >
          <p className="muted">
            {t('editorial.viewerFallback')}{' '}
            <a
              className="action-link action-link--secondary"
              href={links.downloadUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t('editorial.download')}
            </a>{' '}
            <Link className="action-link action-link--secondary" to={detailRoute}>
              {t('editorial.backToDetail')}
            </Link>
          </p>
        </object>
      )}

      <details className="source-metadata">
        <summary>{t('editorial.sourceMetadata')}</summary>
        <dl className="source-metadata__list">
          <div className="source-metadata__row">
            <dt>{t('editorial.path')}</dt>
            <dd>{editorial.path}</dd>
          </div>
          <div className="source-metadata__row">
            <dt>{t('editorial.filename')}</dt>
            <dd>{editorial.filename}</dd>
          </div>
        </dl>
      </details>
    </article>
  )
}
