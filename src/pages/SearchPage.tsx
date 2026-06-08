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

interface ContestSearchResult {
  category: string
  contest: string
  editorials: EditorialSearchResult[]
}

interface CategorySummary {
  category: string
  contestCount: number
  editorialCount: number
}

type SearchFieldId = 'title' | 'contest' | 'entry' | 'category' | 'summary' | 'filename'

interface SearchField {
  id: SearchFieldId
  value: string
}

interface SearchMatch {
  field: SearchFieldId
  value: string
}

interface EditorialSearchResult {
  editorial: EditorialRecord
  matches: SearchMatch[]
}

const ALL_FILTER_VALUE = 'all'

const SEARCH_FIELD_LABEL_KEYS: Record<SearchFieldId, string> = {
  title: 'search.match.fields.title',
  contest: 'search.match.fields.contest',
  entry: 'search.match.fields.entry',
  category: 'search.match.fields.category',
  summary: 'search.match.fields.summary',
  filename: 'search.match.fields.filename',
}

/**
 * Builds the user-facing fields searched for each editorial.
 */
function getSearchFields(editorial: EditorialRecord, language: string | undefined): SearchField[] {
  const fields: SearchField[] = [
    { id: 'title', value: getLocalizedText(editorial.title, language) },
    { id: 'contest', value: editorial.contest },
    { id: 'entry', value: editorial.problem },
    { id: 'category', value: editorial.categories.join(' > ') },
    { id: 'summary', value: getLocalizedText(editorial.summary, language) },
    { id: 'filename', value: editorial.filename },
  ]

  return fields.filter((field) => field.value.trim().length > 0)
}

/**
 * Returns visible match metadata for the current query.
 */
function findEditorialMatches(
  editorial: EditorialRecord,
  query: string,
  language: string | undefined,
): SearchMatch[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery.length === 0) {
    return []
  }

  return getSearchFields(editorial, language)
    .filter((field) => field.value.toLowerCase().includes(normalizedQuery))
    .map((field) => ({
      field: field.id,
      value: field.value,
    }))
}

/**
 * Groups editorials by their top-level category and contest for stable search result sections.
 */
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

/**
 * Builds the category totals shown before a user enters a search query.
 */
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

/**
 * Returns matching contest groups while leaving empty-query display to the summary state.
 */
function getEditorialYear(editorial: EditorialRecord): string | null {
  const searchableText = [
    editorial.contest,
    editorial.problem,
    editorial.filename,
    editorial.path,
    ...Object.values(editorial.title),
  ].join(' ')
  const match = /\b(?:19|20)\d{2}\b/u.exec(searchableText)

  return match?.[0] ?? null
}

function getCategoryBreadcrumb(editorial: EditorialRecord, fallback: string): string {
  return editorial.categories.length > 0 ? editorial.categories.join(' > ') : fallback
}

function isEditorialInCategory(editorial: EditorialRecord, category: string): boolean {
  return category === ALL_FILTER_VALUE || editorial.categories.includes(category)
}

function isEditorialInYear(editorial: EditorialRecord, year: string): boolean {
  return year === ALL_FILTER_VALUE || getEditorialYear(editorial) === year
}

function filterContestResults(
  contestResults: ContestResult[],
  query: string,
  language: string | undefined,
  category: string,
  year: string,
): ContestSearchResult[] {
  const normalizedQuery = query.trim()
  const hasActiveFilters = category !== ALL_FILTER_VALUE || year !== ALL_FILTER_VALUE
  if (normalizedQuery.length === 0 && !hasActiveFilters) {
    return []
  }

  return contestResults
    .map((result) => ({
      ...result,
      editorials: result.editorials
        .map((editorial) => ({
          editorial,
          matches: findEditorialMatches(editorial, normalizedQuery, language),
        }))
        .filter(
          (result) =>
            (normalizedQuery.length === 0 || result.matches.length > 0) &&
            isEditorialInCategory(result.editorial, category) &&
            isEditorialInYear(result.editorial, year),
        ),
    }))
    .filter((result) => result.editorials.length > 0)
}

function buildHighlightedSnippet(value: string, query: string, maxLength = 96): ReactNode {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length === 0) {
    return value
  }

  const valueLowerCase = value.toLowerCase()
  const queryLowerCase = normalizedQuery.toLowerCase()
  const matchIndex = valueLowerCase.indexOf(queryLowerCase)
  if (matchIndex < 0) {
    return value
  }

  const availableContextLength = Math.max(maxLength - normalizedQuery.length, 0)
  const preferredStart = matchIndex - Math.floor(availableContextLength / 2)
  const start = Math.max(0, Math.min(preferredStart, Math.max(value.length - maxLength, 0)))
  const end = Math.min(value.length, start + maxLength)
  const snippet = `${start > 0 ? '...' : ''}${value.slice(start, end)}${
    end < value.length ? '...' : ''
  }`
  const snippetMatchIndex = snippet.toLowerCase().indexOf(queryLowerCase)

  if (snippetMatchIndex < 0) {
    return snippet
  }

  const before = snippet.slice(0, snippetMatchIndex)
  const match = snippet.slice(snippetMatchIndex, snippetMatchIndex + normalizedQuery.length)
  const after = snippet.slice(snippetMatchIndex + normalizedQuery.length)

  return (
    <>
      {before}
      <mark className="search-highlight">{match}</mark>
      {after}
    </>
  )
}

