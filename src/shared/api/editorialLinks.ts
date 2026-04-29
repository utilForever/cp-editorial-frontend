const CP_EDITORIAL_DATA_REPOSITORY = 'utilForever/cp-editorial-data'

function encodePath(path: string): string {
  const segments = path
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

  if (segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error('Invalid editorial path: dot segments are not allowed.')
  }

  return segments.map((segment) => encodeURIComponent(segment)).join('/')
}

export function buildEditorialLinks(path: string) {
  const encodedPath = encodePath(path)

  return {
    viewUrl: `https://github.com/${CP_EDITORIAL_DATA_REPOSITORY}/blob/main/${encodedPath}`,
    downloadUrl: `https://raw.githubusercontent.com/${CP_EDITORIAL_DATA_REPOSITORY}/main/${encodedPath}`,
  }
}
