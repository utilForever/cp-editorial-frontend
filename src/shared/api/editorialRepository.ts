import { normalizeEditorialIndex } from '../../entities/editorial/model/normalize'
import type { EditorialIndex } from '../../entities/editorial/model/types'

const EDITORIAL_INDEX_URL = '/data/editorial-index.json'

let cachedIndex: EditorialIndex | null = null
let indexRequest: Promise<EditorialIndex> | null = null

export function getCachedEditorialIndex(): EditorialIndex | null {
  return cachedIndex
}

export function fetchEditorialIndex(): Promise<EditorialIndex> {
  // Revalidate on a new page load; reuse the normalized index until reload.
  indexRequest ??= fetch(EDITORIAL_INDEX_URL, { cache: 'no-cache' })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Unable to fetch editorial index (${response.status}).`)
      }

      const payload: unknown = await response.json()
      cachedIndex = normalizeEditorialIndex(payload)
      return cachedIndex
    })
    .catch((error: unknown) => {
      indexRequest = null
      throw error
    })

  return indexRequest
}
