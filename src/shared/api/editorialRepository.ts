import { normalizeEditorialIndex } from '../../entities/editorial/model/normalize'
import type { EditorialIndex } from '../../entities/editorial/model/types'

const EDITORIAL_INDEX_URL = '/data/editorial-index.json'

export async function fetchEditorialIndex(): Promise<EditorialIndex> {
  const response = await fetch(EDITORIAL_INDEX_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Unable to fetch editorial index (${response.status}).`)
  }

  const payload: unknown = await response.json()
  return normalizeEditorialIndex(payload)
}
