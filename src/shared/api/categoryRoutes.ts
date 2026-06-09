/** Returns the folder hierarchy for an editorial path without the final file segment. */
export function getDirectorySegments(path: string): string[] {
  const segments = path
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

  return segments.slice(0, -1)
}

/** Builds the category route for a hierarchy of already-decoded path segments. */
export function buildCategoryRoute(segments: string[]): string {
  return `/categories/${segments.map(encodeURIComponent).join('/')}`
}
