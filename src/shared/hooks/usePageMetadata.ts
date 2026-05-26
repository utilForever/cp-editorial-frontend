import { useEffect } from 'react'

interface PageMetadata {
  title: string
  description: string
  imageUrl?: string
  imageAlt?: string
  locale?: string
  type?: 'website' | 'article'
}

const DEFAULT_OG_IMAGE_VERSION = '20260525'
const EDITORIAL_OG_IMAGE_VERSION = '20260526'

const SITE_URL = 'https://editorial.coduck.io'
const DEFAULT_IMAGE_URL = `${SITE_URL}/images/editorial-home.png?v=${DEFAULT_OG_IMAGE_VERSION}`
const OG_IMAGE_TYPE = 'image/png'
const OG_IMAGE_WIDTH = '1200'
const OG_IMAGE_HEIGHT = '630'
const DEFAULT_OG_IMAGE_ALT = 'Coduck - CP Editorial preview image'

export function buildEditorialPreviewImagePath(editorialId: string): string {
  return `/images/editorials/${encodeURIComponent(editorialId)}.png?v=${EDITORIAL_OG_IMAGE_VERSION}`
}

function toAbsoluteUrl(value: string): string {
  return new URL(value, SITE_URL).toString()
}

function normalizeLocale(value: string | undefined): string {
  if (!value) {
    return 'en_US'
  }

  const base = value.split('-')[0]?.toLowerCase()
  if (base === 'ko') {
    return 'ko_KR'
  }
  if (base === 'ja') {
    return 'ja_JP'
  }

  return 'en_US'
}

function setMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function setCanonicalLink(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export function usePageMetadata({
  title,
  description,
  imageUrl = DEFAULT_IMAGE_URL,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  locale,
  type = 'website',
}: PageMetadata) {
  useEffect(() => {
    const pageUrl = toAbsoluteUrl(`${globalThis.location.pathname}${globalThis.location.search}`)
    const ogLocale = normalizeLocale(locale)
    const resolvedImageUrl = toAbsoluteUrl(imageUrl)

    document.title = title
    setCanonicalLink(pageUrl)
    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:type', type)
    setMetaTag('property', 'og:site_name', 'Coduck - CP Editorial')
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:url', pageUrl)
    setMetaTag('property', 'og:image', resolvedImageUrl)
    setMetaTag('property', 'og:image:type', OG_IMAGE_TYPE)
    setMetaTag('property', 'og:image:width', OG_IMAGE_WIDTH)
    setMetaTag('property', 'og:image:height', OG_IMAGE_HEIGHT)
    setMetaTag('property', 'og:image:alt', imageAlt)
    setMetaTag('property', 'og:locale', ogLocale)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', resolvedImageUrl)
  }, [description, imageAlt, imageUrl, locale, title, type])
}
