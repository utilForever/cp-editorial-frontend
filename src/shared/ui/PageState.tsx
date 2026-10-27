import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

interface PageStateProps {
  readonly title: string
  readonly error?: Error
  readonly loading?: boolean
}

export function PageState({ title, error, loading = false }: PageStateProps) {
  const { t } = useTranslation()

  return (
    <section className="page-state">
      <div role={error ? 'alert' : 'status'}>
        <h1 className="page-state__title">{title}</h1>
      </div>
      {error && <p className="error">{error.message}</p>}
      {!loading && (
        <>
          <p className="muted">{t(error ? 'common.loadErrorHelp' : 'common.emptyHelp')}</p>
          <div className="action-links">
            {error && (
              <button className="action-link" onClick={() => location.reload()} type="button">
                {t('common.reload')}
              </button>
            )}
            <Link className="action-link action-link--secondary" to="/search">
              {t('nav.search')}
            </Link>
            <Link className="action-link action-link--secondary" to="/categories">
              {t('nav.categories')}
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
