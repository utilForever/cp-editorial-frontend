const CP_EDITORIAL_DATA_REPOSITORY = 'utilForever/cp-editorial-data'

function encodePath(path: string): string {
  return path
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function buildEditorialLinks(path: string) {
  const encodedPath = encodePath(path)

  return {
    viewUrl: `https://github.com/${CP_EDITORIAL_DATA_REPOSITORY}/blob/main/${encodedPath}`,
    downloadUrl: `https://raw.githubusercontent.com/${CP_EDITORIAL_DATA_REPOSITORY}/main/${encodedPath}`,
  }
}
