import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { EditorialRecord } from '../entities/editorial/model/types'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { usePageMetadata } from '../shared/hooks/usePageMetadata'

interface CategorySummary {
  category: string
  editorialCount: number
  childPathCount: number
  childPathExamples: string[]
  contestExamples: string[]
}

function addUniqueValue(values: string[], value: string, limit: number): void {
  if (values.includes(value) || values.length >= limit) {
    return
  }

  values.push(value)
}

function summarizeCategories(
  editorials: EditorialRecord[],
  uncategorizedLabel: string,
): CategorySummary[] {
  const summaries = new Map<
    string,
    {
      editorialCount: number
      childPaths: Set<string>
      childPathExamples: string[]
      contestExamples: string[]
    }
  >()

  editorials.forEach((editorial) => {
    const category = editorial.categories[0] ?? uncategorizedLabel
    const currentSummary = summaries.get(category) ?? {
      editorialCount: 0,
      childPaths: new Set<string>(),
      childPathExamples: [],
      contestExamples: [],
    }

    currentSummary.editorialCount += 1

    if (editorial.categories.length > 1) {
      const childPath = editorial.categories.slice(0, 3).join(' > ')
      currentSummary.childPaths.add(childPath)
      addUniqueValue(currentSummary.childPathExamples, childPath, 3)
    }

    addUniqueValue(currentSummary.contestExamples, editorial.contest, 3)
    summaries.set(category, currentSummary)
  })

  return Array.from(summaries.entries())
    .map(([category, summary]) => ({
      category,
      editorialCount: summary.editorialCount,
      childPathCount: summary.childPaths.size,
      childPathExamples: summary.childPathExamples,
      contestExamples: summary.contestExamples,
    }))
    .sort((left, right) => left.category.localeCompare(right.category))
}

export function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading, error } = useEditorialIndex()
  const uncategorizedLabel = t('categories.uncategorized')
  const categories = useMemo(
    () => summarizeCategories(data.editorials, uncategorizedLabel),
    [data.editorials, uncategorizedLabel],
  )

  usePageMetadata({
    title: `${t('categories.heading')} | ${t('appTitle')}`,
    description: t('footer.description'),
    locale: i18n.resolvedLanguage,
  })

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  return (
    <section className="page">
      <div className="page__header">
        <h1>{t('categories.heading')}</h1>
        <p className="page__description">{t('categories.description')}</p>
      </div>
      {categories.length === 0 ? (
        <p className="muted">{t('categories.empty')}</p>
      ) : (
        <ul className="card-list">
          {categories.map((summary) => (
            <li className="card category-card" key={summary.category}>
              <div className="category-card__top">
                <Link
                  className="card__title"
                  to={`/categories/${encodeURIComponent(summary.category)}`}
                >
                  {summary.category}
                </Link>
                <p className="category-card__count">
                  {t('categories.count', { count: summary.editorialCount })}
                </p>
              </div>

              <p className="card__meta">
                {summary.childPathCount > 0
                  ? t('categories.summary.withPaths', { count: summary.childPathCount })
                  : t('categories.summary.direct')}
              </p>

              {summary.childPathExamples.length > 0 && (
                <div className="category-card__section">
                  <p className="category-card__label">{t('categories.pathExamples')}</p>
                  <ul className="category-card__chips">
                    {summary.childPathExamples.map((path) => (
                      <li className="category-card__chip" key={path}>
                        {path}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.contestExamples.length > 0 && (
                <div className="category-card__section">
                  <p className="category-card__label">{t('categories.contestExamples')}</p>
                  <p className="card__meta">{summary.contestExamples.join(' · ')}</p>
                </div>
              )}

              <div className="action-links">
                <Link
                  className="action-link"
                  to={`/categories/${encodeURIComponent(summary.category)}`}
                >
                  {t('categories.browse')}
                </Link>
                <Link
                  className="action-link action-link--secondary"
                  to={`/search?category=${encodeURIComponent(summary.category)}`}
                >
                  {t('categories.search')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
