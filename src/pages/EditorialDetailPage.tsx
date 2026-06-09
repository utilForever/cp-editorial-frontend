import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import type { EditorialRecord } from '../entities/editorial/model/types'
import { buildCategoryRoute, getDirectorySegments } from '../shared/api/categoryRoutes'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { buildEditorialPreviewImagePath, usePageMetadata } from '../shared/hooks/usePageMetadata'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

function getRelatedEditorials(
  editorials: EditorialRecord[],
  editorial: EditorialRecord | undefined,
): EditorialRecord[] {
  if (!editorial) {
    return []
  }

  const currentCategories = new Set(editorial.categories)

  return editorials
    .filter(
      (candidate) =>
        candidate.id !== editorial.id &&
        (candidate.contest === editorial.contest ||
          candidate.categories.some((category) => currentCategories.has(category))),
    )
    .sort((left, right) => {
      const leftContestRank = left.contest === editorial.contest ? 0 : 1
      const rightContestRank = right.contest === editorial.contest ? 0 : 1

      return (
        leftContestRank - rightContestRank ||
        left.contest.localeCompare(right.contest) ||
        left.filename.localeCompare(right.filename)
      )
    })
    .slice(0, 6)
}

export function EditorialDetailPage() {
  const { t, i18n } = useTranslation()
  const { editorialId } = useParams()
  const { data, isLoading, error } = useEditorialIndex()

  const editorial = useMemo(
    () => data.editorials.find((item) => item.id === editorialId),
    [data.editorials, editorialId],
  )
  const relatedEditorials = useMemo(
    () => getRelatedEditorials(data.editorials, editorial),
    [data.editorials, editorial],
  )

  const appTitle = t('appTitle')
  const localizedTitle = editorial
    ? getLocalizedText(editorial.title, i18n.resolvedLanguage)
    : appTitle
  const metadataDescription = editorial
    ? getLocalizedText(editorial.summary, i18n.resolvedLanguage)
    : t('editorial.notFound')
  const editorialImageUrl = editorial ? buildEditorialPreviewImagePath(editorial.id) : undefined

  usePageMetadata({
    title: editorial ? `${localizedTitle} | ${appTitle}` : appTitle,
    description: metadataDescription,
    imageUrl: editorialImageUrl,
    imageAlt: editorial ? `${localizedTitle} preview image` : undefined,
    locale: i18n.resolvedLanguage,
    type: editorial ? 'article' : 'website',
  })

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  if (!editorial) {
    return <p className="error">{t('editorial.notFound')}</p>
  }

  const links = buildEditorialLinks(editorial.path)
  const directorySegments = getDirectorySegments(editorial.path)
  const contestRoute = buildCategoryRoute(directorySegments)
  const categoryLinks = editorial.categories.map((category, index) => ({
    label: category,
    route: buildCategoryRoute(editorial.categories.slice(0, index + 1)),
  }))
  const categoryLabel = editorial.categories.length > 0 ? editorial.categories.join(' > ') : '-'

  return (
    <article className="page">
      <h1>{localizedTitle}</h1>
      <p className="page__description">
        {getLocalizedText(editorial.summary, i18n.resolvedLanguage)}
      </p>

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
        <Link className="action-link action-link--secondary" to={contestRoute}>
          {t('editorial.browseContest')}
        </Link>
        <Link
          aria-label={t('editorial.viewAria', { title: localizedTitle })}
          className="action-link"
          rel="noreferrer"
          target="_blank"
          to={`/editorials/${editorial.id}/view`}
        >
          {t('editorial.view')}
        </Link>
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

      {relatedEditorials.length > 0 && (
        <section className="related-editorials" aria-labelledby="related-editorials-heading">
          <h2 id="related-editorials-heading">{t('editorial.related.heading')}</h2>
          <ul className="card-list">
            {relatedEditorials.map((relatedEditorial) => {
              const relatedTitle = getLocalizedText(relatedEditorial.title, i18n.resolvedLanguage)

              return (
                <li className="card" key={relatedEditorial.id}>
                  <Link className="card__title" to={`/editorials/${relatedEditorial.id}`}>
                    {relatedTitle}
                  </Link>
                  <p className="card__meta">
                    {`${relatedEditorial.contest} · ${relatedEditorial.categories.join(' > ')}`}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
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
