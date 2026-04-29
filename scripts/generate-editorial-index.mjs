import { request } from 'node:https'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const DATA_OWNER = 'utilForever'
const DATA_REPO = 'cp-editorial-data'
const DATA_BRANCH = 'main'
const OUTPUT_PATH = fileURLToPath(new URL('../public/data/editorial-index.json', import.meta.url))
const CONFIG_PATH = fileURLToPath(new URL('./editorial-index.config.json', import.meta.url))
const DEFAULT_CONFIG = {
  supportedExtensions: ['.pdf', '.md', '.txt'],
  excludeFileNames: ['README.md', 'LICENSE'],
  excludePathPrefixes: [],
  excludePathPatterns: [],
}

async function loadConfig() {
  const rawConfig = await readFile(CONFIG_PATH, 'utf8')
  const parsed = JSON.parse(rawConfig)

  return {
    supportedExtensions:
      Array.isArray(parsed.supportedExtensions) &&
      parsed.supportedExtensions.every((value) => typeof value === 'string')
        ? parsed.supportedExtensions
        : DEFAULT_CONFIG.supportedExtensions,
    excludeFileNames:
      Array.isArray(parsed.excludeFileNames) &&
      parsed.excludeFileNames.every((value) => typeof value === 'string')
        ? parsed.excludeFileNames
        : DEFAULT_CONFIG.excludeFileNames,
    excludePathPrefixes:
      Array.isArray(parsed.excludePathPrefixes) &&
      parsed.excludePathPrefixes.every((value) => typeof value === 'string')
        ? parsed.excludePathPrefixes
        : DEFAULT_CONFIG.excludePathPrefixes,
    excludePathPatterns:
      Array.isArray(parsed.excludePathPatterns) &&
      parsed.excludePathPatterns.every((value) => typeof value === 'string')
        ? parsed.excludePathPatterns
        : DEFAULT_CONFIG.excludePathPatterns,
  }
}

function requestJson(pathname) {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'cp-editorial-frontend-index-generator',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: 'api.github.com',
        path: pathname,
        method: 'GET',
        headers,
      },
      (response) => {
        let body = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          body += chunk
        })
        response.on('end', () => {
          if ((response.statusCode ?? 500) >= 400) {
            reject(
              new Error(
                `GitHub API request failed (${response.statusCode}): ${body.slice(0, 200)}`,
              ),
            )
            return
          }

          try {
            resolve(JSON.parse(body))
          } catch (error) {
            reject(error)
          }
        })
      },
    )

    req.on('error', reject)
    req.end()
  })
}

function isEditorialPath(path, supportedExtensions) {
  const extension = extname(path).toLowerCase()
  return supportedExtensions.has(extension)
}

function shouldExcludePath(path, config) {
  const lowerPath = path.toLowerCase()
  const filename = basename(path).toLowerCase()

  if (config.excludeFileNames.some((excludedName) => excludedName.toLowerCase() === filename)) {
    return true
  }

  if (
    config.excludePathPrefixes.some((prefix) => {
      const normalizedPrefix = prefix.replace(/^\/+|\/+$/gu, '')
      return (
        normalizedPrefix.length > 0 &&
        (path === normalizedPrefix || path.startsWith(`${normalizedPrefix}/`))
      )
    })
  ) {
    return true
  }

  return config.excludePathPatterns.some((pattern) => {
    const regex = new RegExp(pattern, 'u')
    return regex.test(lowerPath)
  })
}

function createRecordFromPath(path) {
  const directories = dirname(path)
    .split('/')
    .filter((segment) => segment.length > 0)
  const filename = basename(path)
  const fileStem = filename.replace(/\.[^.]+$/u, '')
  const category = directories[0] ?? 'Uncategorized'
  const contest = directories[1] ?? category

  return {
    contest,
    problem: fileStem,
    categories: category ? [category] : [],
    path,
    filename,
    title: {
      en: fileStem,
      ko: fileStem,
      ja: fileStem,
    },
    summary: {
      en: `${contest} editorial`,
      ko: `${contest} 해설`,
      ja: `${contest} 解説`,
    },
  }
}

async function generateIndex() {
  const config = await loadConfig()
  const supportedExtensions = new Set(
    config.supportedExtensions.map((extension) => extension.toLowerCase()),
  )
  const treePath = `/repos/${DATA_OWNER}/${DATA_REPO}/git/trees/${DATA_BRANCH}?recursive=1`
  const payload = await requestJson(treePath)
  const tree = Array.isArray(payload.tree) ? payload.tree : []

  const editorialPaths = tree
    .filter((entry) => entry.type === 'blob' && typeof entry.path === 'string')
    .map((entry) => entry.path)
    .filter((path) => isEditorialPath(path, supportedExtensions))
    .filter((path) => !shouldExcludePath(path, config))
    .sort((left, right) => left.localeCompare(right))

  const editorials = editorialPaths.map(createRecordFromPath)
  const now = new Date()
  const version = now.toISOString().slice(0, 10).replaceAll('-', '.')

  const index = {
    version,
    generatedAt: now.toISOString(),
    editorials,
  }

  await writeFile(OUTPUT_PATH, `${JSON.stringify(index, null, 2)}\n`, 'utf8')
  console.log(`Generated ${editorials.length} editorials from ${DATA_OWNER}/${DATA_REPO}.`)
}

generateIndex().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
