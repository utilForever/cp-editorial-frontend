import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import type { EditorialRecord } from '../entities/editorial/model/types'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { usePageMetadata } from '../shared/hooks/usePageMetadata'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

interface ContestResult {
  category: string
  contest: string
  editorials: EditorialRecord[]
}

interface CategorySummary {
  category: string
  contestCount: number
  editorialCount: number
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

function summarizeByCategory(contestResults: ContestResult[]): CategorySummary[] {
  const summaries = new Map<string, CategorySummary>()

  contestResults.forEach((result) => {
    const currentSummary = summaries.get(result.category)
    if (!currentSummary) {
      summaries.set(result.category, {
        category: result.category,
        contestCount: 1,
        editorialCount: result.editorials.length,
      })
      return
    }

    currentSummary.contestCount += 1
    currentSummary.editorialCount += result.editorials.length
  })

  return Array.from(summaries.values()).sort((left, right) =>
    left.category.localeCompare(right.category),
  )
}

function filterContestResults(
  contestResults: ContestResult[],
  query: string,
  language: string | undefined,
): ContestResult[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery.length === 0) {
    return []
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
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)
  const normalizedQuery = query.trim()
  const isEmptySearch = normalizedQuery.length === 0

  usePageMetadata({
    title: `${t('search.heading')} | ${t('appTitle')}`,
    description: t('search.description'),
    locale: i18n.resolvedLanguage,
  })

  const allContestResults = useMemo(() => groupByContest(data.editorials), [data.editorials])

  const contestResults = useMemo(
    () => filterContestResults(allContestResults, query, i18n.resolvedLanguage),
    [allContestResults, i18n.resolvedLanguage, query],
  )

  const categorySummaries = useMemo(
    () => summarizeByCategory(allContestResults),
    [allContestResults],
  )

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  let resultsContent: ReactNode
  if (isEmptySearch) {
    resultsContent = (
      <div className="search-start">
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-card__label">{t('search.start.categories')}</p>
            <p className="stat-card__value">{categorySummaries.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">{t('search.start.competitions')}</p>
            <p className="stat-card__value">{allContestResults.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card__label">{t('search.start.editorials')}</p>
            <p className="stat-card__value">{data.editorials.length}</p>
          </div>
        </div>

        <div className="search-start__body">
          <div>
            <h2 className="search-start__heading">{t('search.start.heading')}</h2>
            <p className="muted">{t('search.start.description')}</p>
          </div>

          <ul className="search-summary-list">
            {categorySummaries.map((summary) => (
              <li className="search-summary" key={summary.category}>
                <Link
                  className="search-summary__title"
                  to={`/categories/${encodeURIComponent(summary.category)}`}
                >
                  {summary.category}
                </Link>
                <p className="card__meta">
                  {`${t('search.start.competitionCount', {
                    count: summary.contestCount,
                  })} · ${t('search.editorialCount', { count: summary.editorialCount })}`}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  } else if (contestResults.length === 0) {
    resultsContent = <p className="muted">{t('search.empty')}</p>
  } else {
    resultsContent = (
      <>
        <p className="muted">{t('search.contestCount', { count: contestResults.length })}</p>

        <ul className="card-list">
          {contestResults.map((result) => (
            <li className="card" key={`${result.category}::${result.contest}`}>
              <div className="card__header">
                <p className="card__meta">{result.category}</p>
                <h2 className="card__title">{result.contest}</h2>
                <p className="card__meta">
                  {t('search.editorialCount', { count: result.editorials.length })}
                </p>
              </div>

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
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <section className="page">
      <div className="page__header">
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
      </div>
      {resultsContent}
    </section>
  )
}
