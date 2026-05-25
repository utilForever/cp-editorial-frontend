import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'
import type { EditorialRecord } from '../entities/editorial/model/types'
import { buildEditorialLinks } from '../shared/api/editorialLinks'
import { useEditorialIndex } from '../shared/hooks/useEditorialIndex'
import { usePageMetadata } from '../shared/hooks/usePageMetadata'
import { getLocalizedText } from '../shared/i18n/getLocalizedText'

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function decodeHierarchyPath(value: string | undefined): string[] {
  if (!value) {
    return []
  }

  return value
    .split('/')
    .filter((segment) => segment.length > 0)
    .map(decodePathSegment)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
}

function getDirectorySegments(path: string): string[] {
  const segments = path
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

  return segments.slice(0, -1)
}

function isMatchingPrefix(segments: string[], prefix: string[]): boolean {
  if (prefix.length > segments.length) {
    return false
  }

  return prefix.every((segment, index) => segments[index] === segment)
}

export function CategoryPage() {
  const { t, i18n } = useTranslation()
  const { '*': hierarchyPath } = useParams()
  const { data, isLoading, error } = useEditorialIndex()
  const selectedSegments = useMemo(() => decodeHierarchyPath(hierarchyPath), [hierarchyPath])

  const { childNodes, editorialsAtNode, hasMatches } = useMemo(() => {
    const childNodeCounts = new Map<string, number>()
    const editorialsAtCurrentNode: EditorialRecord[] = []
    const depth = selectedSegments.length

    const matchingEditorials = data.editorials.filter((editorial) =>
      isMatchingPrefix(getDirectorySegments(editorial.path), selectedSegments),
    )

    matchingEditorials.forEach((editorial) => {
      const directories = getDirectorySegments(editorial.path)
      if (directories.length > depth) {
        const childSegment = directories[depth]
        childNodeCounts.set(childSegment, (childNodeCounts.get(childSegment) ?? 0) + 1)
        return
      }

      editorialsAtCurrentNode.push(editorial)
    })

    const sortedEditorialsAtNode = [...editorialsAtCurrentNode].sort((left, right) =>
      left.filename.localeCompare(right.filename),
    )

    return {
      childNodes: Array.from(childNodeCounts.entries())
        .map(([name, count]) => ({
          name,
          count,
          route: `/categories/${[...selectedSegments, name].map(encodeURIComponent).join('/')}`,
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
      editorialsAtNode: sortedEditorialsAtNode,
      hasMatches: matchingEditorials.length > 0,
    }
  }, [data.editorials, selectedSegments])

  const currentSegment = selectedSegments[selectedSegments.length - 1] ?? t('category.unknown')
  const isLeafNode = childNodes.length === 0
  const heading = isLeafNode
    ? t('contest.heading', { contest: currentSegment })
    : t('category.heading', { category: currentSegment })

  usePageMetadata({
    title:
      selectedSegments.length > 0
        ? `${heading} | ${t('appTitle')}`
        : `${t('categories.heading')} | ${t('appTitle')}`,
    description:
      selectedSegments.length > 0
        ? `${t('categories.heading')}: ${selectedSegments.join(' > ')}`
        : t('footer.description'),
    locale: i18n.resolvedLanguage,
  })

  if (isLoading) {
    return <p className="muted">{t('common.loading')}</p>
  }

  if (error) {
    return <p className="error">{error.message}</p>
  }

  if (selectedSegments.length === 0) {
    return <Navigate replace to="/categories" />
  }

  if (!hasMatches) {
    return <p className="muted">{t('contest.empty')}</p>
  }

  return (
    <section className="page">
      <h1>{heading}</h1>
      <p className="page__description">
        <Link to="/categories">{t('categories.heading')}</Link>
        {selectedSegments.map((segment, index) => {
          const isCurrent = index === selectedSegments.length - 1
          const route = `/categories/${selectedSegments
            .slice(0, index + 1)
            .map(encodeURIComponent)
            .join('/')}`

          return (
            <span key={`${segment}-${index}`}>
              {' > '}
              {isCurrent ? segment : <Link to={route}>{segment}</Link>}
            </span>
          )
        })}
      </p>

      {childNodes.length > 0 && (
        <ul className="card-list">
          {childNodes.map((childNode) => (
            <li className="card" key={childNode.route}>
              <Link className="card__title" to={childNode.route}>
                {childNode.name}
              </Link>
              <p className="card__meta">
                {t('category.editorialCount', { count: childNode.count })}
              </p>
            </li>
          ))}
        </ul>
      )}

      {editorialsAtNode.length > 0 && (
        <>
          <p className="muted">{t('contest.editorialCount', { count: editorialsAtNode.length })}</p>
          <ul className="card-list">
            {editorialsAtNode.map((editorial) => {
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
        </>
      )}
    </section>
  )
}