/**
 * Route-level search experience with separate empty-query summaries and keyword results.
 */
export function SearchPage() {
  const { t, i18n } = useTranslation()
  const { data, isLoading, error } = useEditorialIndex()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const urlCategoryParam = searchParams.get('category')?.trim()
  const urlCategory =
    urlCategoryParam !== undefined && urlCategoryParam.length > 0
      ? urlCategoryParam
      : ALL_FILTER_VALUE
  const [query, setQuery] = useState(urlQuery)
  const [selectedCategory, setSelectedCategory] = useState(urlCategory)
  const [selectedYear, setSelectedYear] = useState(ALL_FILTER_VALUE)
  const normalizedQuery = query.trim()
  const hasActiveFilters =
    selectedCategory !== ALL_FILTER_VALUE || selectedYear !== ALL_FILTER_VALUE
  const isStartState = normalizedQuery.length === 0 && !hasActiveFilters

  usePageMetadata({
    title: `${t('search.heading')} | ${t('appTitle')}`,
    description: t('search.description'),
    locale: i18n.resolvedLanguage,
  })

  const allContestResults = useMemo(() => groupByContest(data.editorials), [data.editorials])

  const contestResults = useMemo(
    () =>
      filterContestResults(
        allContestResults,
        query,
        i18n.resolvedLanguage,
        selectedCategory,
        selectedYear,
      ),
    [allContestResults, i18n.resolvedLanguage, query, selectedCategory, selectedYear],
  )

  const categorySummaries = useMemo(
    () => summarizeByCategory(allContestResults),
    [allContestResults],
  )

  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(data.editorials.flatMap((editorial) => editorial.categories))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [data.editorials],
  )

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data.editorials
            .map((editorial) => getEditorialYear(editorial))
            .filter((year): year is string => year !== null),
        ),
      ).sort((left, right) => right.localeCompare(left)),
    [data.editorials],
  )

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    setSelectedCategory(urlCategory)
  }, [urlCategory])

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  let resultsContent: ReactNode
  if (isStartState) {
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
                  {`${result.category} · ${t('search.editorialCount', {
                    count: result.editorials.length,
                  })}`}
                </p>
              </div>

              <ul className="competition-editorials">
                {result.editorials.map(({ editorial, matches }) => {
                  const links = buildEditorialLinks(editorial.path)
                  const localizedTitle = getLocalizedText(editorial.title, i18n.resolvedLanguage)
                  const breadcrumb = getCategoryBreadcrumb(editorial, t('category.unknown'))
                  const editorialYear = getEditorialYear(editorial)
                  const visibleMatches = matches.slice(0, 3)

                  return (
                    <li className="competition-editorials__item" key={editorial.id}>
                      <div className="competition-editorials__main">
                        <Link
                          className="competition-editorials__title"
                          to={`/editorials/${editorial.id}`}
                        >
                          {buildHighlightedSnippet(localizedTitle, normalizedQuery, 120)}
                        </Link>
                        <div aria-label={t('search.context.label')} className="result-context">
                          <span className="result-context__item">{breadcrumb}</span>
                          {editorialYear ? (
                            <span className="result-context__item">
                              {t('search.context.year', { year: editorialYear })}
                            </span>
                          ) : null}
                        </div>
                        {visibleMatches.length > 0 ? (
                          <ul className="match-list" aria-label={t('search.match.label')}>
                            {visibleMatches.map((match) => (
                              <li className="match-chip" key={`${editorial.id}::${match.field}`}>
                                <span className="match-chip__field">
                                  {t(SEARCH_FIELD_LABEL_KEYS[match.field])}
                                </span>
                                <span className="match-chip__value">
                                  {buildHighlightedSnippet(match.value, normalizedQuery)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
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
          <label className="muted" htmlFor="category-filter">
            {t('search.refine.category')}
          </label>
          <select
            className="select"
            id="category-filter"
            onChange={(event) => setSelectedCategory(event.target.value)}
            value={selectedCategory}
          >
            <option value={ALL_FILTER_VALUE}>{t('search.refine.allCategories')}</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <label className="muted" htmlFor="year-filter">
            {t('search.refine.year')}
          </label>
          <select
            className="select select--year"
            id="year-filter"
            onChange={(event) => setSelectedYear(event.target.value)}
            value={selectedYear}
          >
            <option value={ALL_FILTER_VALUE}>{t('search.refine.allYears')}</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            className="clear-button"
            disabled={normalizedQuery.length === 0 && !hasActiveFilters}
            onClick={() => {
              setQuery('')
              setSelectedCategory(ALL_FILTER_VALUE)
              setSelectedYear(ALL_FILTER_VALUE)
            }}
            type="button"
          >
            {t('search.refine.clear')}
          </button>
        </div>
      </div>
      {resultsContent}
    </section>
  )
}
