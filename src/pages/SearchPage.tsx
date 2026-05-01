import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { EditorialRecord } from '../entities/editorial/model/types'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

interface ContestResult {
  category: string
  contest: string
  editorials: EditorialRecord[]
}

function matchesEditorialKeywords(
  editorial: EditorialRecord,
  query: string,
  language: string | undefined,
): boolean {
  const text = [
    editorial.contest,
    editorial.categories.join(' '),
    editorial.filename,
    editorial.path,
    getLocalizedText(editorial.title, language),
    getLocalizedText(editorial.summary, language),
  ]
    .join(' ')
    .toLowerCase()

  return text.includes(query.toLowerCase())
}

function groupByContest(editorials: EditorialRecord[]): ContestResult[] {
  const groups = new Map<string, ContestResult>()

  editorials.forEach((editorial) => {
    const category = editorial.categories[0] ?? 'Uncategorized'
    const groupKey = `${category}::${editorial.contest}`
    const currentGroup = groups.get(groupKey)
    if (!currentGroup) {
      groups.set(groupKey, {
        category,
        contest: editorial.contest,
        editorials: [editorial],
      })
      return
    }

    currentGroup.editorials.push(editorial)
  })

  return Array.from(groups.values())
    .sort(
      (left, right) =>
        left.category.localeCompare(right.category) || left.contest.localeCompare(right.contest),
    )
    .map((group) => ({
      ...group,
      editorials: group.editorials.sort((left, right) =>
        left.filename.localeCompare(right.filename),
      ),
    }))
}

function filterContestResults(
  contestResults: ContestResult[],
  query: string,
  language: string | undefined,
): ContestResult[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery.length === 0) {
    return contestResults
  }

  return contestResults
    .map((result) => ({
      ...result,
      editorials: result.editorials.filter((editorial) =>
        matchesEditorialKeywords(editorial, normalizedQuery, language),
      ),
    }))
    .filter((result) => result.editorials.length > 0)
}

export function SearchPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading, error } = useEditorialIndex()
  const [query, setQuery] = useState('')

  const contestResults = useMemo(() => {
    const grouped = groupByContest(data.editorials)
    return filterContestResults(grouped, query, i18n.resolvedLanguage)
  }, [data.editorials, i18n.resolvedLanguage, query])

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  return (
    <section className="page">
      <h1>{t('search.heading')}</h1>
      <p className="page__description">{t('search.description')}</p>
      <div className="toolbar">
        <label className="muted" htmlFor="search-input">
          {t('search.label')}
        </label>
        <input
          className="input"
          id="search-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('search.placeholder')}
          value={query}
        />
      </div>
      <p className="muted">{t('search.contestCount', { count: contestResults.length })}</p>

      {contestResults.length === 0 ? (
        <p className="muted">{t('search.empty')}</p>
      ) : (
        <ul className="card-list">
          {contestResults.map((result) => (
            <li className="card" key={`${result.category}::${result.contest}`}>
              <p className="card__meta">{result.category}</p>
              <h2 className="card__title">{result.contest}</h2>
              <p className="card__meta">
                {t('search.editorialCount', { count: result.editorials.length })}
              </p>

              <ul className="competition-editorials">
                {result.editorials.map((editorial) => {
                  const links = buildEditorialLinks(editorial.path)
                  const localizedTitle = getLocalizedText(editorial.title, i18n.resolvedLanguage)

                  return (
                    <li className="competition-editorials__item" key={editorial.id}>
                      <div className="competition-editorials__main">
                        <Link
                          className="competition-editorials__title"
                          to={`/editorials/${editorial.id}`}
                        >
                          {localizedTitle}
                        </Link>
                        <p className="card__meta">{editorial.path}</p>
                      </div>
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
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
