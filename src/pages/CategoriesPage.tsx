import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'

function categoriesWithCount(categories: string[]) {
  const countMap = new Map<string, number>()

  categories.forEach((category) => {
    countMap.set(category, (countMap.get(category) ?? 0) + 1)
  })

  return Array.from(countMap.entries()).sort((left, right) => left[0].localeCompare(right[0]))
}

export function CategoriesPage() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useEditorialIndex()

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  const categories = categoriesWithCount(
    data.editorials.flatMap((editorial) => editorial.categories),
  )

  return (
    <section className="page">
      <h1>{t('categories.heading')}</h1>
      {categories.length === 0 ? (
        <p className="muted">{t('categories.empty')}</p>
      ) : (
        <ul className="card-list">
          {categories.map(([category, count]) => (
            <li className="card" key={category}>
              <Link className="card__title" to={`/categories/${encodeURIComponent(category)}`}>
                {category}
              </Link>
              <p className="card__meta">{t('categories.count', { count })}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
