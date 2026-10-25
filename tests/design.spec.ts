import { expect, test, type Page } from '@playwright/test'
import { resources } from '../src/shared/i18n/resources'

const title = {
  en: '2026 International Collegiate Programming Championship — '.repeat(4),
  ko: '2026 국제 대학생 프로그래밍 경진대회 문제 해설과 풀이 — '.repeat(4),
  ja: '2026 国際大学対抗プログラミングコンテストの問題解説 — '.repeat(4),
}
const category = 'University'
const contest = 'CPC'
const editorialIndex = {
  version: 'design-regression',
  editorials: ['pdf', 'md', 'txt'].map((extension) => ({
    id: extension,
    contest,
    problem: '2026 CPC',
    categories: [category],
    path: `${category}/${contest}/2026 editorial.${extension}`,
    filename: `2026 editorial.${extension}`,
    title,
    summary: {
      en: 'A multilingual editorial for keyboard navigation and responsive layout checks.',
    },
  })),
}

test.beforeEach(async ({ page }) => {
  await page.route('**/data/editorial-index.json', (route) =>
    route.fulfill({ json: editorialIndex }),
  )
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ status: 503 }),
  )
})

async function expectReflow(page: Page) {
  const problems = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    return [...document.querySelectorAll<HTMLElement>('body *')].flatMap((element) => {
      const rect = element.getBoundingClientRect()
      if (!rect.width || !rect.height || element.classList.contains('skip-link')) return []
      const outside = rect.right > width + 1 || rect.left < -1
      const clipped =
        !['INPUT', 'SELECT', 'OPTION', 'OBJECT', 'SVG'].includes(element.tagName) &&
        element.clientWidth > 0 &&
        element.scrollWidth > element.clientWidth + 1
      return outside || clipped ? [`${element.tagName}.${element.className}`] : []
    })
  })
  expect(problems, page.url()).toEqual([])
}

const routes = [
  '/',
  '/search',
  '/search?q=2026',
  '/search?q=missing',
  '/categories',
  '/categories/University',
  '/categories/University/CPC',
  '/editorials/pdf',
  '/editorials/pdf/view',
  '/editorials/md/view',
  '/editorials/txt/view',
  '/editorials/missing',
  '/categories/missing',
  '/contribute',
  '/copyright',
]

for (const locale of ['en', 'ko', 'ja'] as const) {
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 768, 1280]) {
      test(`reflows all screens at ${width}px in ${locale}/${theme}, including doubled text`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(
          ({ locale, theme }) => {
            localStorage.setItem('cp-editorial-language', locale)
            localStorage.setItem('cp-editorial-theme', theme)
          },
          { locale, theme },
        )
        for (const path of routes) {
          await page.goto(path)
          await expect(page.locator('main h1')).toBeVisible()
          await expect(
            page.getByText(resources[locale].translation.common.loading, { exact: true }),
          ).toHaveCount(0)
          await expectReflow(page)
          if (path === '/search?q=2026') {
            await expect(page.locator('.competition-editorials__title').first()).toHaveText(
              title[locale].trim(),
            )
          }
          await page.evaluate(() => {
            document.documentElement.style.fontSize = '200%'
          })
          await expectReflow(page)
        }
        await page.goto('/categories')
        await page.setViewportSize({ width: 320, height: 900 })
        await page
          .getByRole('button', { name: resources[locale].translation.nav.menu, exact: true })
          .click()
        await expectReflow(page)
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '200%'
        })
        await expectReflow(page)
      })
    }
  }
}

