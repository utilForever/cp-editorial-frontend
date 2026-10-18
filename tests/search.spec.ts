import { expect, test, type Page } from '@playwright/test'

const editorialIndex = {
  version: 'search-regression',
  editorials: [
    { id: 'cpc-2026', category: 'University', year: '2026' },
    { id: 'cpc-2025', category: 'University', year: '2025' },
    { id: 'olympiad-2026', category: 'Olympiad', year: '2026' },
  ].map(({ id, category, year }) => ({
    id,
    contest: '중앙대학교',
    problem: `${year} 중앙대학교 프로그래밍 경진대회 (CPC)`,
    categories: [category],
    path: `${category}/중앙대학교/${year} CPC.pdf`,
    filename: `${year} CPC.pdf`,
    title: { en: `${year} 중앙대학교 프로그래밍 경진대회 (CPC)` },
  })),
}

const searchPath = `/search?${new URLSearchParams({
  q: '중앙',
  category: 'University',
  year: '2026',
})}`

test.beforeEach(async ({ page }) => {
  await page.route('**/data/editorial-index.json', (route) =>
    route.fulfill({ json: editorialIndex }),
  )
})

async function expectSearch(page: Page, query: string, category: string, year: string) {
  await expect(page.locator('#search-input')).toHaveValue(query)
  await expect(page.locator('#category-filter')).toHaveValue(category)
  await expect(page.locator('#year-filter')).toHaveValue(year)
}

async function expectCpcResult(page: Page) {
  const results = page.locator('.competition-editorials__title')
  await expect(results).toHaveCount(1)
  await expect(results).toHaveAttribute('href', '/editorials/cpc-2026')
}

test('retains conditions and results after detail/Back without history entries per keystroke', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#home-search-input').press('Enter')
  await expectSearch(page, '', 'all', 'all')
  const historyLength = await page.evaluate(() => window.history.length)

  await page.locator('#search-input').pressSequentially('중앙')
  await page.locator('#category-filter').selectOption('University')
  await page.locator('#year-filter').selectOption('2026')
  await expect(page).toHaveURL(searchPath)
  await expectCpcResult(page)
  expect(await page.evaluate(() => window.history.length)).toBe(historyLength)

  await page.locator('.competition-editorials__title').click()
  await expect(page).toHaveURL('/editorials/cpc-2026')
  await page.goBack()
  await expect(page).toHaveURL(searchPath)
  await expectSearch(page, '중앙', 'University', '2026')
  await expectCpcResult(page)

  await page.goBack()
  await expect(page).toHaveURL('/')
  await page.goForward()
  await expectSearch(page, '중앙', 'University', '2026')
  await expectCpcResult(page)
})

test('restores a shared URL after delayed index loading and refresh', async ({ page }) => {
  let releaseIndex!: () => void
  const indexReady = new Promise<void>((resolve) => {
    releaseIndex = resolve
  })
  await page.route('**/data/editorial-index.json', async (route) => {
    await indexReady
    await route.fulfill({ json: editorialIndex })
  })

  await page.goto(searchPath)
  await expect(page.getByText('Loading editorial index...', { exact: true })).toBeVisible()
  await expect(page).toHaveURL(searchPath)
  releaseIndex()
  await expectSearch(page, '중앙', 'University', '2026')
  await expectCpcResult(page)

  await page.reload()
  await expect(page).toHaveURL(searchPath)
  await expectSearch(page, '중앙', 'University', '2026')
  await expectCpcResult(page)
})

test('preserves long rapid input while URL updates are pending', async ({ page }) => {
  await page.unroute('**/data/editorial-index.json')
  await page.goto('/search?source=shared')
  const query = '중앙대학교 프로그래밍 경진대회'
  await page.locator('#search-input').pressSequentially(query)
  await expectSearch(page, query, 'all', 'all')
  await expect(page).toHaveURL(`/search?${new URLSearchParams({ source: 'shared', q: query })}`)
})

test('restores the query on same-page navigation and Back', async ({ page }) => {
  await page.goto(searchPath)
  await expectCpcResult(page)
  await page.locator('nav a[href="/search"]').click()
  await expect(page).toHaveURL('/search')
  await expectSearch(page, '', 'all', 'all')
  await page.goBack()
  await expectSearch(page, '중앙', 'University', '2026')
  await expectCpcResult(page)
})

test('Clear resets controls, results and URL together while preserving unrelated parameters', async ({
  page,
}) => {
  await page.goto(`${searchPath}&source=shared`)
  await expectCpcResult(page)
  const historyLength = await page.evaluate(() => window.history.length)

  await page.getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(page).toHaveURL('/search?source=shared')
  await expectSearch(page, '', 'all', 'all')
  await expect(page.locator('.search-start')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Clear', exact: true })).toBeDisabled()
  expect(await page.evaluate(() => window.history.length)).toBe(historyLength)

  await page.reload()
  await expectSearch(page, '', 'all', 'all')
  await expect(page.locator('.search-start')).toBeVisible()
})

test('updates and removes each parameter independently, preserving literal query text', async ({
  page,
}) => {
  await page.goto(`${searchPath}&source=shared`)
  await page.locator('#search-input').fill('all')
  await expect(page).toHaveURL(/q=all&category=University&year=2026&source=shared$/)

  const query = ' 중앙 & + /? # '
  await page.locator('#search-input').fill(query)
  await expect(page).toHaveURL((url) => url.searchParams.get('q') === query)
  await page.reload()
  await expectSearch(page, query, 'University', '2026')
  expect(new URL(page.url()).searchParams.get('q')).toBe(query)

  await page.locator('#category-filter').selectOption('all')
  await expect(page).toHaveURL((url) => !url.searchParams.has('category'))
  await page.locator('#year-filter').selectOption('all')
  await expectSearch(page, query, 'all', 'all')
  await expect(page).toHaveURL((url) => !url.searchParams.has('year'))
  await page.locator('#search-input').fill('')
  await expect(page).toHaveURL('/search?source=shared')
})

for (const category of ['Unknown', '', ' ', 'all']) {
  test(`falls back for category ${JSON.stringify(category)} and allows clearing URL defaults`, async ({
    page,
  }) => {
    await page.goto(`/search?${new URLSearchParams({ q: ' ', category, year: 'unknown' })}`)
    await expectSearch(page, ' ', 'all', 'all')
    await expect(page.locator('.search-start')).toBeVisible()
    await page.getByRole('button', { name: 'Clear', exact: true }).click()
    await expect(page).toHaveURL('/search')
    await expectSearch(page, '', 'all', 'all')
  })
}

test('trims an incoming category and year without discarding valid filters during loading', async ({
  page,
}) => {
  await page.goto(`/search?${new URLSearchParams({ category: ' University ', year: ' 2026 ' })}`)
  await expectSearch(page, '', 'University', '2026')
  await expectCpcResult(page)
})
