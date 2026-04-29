import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'

function decodeCategory(value: string | undefined): string {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function CategoryPage() {
  const { t } = useTranslation()
  const { category } = useParams()
  const decodedCategory = decodeCategory(category)
  const { data, isLoading, error } = useEditorialIndex()

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  const editorialsInCategory = data.editorials.filter((editorial) =>
    editorial.categories.includes(decodedCategory),
  )
  const contests = Array.from(
    editorialsInCategory.reduce((contestMap, editorial) => {
      contestMap.set(editorial.contest, (contestMap.get(editorial.contest) ?? 0) + 1)
      return contestMap
    }, new Map<string, number>()),
  ).sort((left, right) => left[0].localeCompare(right[0]))

  return (
    <section className="page">
      <h1>{t('category.heading', { category: decodedCategory || t('category.unknown') })}</h1>
      {contests.length === 0 ? (
        <p className="muted">{t('category.empty')}</p>
      ) : (
        <ul className="card-list">
          {contests.map(([contestName, editorialCount]) => (
            <li className="card" key={contestName}>
              <Link
                className="card__title"
                to={`/categories/${encodeURIComponent(decodedCategory)}/contests/${encodeURIComponent(contestName)}`}
              >
                {contestName}
              </Link>
              <p className="card__meta">
                {t('category.editorialCount', { count: editorialCount })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
