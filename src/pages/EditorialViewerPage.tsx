import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

export function EditorialViewerPage() {
  const { t, i18n } = useTranslation()
  const { editorialId } = useParams()
  const { data, isLoading, error } = useEditorialIndex()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfError, setPdfError] = useState<Error | null>(null)

  const editorial = useMemo(
    () => data.editorials.find((item) => item.id === editorialId),
    [data.editorials, editorialId],
  )

  useEffect(() => {
    if (!editorial) {
      setPdfUrl(null)
      setPdfError(null)
      return
    }

    const links = buildEditorialLinks(editorial.path)
    let isMounted = true
    let objectUrl: string | null = null
    const abortController = new AbortController()
    let didTimeout = false
    const timeoutId = window.setTimeout(() => {
      didTimeout = true
      abortController.abort()
    }, 15000)

    setPdfUrl(null)
    setPdfError(null)

    void fetch(links.downloadUrl, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load PDF. Status: ${response.status}`)
        }

        const bytes = await response.arrayBuffer()
        const pdfBlob = new Blob([bytes], { type: 'application/pdf' })
        objectUrl = URL.createObjectURL(pdfBlob)

        if (!isMounted) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        setPdfUrl(objectUrl)
      })
      .catch((fetchError: unknown) => {
        if (!isMounted) {
          return
        }

        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          if (didTimeout) {
            setPdfError(new Error('Timed out while loading editorial PDF.'))
          }
          return
        }

        const nextError =
          fetchError instanceof Error
            ? fetchError
            : new Error('Unknown error while loading editorial PDF.')

        setPdfError(nextError)
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
      })

    return () => {
      isMounted = false
      abortController.abort()
      window.clearTimeout(timeoutId)
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [editorial])

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  if (!editorial) {
    return <p className="error">{t('editorial.notFound')}</p>
  }

  const localizedTitle = getLocalizedText(editorial.title, i18n.resolvedLanguage)
  const links = buildEditorialLinks(editorial.path)

  return (
    <article className="page">
      <h1>{localizedTitle}</h1>
      <p className="page__description">{t('editorial.viewerDescription')}</p>
      <p className="muted">{`${t('editorial.path')}: ${editorial.path}`}</p>
      <div className="action-links">
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

      {pdfError && <p className="error">{t('editorial.viewerLoadFailed')}</p>}
      {!pdfError && !pdfUrl && <p className="muted">{t('editorial.viewerLoading')}</p>}

      {pdfUrl && (
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
            </a>
          </p>
        </object>
      )}
    </article>
  )
}
