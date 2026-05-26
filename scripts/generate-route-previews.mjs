import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const SITE_URL = 'https://editorial.coduck.io'
const APP_TITLE = 'Coduck - CP Editorial'
const DEFAULT_DESCRIPTION = 'A curated archive for competitive-programming contest editorials.'
const SHARED_IMAGE_URL = `${SITE_URL}/images/editorial-home.png?v=20260525`
const EDITORIAL_IMAGE_VERSION = '20260526'
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..')
const DIST_DIR = path.join(PROJECT_ROOT, 'dist')
const TEMPLATE_HTML_PATH = path.join(DIST_DIR, 'index.html')
const INDEX_DATA_PATH = path.join(DIST_DIR, 'data', 'editorial-index.json')
const EDITORIAL_IMAGE_OUTPUT_DIR = path.join(DIST_DIR, 'images', 'editorials')
const EDITORIAL_INFO_BASE_IMAGE_DIST_PATH = path.join(DIST_DIR, 'images', 'editorial-info-base.png')

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeXml(value) {
  return escapeHtml(value)
}

function normalizeRoutePath(pathname) {
  const trimmed = pathname.trim()
  if (trimmed.length === 0) {
    return '/'
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash
}

function toAbsoluteUrl(pathname) {
  return new URL(pathname, SITE_URL).toString()
}

function upsertTag(template, pattern, replacement) {
  if (pattern.test(template)) {
    return template.replace(pattern, replacement)
  }

  return template.replace('</head>', `    ${replacement}\n  </head>`)
}

function upsertTitle(template, title) {
  return upsertTag(template, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
}

function upsertCanonical(template, href) {
  return upsertTag(
    template,
    /<link[^>]*rel=['"]canonical['"][^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(href)}" />`,
  )
}

function upsertMeta(template, attribute, key, content) {
  const keyPattern = escapeRegExp(key)
  const pattern = new RegExp(`<meta[^>]*${attribute}=['"]${keyPattern}['"][^>]*>`, 'i')
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`
  return upsertTag(template, pattern, tag)
}

function getLocalizedText(content, preferredLocale) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return ''
  }

  const normalizedLocale = preferredLocale.toLowerCase().split(/[-_]/)[0]
  const preferredText =
    typeof content[normalizedLocale] === 'string' ? content[normalizedLocale] : ''
  if (preferredText.trim().length > 0) {
    return preferredText.trim()
  }

  for (const locale of ['en', 'ko', 'ja']) {
    const value = typeof content[locale] === 'string' ? content[locale] : ''
    if (value.trim().length > 0) {
      return value.trim()
    }
  }

  for (const value of Object.values(content)) {
    if (typeof value !== 'string') {
      continue
    }
    if (value.trim().length > 0) {
      return value.trim()
    }
  }

  return ''
}

function hashStableString(value) {
  let hash = 0
  for (const character of value) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0
  }

  return hash.toString(36)
}

function createStableEditorialId(record) {
  const base =
    `${record.contest.trim()}::${record.problem.trim()}::${record.path.trim()}`.toLowerCase()
  return `ed-${hashStableString(base)}`
}

function assertString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid editorial index: "${label}" is required.`)
  }

  return value.trim()
}

function normalizeLocalizedContent(value, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid editorial index: "${label}" must be an object.`)
  }

  const entries = []
  for (const [locale, content] of Object.entries(value)) {
    if (typeof content !== 'string') {
      continue
    }

    const normalized = content.trim()
    if (normalized.length === 0) {
      continue
    }

    entries.push([locale, normalized])
  }

  if (entries.length === 0) {
    throw new Error(`Invalid editorial index: "${label}" must contain at least one locale.`)
  }

  return Object.fromEntries(entries)
}

function normalizeCategories(categories) {
  if (!Array.isArray(categories)) {
    return []
  }

  return categories
    .filter((category) => typeof category === 'string')
    .map((category) => category.trim())
    .filter((category) => category.length > 0)
}

function normalizeEditorialIndex(rawIndex) {
  if (rawIndex === null || typeof rawIndex !== 'object' || Array.isArray(rawIndex)) {
    throw new Error('Invalid editorial index: top-level value must be an object.')
  }

  if (!Array.isArray(rawIndex.editorials)) {
    throw new TypeError('Invalid editorial index: "editorials" must be an array.')
  }

  return rawIndex.editorials.map((rawRecord, index) => {
    if (rawRecord === null || typeof rawRecord !== 'object' || Array.isArray(rawRecord)) {
      throw new Error(`Invalid editorial index: "editorials[${index}]" must be an object.`)
    }

    const contest = assertString(rawRecord.contest, 'contest')
    const problem = assertString(rawRecord.problem, 'problem')
    const editorialPath = assertString(rawRecord.path, 'path')
    const title = normalizeLocalizedContent(rawRecord.title, 'title')
    const summary =
      rawRecord.summary === undefined ? {} : normalizeLocalizedContent(rawRecord.summary, 'summary')

    const id =
      typeof rawRecord.id === 'string' && rawRecord.id.trim().length > 0
        ? rawRecord.id.trim()
        : createStableEditorialId({ contest, problem, path: editorialPath })

    return {
      id,
      contest,
      problem,
      path: editorialPath,
      title,
      summary,
      categories: normalizeCategories(rawRecord.categories),
    }
  })
}

function getDirectorySegments(editorialPath) {
  const segments = editorialPath
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

  return segments.slice(0, -1)
}

function toMetaDescription(value, fallback = DEFAULT_DESCRIPTION) {
  const singleLine = value.replace(/\s+/g, ' ').trim()
  if (singleLine.length === 0) {
    return fallback
  }

  return singleLine.length > 240 ? `${singleLine.slice(0, 237)}...` : singleLine
}

function buildEditorialImagePath(editorialId) {
  return `/images/editorials/${encodeURIComponent(editorialId)}.png?v=${EDITORIAL_IMAGE_VERSION}`
}

function upsertRouteMetadata(template, metadata) {
  const canonicalUrl = toAbsoluteUrl(metadata.path)
  let html = template

  html = upsertTitle(html, metadata.title)
  html = upsertCanonical(html, canonicalUrl)
  html = upsertMeta(html, 'name', 'description', metadata.description)
  html = upsertMeta(html, 'property', 'og:type', metadata.type)
  html = upsertMeta(html, 'property', 'og:site_name', APP_TITLE)
  html = upsertMeta(html, 'property', 'og:locale', 'en_US')
  html = upsertMeta(html, 'property', 'og:title', metadata.title)
  html = upsertMeta(html, 'property', 'og:description', metadata.description)
  html = upsertMeta(html, 'property', 'og:url', canonicalUrl)
  html = upsertMeta(html, 'property', 'og:image', metadata.imageUrl)
  html = upsertMeta(html, 'property', 'og:image:type', 'image/png')
  html = upsertMeta(html, 'property', 'og:image:width', String(OG_IMAGE_WIDTH))
  html = upsertMeta(html, 'property', 'og:image:height', String(OG_IMAGE_HEIGHT))
  html = upsertMeta(html, 'property', 'og:image:alt', metadata.imageAlt)
  html = upsertMeta(html, 'name', 'twitter:card', 'summary_large_image')
  html = upsertMeta(html, 'name', 'twitter:title', metadata.title)
  html = upsertMeta(html, 'name', 'twitter:description', metadata.description)
  html = upsertMeta(html, 'name', 'twitter:image', metadata.imageUrl)

  return html
}

function wrapText(value, maxChars, maxLines) {
  const words = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  if (words.length === 0) {
    return []
  }

  const lines = []
  let currentLine = ''
  let consumedWords = 0

  for (const word of words) {
    const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`
    if (candidate.length <= maxChars) {
      currentLine = candidate
      consumedWords += 1
      continue
    }

    if (currentLine.length > 0) {
      lines.push(currentLine)
      currentLine = word
      consumedWords += 1
    } else {
      lines.push(word.slice(0, maxChars))
      currentLine = ''
      consumedWords += 1
    }

    if (lines.length === maxLines) {
      break
    }
  }

  if (lines.length < maxLines && currentLine.length > 0) {
    lines.push(currentLine)
  }

  const hasRemainingWords = consumedWords < words.length
  if (hasRemainingWords && lines.length > 0) {
    const lastLine = lines[lines.length - 1]
    lines[lines.length - 1] =
      lastLine.length > maxChars - 3 ? `${lastLine.slice(0, maxChars - 3)}...` : `${lastLine}...`
  }

  return lines.slice(0, maxLines)
}

function buildEditorialImageSvg(editorial, title, description, backgroundImageDataUri) {
  const contestLines = wrapText(editorial.contest, 46, 2)
  const titleLines = wrapText(title, 38, 3)
  const footerLine = toMetaDescription(description, `${editorial.contest} editorial`)

  const contestText = contestLines
    .map(
      (line, index) =>
        `<text x="88" y="${198 + index * 42}" fill="#7a5528" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join('\n')
  const titleText = titleLines
    .map(
      (line, index) =>
        `<text x="88" y="${344 + index * 64}" fill="#3b2712" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="700">${escapeXml(line)}</text>`,
    )
    .join('\n')

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}">
  <defs>
    <linearGradient id="overlay" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1f1308" stop-opacity="0.5"/>
      <stop offset="58%" stop-color="#1f1308" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#1f1308" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  <image href="${backgroundImageDataUri}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice" />
  <rect width="1200" height="630" fill="url(#overlay)" />
  <rect x="64" y="72" width="724" height="500" rx="28" fill="#ffffff" fill-opacity="0.50" />
  <text x="88" y="112" fill="#9a6a2f" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700">Coduck · CP Editorial</text>
  ${contestText}
  ${titleText}
  <text x="88" y="546" fill="#6f4d26" font-family="Segoe UI, Arial, sans-serif" font-size="28">${escapeXml(footerLine)}</text>
</svg>`.trim()
}

async function writeRoutePage(pathname, html) {
  const normalizedPath = normalizeRoutePath(pathname)
  if (normalizedPath === '/') {
    return
  }

  const relativeSegments = normalizedPath.slice(1).split('/')
  const outputDirectory = path.join(DIST_DIR, ...relativeSegments)
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(path.join(outputDirectory, 'index.html'), html, 'utf8')
}

async function generateEditorialImages(editorials) {
  await mkdir(EDITORIAL_IMAGE_OUTPUT_DIR, { recursive: true })
  const editorialBaseImageBytes = await readFile(EDITORIAL_INFO_BASE_IMAGE_DIST_PATH)
  const editorialBaseImageDataUri = `data:image/png;base64,${editorialBaseImageBytes.toString('base64')}`

  let generatedCount = 0
  for (const editorial of editorials) {
    const localizedTitle =
      getLocalizedText(editorial.title, 'en') || editorial.problem || editorial.contest
    const categoryFooter =
      editorial.categories.length > 0
        ? editorial.categories.join(' > ')
        : `${editorial.contest} editorial`
    const svg = buildEditorialImageSvg(
      editorial,
      localizedTitle,
      categoryFooter,
      editorialBaseImageDataUri,
    )
    const rendered = new Resvg(svg).render().asPng()
    const encodedId = encodeURIComponent(editorial.id)
    const outputPath = path.join(EDITORIAL_IMAGE_OUTPUT_DIR, `${encodedId}.png`)

    await writeFile(outputPath, rendered)
    generatedCount += 1
  }

  return generatedCount
}

function buildRouteMetadata(editorials) {
  const routes = new Map()
  const setRoute = (pathname, metadata) => {
    const normalizedPath = normalizeRoutePath(pathname)
    if (normalizedPath === '/') {
      return
    }

    routes.set(normalizedPath, {
      path: normalizedPath,
      ...metadata,
    })
  }

  setRoute('/search', {
    title: `Search | ${APP_TITLE}`,
    description: 'Search competitive-programming editorials by keyword, category, and contest.',
    type: 'website',
    imageUrl: SHARED_IMAGE_URL,
    imageAlt: 'Search page preview image',
  })
  setRoute('/categories', {
    title: `Categories | ${APP_TITLE}`,
    description: 'Browse editorial categories and contests by directory hierarchy.',
    type: 'website',
    imageUrl: SHARED_IMAGE_URL,
    imageAlt: 'Categories page preview image',
  })
  setRoute('/contribute', {
    title: `Contribute | ${APP_TITLE}`,
    description: 'Learn how to contribute new editorial files to cp-editorial-data.',
    type: 'website',
    imageUrl: SHARED_IMAGE_URL,
    imageAlt: 'Contribute page preview image',
  })
  setRoute('/copyright', {
    title: `Copyright | ${APP_TITLE}`,
    description: 'Review editorial ownership, attribution, and usage guidance.',
    type: 'website',
    imageUrl: SHARED_IMAGE_URL,
    imageAlt: 'Copyright page preview image',
  })

  const seenCategoryPaths = new Set()
  for (const editorial of editorials) {
    const directories = getDirectorySegments(editorial.path)
    for (let depth = 1; depth <= directories.length; depth += 1) {
      const hierarchySegments = directories.slice(0, depth)
      const routePath = `/categories/${hierarchySegments.map(encodeURIComponent).join('/')}`
      if (seenCategoryPaths.has(routePath)) {
        continue
      }

      seenCategoryPaths.add(routePath)
      setRoute(routePath, {
        title: `${hierarchySegments[hierarchySegments.length - 1]} | ${APP_TITLE}`,
        description: toMetaDescription(`Browse editorials under ${hierarchySegments.join(' > ')}.`),
        type: 'website',
        imageUrl: SHARED_IMAGE_URL,
        imageAlt: 'Category page preview image',
      })
    }
  }

  for (const editorial of editorials) {
    const localizedTitle =
      getLocalizedText(editorial.title, 'en') || editorial.problem || editorial.contest
    const description = toMetaDescription(
      getLocalizedText(editorial.summary, 'en'),
      `${editorial.contest} editorial`,
    )
    const routePath = `/editorials/${encodeURIComponent(editorial.id)}`
    const imagePath = buildEditorialImagePath(editorial.id)
    setRoute(routePath, {
      title: `${localizedTitle} | ${APP_TITLE}`,
      description,
      type: 'article',
      imageUrl: toAbsoluteUrl(imagePath),
      imageAlt: `${localizedTitle} preview image`,
    })
  }

  return routes
}

async function main() {
  const [templateHtml, rawIndexText] = await Promise.all([
    readFile(TEMPLATE_HTML_PATH, 'utf8'),
    readFile(INDEX_DATA_PATH, 'utf8'),
  ])

  const rawIndex = JSON.parse(rawIndexText)
  const editorials = normalizeEditorialIndex(rawIndex)
  const routeMetadata = buildRouteMetadata(editorials)

  const generatedImageCount = await generateEditorialImages(editorials)
  let generatedPageCount = 0

  for (const metadata of routeMetadata.values()) {
    const routeHtml = upsertRouteMetadata(templateHtml, metadata)
    await writeRoutePage(metadata.path, routeHtml)
    generatedPageCount += 1
  }

  console.log(
    `[route-previews] Generated ${generatedPageCount} route pages and ${generatedImageCount} editorial images.`,
  )
}

main().catch((error) => {
  console.error('[route-previews] Failed to generate route previews.')
  console.error(error)
  process.exitCode = 1
})
