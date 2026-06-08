import { type FormEvent, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { usePageMetadata } from '../shared/hooks/usePageMetadata'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, error } = useEditorialIndex()
  const [query, setQuery] = useState('')

  usePageMetadata({
    title: t('appTitle'),
    description: t('home.description'),
    locale: i18n.resolvedLanguage,
  })

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedQuery = query.trim()
    void navigate(normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : '/search')
  }

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  const contestCount = new Set(data.editorials.map((editorial) => editorial.contest)).size

  return (
    <section className="page home-page">
      <div className="home-dashboard">
        <div className="home-dashboard__intro">
          <h1>{t('home.heading')}</h1>
          <p className="page__description">{t('home.description')}</p>

          <div className="home-entry">
            <form className="home-entry__search" onSubmit={handleSearchSubmit}>
              <label className="home-entry__label" htmlFor="home-search-input">
                {t('home.entry.label')}
              </label>
              <div className="home-entry__controls">
                <input
                  className="input home-entry__input"
                  id="home-search-input"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('home.entry.placeholder')}
                  value={query}
                />
                <button className="home-entry__button" type="submit">
                  {t('home.entry.submit')}
                </button>
              </div>
            </form>
            <Link className="home-entry__link" to="/categories">
              {t('home.entry.browseCategories')}
            </Link>
          </div>
        </div>

        <div className="home-hero-icon-wrap">
          <img
            alt={t('appTitle')}
            className="home-icon"
            decoding="async"
            src="/home-icon.png?v=8eac82ad"
          />
        </div>

        <div className="stats-grid home-dashboard__stats">
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
