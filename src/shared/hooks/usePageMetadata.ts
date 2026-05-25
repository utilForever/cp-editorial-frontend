import { useEffect } from 'react'

interface PageMetadata {
  title: string
  description: string
  imageUrl?: string
  locale?: string
  type?: 'website' | 'article'
}

const SITE_URL = 'https://editorial.coduck.io'
const DEFAULT_IMAGE_URL = `${SITE_URL}/images/editorial-home.png`

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
  locale,
  type = 'website',
}: PageMetadata) {
  useEffect(() => {
    const pageUrl = toAbsoluteUrl(
      `${globalThis.location.pathname}${globalThis.location.search}`,
    )
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
    setMetaTag('property', 'og:image:alt', 'Coduck - CP Editorial preview image')
    setMetaTag('property', 'og:locale', ogLocale)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:image', resolvedImageUrl)
  }, [description, imageUrl, locale, title, type])
}
