import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

function decodePathParam(value: string | undefined): string {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function CategoryContestPage() {
  const { t, i18n } = useTranslation()
  const { category, contest } = useParams()
  const decodedCategory = decodePathParam(category)
  const decodedContest = decodePathParam(contest)
  const { data, isLoading, error } = useEditorialIndex()

  const editorials = useMemo(
    () =>
      data.editorials
        .filter(
          (editorial) =>
            editorial.categories.includes(decodedCategory) && editorial.contest === decodedContest,
        )
        .sort((left, right) => left.filename.localeCompare(right.filename)),
    [data.editorials, decodedCategory, decodedContest],
  )

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  return (
    <section className="page">
      <h1>{t('contest.heading', { contest: decodedContest || t('contest.unknown') })}</h1>
      <p className="page__description">
        {t('contest.category', { category: decodedCategory || t('category.unknown') })}
      </p>

      {editorials.length === 0 ? (
        <p className="muted">{t('contest.empty')}</p>
      ) : (
        <>
          <p className="muted">{t('contest.editorialCount', { count: editorials.length })}</p>
          <ul className="card-list">
            {editorials.map((editorial) => {
              const links = buildEditorialLinks(editorial.path)
              const localizedTitle = getLocalizedText(editorial.title, i18n.resolvedLanguage)

              return (
                <li className="card" key={editorial.id}>
                  <Link className="card__title" to={`/editorials/${editorial.id}`}>
                    {localizedTitle}
                  </Link>
                  <p className="card__meta">{editorial.filename}</p>
                  <p className="card__meta">{editorial.path}</p>
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
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
