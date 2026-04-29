import { useEffect, useState } from 'react'
import type { EditorialIndex } from '../../entities/editorial/model/types'
import { fetchEditorialIndex } from '../api/editorialRepository'

interface EditorialIndexState {
  data: EditorialIndex
  isLoading: boolean
  error: Error | null
}

const INITIAL_INDEX: EditorialIndex = {
  version: 'unversioned',
  editorials: [],
}

export function useEditorialIndex(): EditorialIndexState {
  const [data, setData] = useState<EditorialIndex>(INITIAL_INDEX)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true

    void fetchEditorialIndex()
      .then((index) => {
        if (!isMounted) {
          return
        }
        setData(index)
        setIsLoading(false)
      })
      .catch((fetchError: unknown) => {
        if (!isMounted) {
          return
        }

        const nextError =
          fetchError instanceof Error
            ? fetchError
            : new Error('Unknown error while loading editorial index.')

        setError(nextError)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { data, isLoading, error }
}