test('keyboard menu dismissal returns focus; search, filters and source actions remain reachable', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await page.reload()
  await page.keyboard.press('Tab') // Skip
  await page.keyboard.press('Tab') // Brand
  await page.keyboard.press('Tab') // Search
  await page.keyboard.press('Tab') // Menu
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  await expect(menu).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(page.locator('#mobile-navigation-menu a').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menu).toBeFocused()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/categories')
  await expect(menu).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/search')
  await expect(page.getByLabel('Keyword', { exact: true })).toBeVisible()
  await expect(page.locator('.layout__nav > a')).toBeFocused()
  await page.keyboard.press('Tab') // Menu
  await expect(menu).toBeFocused()
  await page.keyboard.press('Tab') // Keyword
  await expect(page.getByLabel('Keyword', { exact: true })).toBeFocused()
  await page.keyboard.type('2026')
  await page.keyboard.press('Tab')
  await page.keyboard.press('u')
  await expect(page.locator('#category-filter')).toHaveValue(category)
  await page.keyboard.press('Tab')
  await expect(page.locator('#year-filter')).toBeFocused()
  await page.keyboard.press('2')
  await expect(page.locator('#year-filter')).toHaveValue('2026')
  await page.keyboard.press('Tab') // Clear
  await page.keyboard.press('Tab') // First title
  await expect(page.locator('.competition-editorials__title').first()).toBeFocused()
  await page.keyboard.press('Tab') // View
  const view = page.locator('.competition-editorials__item .action-link').first()
  await expect(view).toBeFocused()
  await expect(view).toHaveCSS('outline-style', 'solid')
  const popupPromise = page.waitForEvent('popup')
  await page.keyboard.press('Enter')
  const popup = await popupPromise
  await expect(popup).toHaveURL(/\/editorials\/(md|pdf|txt)\/view$/)
  await popup.close()
  await page.keyboard.press('Tab')
  const download = page.locator('.competition-editorials__item .action-link--secondary').first()
  await expect(download).toBeFocused()
  await expect(download).toHaveAttribute('href', /^https:\/\/raw.githubusercontent.com\//)
  await context.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ contentType: 'text/plain', body: 'Editorial source' }),
  )
  const sourcePromise = page.waitForEvent('popup')
  await page.keyboard.press('Enter')
  const source = await sourcePromise
  await expect(source).toHaveURL(/^https:\/\/raw.githubusercontent.com\//)
  await source.close()
})

test('menu Tab exit closes it, preferences persist, and reduced motion disables transitions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Menu', exact: true })
  await menu.click()
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await page.locator('#mobile-language-selector').selectOption('ja')
  await page.locator('#mobile-language-selector').press('Tab')
  await expect(menu).toHaveCount(0)
  await expect(page.locator('.layout__menu-button')).toHaveAttribute('aria-expanded', 'false')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.home-entry__button')).toHaveCSS('transition-duration', '0s')
})

test('index failures announce guidance and reload recovers; empty and missing states provide navigation', async ({
  page,
}) => {
  let available = false
  await page.route('**/data/editorial-index.json', (route) =>
    available ? route.fulfill({ json: editorialIndex }) : route.fulfill({ status: 503 }),
  )
  await page.goto('/')
  await expect(page.getByRole('alert')).toHaveText('Unable to load editorials')
  await expect(
    page.getByText('Check your connection and reload the page to try again.'),
  ).toBeVisible()
  available = true
  await page.getByRole('button', { name: 'Reload page' }).click()
  await expect(page.locator('#home-search-input')).toBeVisible()
  await page.goto('/editorials/missing')
  await expect(page.getByRole('status')).toHaveText('Editorial not found.')
  await page.locator('main').getByRole('link', { name: 'Search', exact: true }).click()
  await page.getByLabel('Keyword', { exact: true }).fill('no-such-editorial')
  await expect(page.getByRole('status')).toHaveText('No competitions match your search.')
  await expect(
    page.getByText('Try fewer keywords or clear the category and year filters.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled()
})

for (const theme of ['light', 'dark']) {
  test(`semantic text, action states, highlights and control/focus contrast in ${theme}`, async ({
    page,
  }) => {
    await page.addInitScript((theme) => localStorage.setItem('cp-editorial-theme', theme), theme)
    await page.goto('/search?q=2026')
    await expect(page.locator('.competition-editorials__title').first()).toBeVisible()
    const failures = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement)
      const luminance = (token: string) => {
        const hex = styles.getPropertyValue(`--color-${token}`).trim().slice(1)
        const rgb = [0, 2, 4]
          .map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
          .map((channel) =>
            channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
          )
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
      }
      const pairs: [string, string, number][] = []
      for (const background of [
        'bg-app',
        'surface',
        'surface-container-low',
        'surface-container',
        'surface-container-high',
        'primary-soft',
      ]) {
        for (const foreground of ['text-primary', 'muted', 'primary-strong', 'primary'])
          pairs.push([foreground, background, 4.5])
        for (const foreground of ['border-strong', 'focus-ring'])
          pairs.push([foreground, background, 3])
      }
      for (const background of ['primary', 'primary-hover', 'primary-pressed'])
        pairs.push(['on-primary', background, 4.5])
      pairs.push(
        ['highlight-text', 'highlight-bg', 4.5],
        ['error-text', 'error-bg', 4.5],
        ['error-border', 'error-bg', 3],
      )
      return pairs.flatMap(([foreground, background, minimum]) => {
        const a = luminance(foreground),
          b = luminance(background)
        const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        return ratio >= minimum
          ? []
          : [`${foreground}/${background}: ${ratio.toFixed(2)} < ${minimum}`]
      })
    })
    expect(failures).toEqual([])
  })
}
