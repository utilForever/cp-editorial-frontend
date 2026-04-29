import type {
  EditorialIndex,
  EditorialRecord,
  LocalizedContent,
  RawEditorialIndex,
  RawEditorialRecord,
} from './types'

const DEFAULT_INDEX_VERSION = 'unversioned'

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid editorial index: "${label}" is required.`)
  }

  return value.trim()
}

function normalizeLocalizedContent(value: unknown, label: string): LocalizedContent {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid editorial index: "${label}" must be an object.`)
  }

  const rawEntries = Object.entries(value as Record<string, unknown>)
  const entries: [string, string][] = []

  rawEntries.forEach(([locale, content]) => {
    if (typeof content !== 'string') {
      return
    }

    const normalizedContent = content.trim()
    if (normalizedContent.length === 0) {
      return
    }

    entries.push([locale, normalizedContent])
  })

  if (entries.length === 0) {
    throw new Error(`Invalid editorial index: "${label}" must contain at least one locale.`)
  }

  return Object.fromEntries(entries)
}

function normalizeCategories(categories: unknown): string[] {
  if (!Array.isArray(categories)) {
    return []
  }

  return categories
    .filter((category): category is string => typeof category === 'string')
    .map((category) => category.trim())
    .filter((category) => category.length > 0)
}

function hashStableString(value: string): string {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}

export function createStableEditorialId(
  record: Pick<RawEditorialRecord, 'contest' | 'problem' | 'path'>,
): string {
  const base =
    `${record.contest.trim()}::${record.problem.trim()}::${record.path.trim()}`.toLowerCase()
  return `ed-${hashStableString(base)}`
}

export function normalizeEditorialRecord(rawRecord: RawEditorialRecord): EditorialRecord {
  const contest = assertString(rawRecord.contest, 'contest')
  const problem = assertString(rawRecord.problem, 'problem')
  const path = assertString(rawRecord.path, 'path')
  const filename = assertString(rawRecord.filename, 'filename')
  const title = normalizeLocalizedContent(rawRecord.title, 'title')
  const summary =
    rawRecord.summary !== undefined ? normalizeLocalizedContent(rawRecord.summary, 'summary') : {}
  const id =
    typeof rawRecord.id === 'string' && rawRecord.id.trim().length > 0
      ? rawRecord.id.trim()
      : createStableEditorialId({ contest, problem, path })

  return {
    id,
    contest,
    problem,
    categories: normalizeCategories(rawRecord.categories),
    path,
    filename,
    title,
    summary,
    updatedAt: rawRecord.updatedAt,
  }
}

export function normalizeEditorialIndex(rawIndex: RawEditorialIndex): EditorialIndex {
  if (!Array.isArray(rawIndex.editorials)) {
    throw new Error('Invalid editorial index: "editorials" must be an array.')
  }

  return {
    version:
      typeof rawIndex.version === 'string' && rawIndex.version.trim().length > 0
        ? rawIndex.version.trim()
        : DEFAULT_INDEX_VERSION,
    generatedAt: rawIndex.generatedAt,
    editorials: rawIndex.editorials.map(normalizeEditorialRecord),
  }
}
