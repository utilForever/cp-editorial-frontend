import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

export function EditorialDetailPage() {
  const { t, i18n } = useTranslation()
  const { editorialId } = useParams()
  const { data, isLoading, error } = useEditorialIndex()

  const editorial = useMemo(
    () => data.editorials.find((item) => item.id === editorialId),
    [data.editorials, editorialId],
  )

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
  const localizedTitle = getLocalizedText(editorial.title, i18n.resolvedLanguage)
  const categoryLabel = editorial.categories.length > 0 ? editorial.categories.join(', ') : '-'

  return (
    <article className="page">
      <h1>{localizedTitle}</h1>
      <p className="page__description">
        {getLocalizedText(editorial.summary, i18n.resolvedLanguage)}
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-card__label">{t('editorial.contest')}</p>
          <p className="stat-card__value">{editorial.contest}</p>
        </div>
        <div className="stat-card">
          <p className="stat-card__label">{t('editorial.category')}</p>
          <p className="stat-card__value">{categoryLabel}</p>
        </div>
      </div>

      <p className="muted">{`${t('editorial.path')}: ${editorial.path}`}</p>
      <p className="muted">{`${t('editorial.filename')}: ${editorial.filename}`}</p>
      <div className="action-links">
        <a
          aria-label={t('editorial.viewAria', { title: localizedTitle })}
          className="action-link"
          href={links.viewUrl}
          rel="noreferrer"
          target="_blank"
        >
          {t('editorial.view')}
        </a>
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

      <div className="tag-list">
        {editorial.categories.map((category) => (
          <span className="tag" key={category}>
            {category}
          </span>
        ))}
      </div>
    </article>
  )
}
