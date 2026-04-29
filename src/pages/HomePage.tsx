import { Trans, useTranslation } from 'react-i18next'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'

export function HomePage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useEditorialIndex()

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  const contestCount = new Set(data.editorials.map((editorial) => editorial.contest)).size

  return (
    <section className="page">
      <h1>{t('home.heading')}</h1>
      <p className="page__description">{t('home.description')}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">{t('home.stats.editorials')}</p>
          <p className="stat-card__value">{data.editorials.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">{t('home.stats.contests')}</p>
          <p className="stat-card__value">{contestCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">{t('home.stats.indexVersion')}</p>
          <p className="stat-card__value">{data.version}</p>
        </div>
      </div>

      <article className="card home-article">
        <h2 className="card__title">{t('home.article.heading')}</h2>
        <p className="card__meta">{t('home.article.body1')}</p>
        <p className="card__meta">
          <Trans
            components={{
              repo: (
                <a
                  href="https://github.com/utilForever/cp-editorial-data"
                  rel="noreferrer"
                  target="_blank"
                />
              ),
            }}
            i18nKey="home.article.body2"
          />
        </p>
        <ul className="home-article__list">
          <li>{t('home.article.point1')}</li>
          <li>{t('home.article.point2')}</li>
          <li>{t('home.article.point3')}</li>
        </ul>
      </article>
    </section>
  )
}
