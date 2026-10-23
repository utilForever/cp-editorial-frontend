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

test('matches every token regardless of order, whitespace, case or repetition', async ({
  page,
}) => {
  await page.goto('/search')

  const input = page.locator('#search-input')
  const results = page.locator('.competition-editorials__title')

  for (const query of ['2026 CPC', 'CPC 2026', '  cPc   2026  ', 'CPC 2026 CPC']) {
    await input.fill(query)
    await expect(results).toHaveText([
      '2026 중앙대학교 프로그래밍 경진대회 (CPC)',
      '2026 중앙대학교 프로그래밍 경진대회 (CPC)',
    ])
    await expect(results.first()).toHaveAttribute('href', '/editorials/olympiad-2026')
    await expect(results.last()).toHaveAttribute('href', '/editorials/cpc-2026')
    await expect(results.first().locator('mark')).toHaveText(['2026', 'CPC'])
  }

  await input.fill('CPC 2026 nonexistent')
  await expect(results).toHaveCount(0)
  await expect(page.getByText('No competitions match your search.', { exact: true })).toBeVisible()

  await input.fill('   ')
  await expect(page.locator('.search-start')).toBeVisible()
})

test('combines tokens across fields with category and year filters', async ({ page }) => {
  await page.goto('/search')

  const input = page.locator('#search-input')
  const results = page.locator('.competition-editorials__title')

  await input.fill('CPC University')
  await expect(results).toHaveCount(2)
  await page.locator('#year-filter').selectOption('2026')
  await expectCpcResult(page)
  await page.locator('#category-filter').selectOption('University')
  await expectCpcResult(page)
  await expect(
    page.locator('.match-chip').filter({ hasText: 'Category' }).locator('mark'),
  ).toHaveText(['University'])

  await page.locator('#category-filter').selectOption('Olympiad')
  await expect(results).toHaveCount(0)
  await input.fill('2026 CPC')
  await expect(results).toHaveCount(1)
  await expect(results).toHaveAttribute('href', '/editorials/olympiad-2026')
  await page.locator('#year-filter').selectOption('2025')
  await expect(results).toHaveCount(0)
})

test('ranks exact fields, whole words, substrings and metadata while keeping stable contest groups', async ({
  page,
}) => {
  const rankedIndex = {
    ...editorialIndex,
    editorials: [
      { id: 'metadata', contest: 'A metadata', title: 'Guide', filename: 'A.pdf' },
      { id: 'substring', contest: 'ICPC', title: 'ICPC 2026', filename: 'A.pdf' },
      { id: 'group-substring', contest: 'Finals', title: 'ICPC 2026', filename: 'A.pdf' },
      { id: 'word-b', contest: 'Finals', title: '2026 CPC Finals B', filename: 'B.pdf' },
      { id: 'word-a', contest: 'Finals', title: '2026 CPC Finals A', filename: 'A.pdf' },
      { id: 'exact-contest', contest: 'CPC', title: 'Guide', filename: 'A.pdf' },
      { id: 'exact-title', contest: 'Z organizers', title: 'CPC', filename: 'A.pdf' },
    ].map(({ title, ...record }) => ({
      ...editorialIndex.editorials[0],
      ...record,
      title: { en: title },
      summary: { en: '2026 CPC' },
    })),
  }

  await page.route('**/data/editorial-index.json', (route) => route.fulfill({ json: rankedIndex }))
  await page.goto('/search?q=CPC')

  const expectedGroups = ['CPC', 'Z organizers', 'Finals', 'ICPC', 'A metadata']
  const expectedResults = [
    'Guide',
    'CPC',
    '2026 CPC Finals A',
    '2026 CPC Finals B',
    'ICPC 2026',
    'ICPC 2026',
    'Guide',
  ]

  await expect(page.locator('.card__title')).toHaveText(expectedGroups)
  await expect(page.locator('.competition-editorials__title')).toHaveText(expectedResults)
  await page.reload()
  await expect(page.locator('.card__title')).toHaveText(expectedGroups)
  await expect(page.locator('.competition-editorials__title')).toHaveText(expectedResults)
})

test('highlights literal punctuation, overlapping tokens and distant matches in every matched field', async ({
  page,
}) => {
  const title = `2026 ${'contest '.repeat(20)}(CPC)`

  await page.route('**/data/editorial-index.json', (route) =>
    route.fulfill({
      json: {
        ...editorialIndex,
        editorials: [
          {
            ...editorialIndex.editorials[0],
            title: { en: title },
            summary: { en: 'C++ [final] solutions' },
          },
        ],
      },
    }),
  )
  await page.goto(`/search?${new URLSearchParams({ q: '2026 CPC PC C++ [final]' })}`)
  await expectCpcResult(page)
  await expect(page.locator('.competition-editorials__title mark')).toHaveText(['2026', 'CPC'])
  await expect(
    page.locator('.match-chip').filter({ hasText: 'Summary' }).locator('mark'),
  ).toHaveText(['C++', '[final]'])

  await page.locator('#search-input').fill('2026 .*')
  await expect(page.locator('.competition-editorials__title')).toHaveCount(0)
})

test('prioritizes complete multi-word titles and contests in the real index', async ({ page }) => {
  await page.unroute('**/data/editorial-index.json')
  await page.goto('/search')

  const title = 'Day 2 - Jingzhe Tang Contest'

  for (const query of [
    title,
    '  DAY  2  -  JINGZHE  TANG  CONTEST  ',
    'Contest Tang Jingzhe - 2 Day',
  ]) {
    await page.locator('#search-input').fill(query)
    await expect(page.locator('.competition-editorials__title').first()).toHaveText(title)
  }

  await page.locator('#search-input').fill('Welcome Contest')
  await expect(page.locator('.card__title').first()).toHaveText('Welcome Contest')
})

test('highlights overlapping tokens and Unicode lowercase expansions without shifting the text', async ({
  page,
}) => {
  const title = '🏆 İstanbul ICPC 2026'

  await page.route('**/data/editorial-index.json', (route) =>
    route.fulfill({
      json: {
        ...editorialIndex,
        editorials: [
          {
            ...editorialIndex.editorials[0],
            title: { en: title },
            summary: { en: 'İstanbul 2026' },
          },
        ],
      },
    }),
  )
  await page.goto('/search')

  for (const query of ['İstanbul ICP CPC 2026', '2026 cpc icp i\u0307stanbul']) {
    await page.locator('#search-input').fill(query)
    await expectCpcResult(page)
    await expect(page.locator('.competition-editorials__title')).toHaveText(title)
    await expect(page.locator('.competition-editorials__title mark')).toHaveText([
      'İstanbul',
      'ICPC',
      '2026',
    ])
    await expect(
      page.locator('.match-chip').filter({ hasText: 'Summary' }).locator('mark'),
    ).toHaveText(['İstanbul', '2026'])
  }

  await page.locator('#search-input').fill('i ICP CPC 2026')
  await expect(page.locator('.competition-editorials__title mark')).toHaveText([
    'İ',
    'ICPC',
    '2026',
  ])
})

for (const locale of [
  {
    language: 'en',
    name: 'Programming contest',
    label: 'Matched fields',
    entry: 'Entry',
    summary: 'Summary',
    filename: 'Filename',
    year: '2026',
  },
  {
    language: 'ko',
    name: '프로그래밍 경진대회',
    label: '일치한 필드',
    entry: '항목',
    summary: '요약',
    filename: '파일명',
    year: '2026년',
  },
  {
    language: 'ja',
    name: 'プログラミングコンテスト',
    label: '一致した項目',
    entry: '項目',
    summary: '概要',
    filename: 'ファイル名',
    year: '2026年',
  },
]) {
  test(`deduplicates match context and keeps long titles readable in ${locale.language}`, async ({
    page,
  }, testInfo) => {
    const title = `2026 ${`${locale.name} `.repeat(12)}CPC`
    const baseRecord = {
      ...editorialIndex.editorials[0],
      title: { [locale.language]: title },
      problem: title.toUpperCase().replace(/ /gu, '  '),
      filename: `${title.toUpperCase()}.PDF`,
    }
    await page.addInitScript((language) => {
      localStorage.setItem('cp-editorial-language', language)
    }, locale.language)
    await page.route('**/data/editorial-index.json', (route) =>
      route.fulfill({
        json: {
          ...editorialIndex,
          editorials: [
            { ...baseRecord, id: 'duplicate' },
            {
              ...baseRecord,
              id: 'summary',
              summary: { [locale.language]: '2026 detailed solutions' },
            },
            {
              ...baseRecord,
              id: 'original-entry',
              problem: '2026 Original entry',
              summary: { [locale.language]: '2026   ORIGINAL entry' },
              filename: '2026 original entry.PDF',
            },
          ],
        },
      }),
    )
    await page.goto('/search?q=2026')

    const row = (id: string) =>
      page.locator('.competition-editorials__item').filter({
        has: page.locator(`a[href="/editorials/${id}"]`),
      })
    await expect(row('duplicate').locator('.match-list')).toHaveCount(0)
    await expect(row('summary').getByRole('list', { name: locale.label })).toBeVisible()
    await expect(row('summary').locator('.match-chip__field')).toHaveText([locale.summary])
    await expect(row('summary').locator('.match-chip__value')).toHaveText([
      '2026 detailed solutions',
    ])
    await expect(row('original-entry').locator('.match-chip__field')).toHaveText([locale.entry])
    await expect(row('original-entry').locator('.match-chip__value')).toHaveText([
      '2026 Original entry',
    ])

    await page.locator('#search-input').fill('2026 CPC')
    for (const width of [1280, 375]) {
      await page.setViewportSize({ width, height: 900 })
      const titleLink = row('duplicate').locator('.competition-editorials__title')
      await expect(titleLink).toHaveText(title)
      await expect(titleLink).toHaveAccessibleName(title)
      await expect(titleLink.locator('mark')).toHaveText(['2026', 'CPC'])
      await expect(row('duplicate').locator('.result-context__item')).toHaveText([
        'University',
        locale.year,
      ])
      expect(
        await titleLink.evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
      ).toBe(true)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true)
      await row('duplicate').screenshot({ path: testInfo.outputPath(`context-${width}.png`) })
    }

    for (const [query, highlight] of [
      ['2026 .pdf', '.PDF'],
      ['pdf', 'PDF'],
      ['cpc.pdf', 'CPC.PDF'],
    ]) {
      await page.locator('#search-input').fill(query)
      await expect(row('duplicate').locator('.match-chip__field')).toHaveText([locale.filename])
      await expect(row('duplicate').locator('.match-chip mark').last()).toHaveText(highlight)
    }
  })
}

test('retains distinct matching context for tokens spread across every field', async ({ page }) => {
  await page.route('**/data/editorial-index.json', (route) =>
    route.fulfill({
      json: {
        ...editorialIndex,
        editorials: [
          {
            ...editorialIndex.editorials[0],
            title: { en: 'Title 2026' },
            contest: 'Contest 2026',
            problem: 'Entry 2026',
            categories: ['Category 2026'],
            summary: { en: 'Summary 2026' },
            filename: 'File 2026.pdf',
          },
        ],
      },
    }),
  )
  await page.goto('/search?q=title+contest+entry+category+summary+file')
  await expectCpcResult(page)
  await expect(page.locator('.competition-editorials__title mark')).toHaveText(['Title'])
  await expect(page.locator('.match-chip__field')).toHaveText([
    'Contest',
    'Entry',
    'Category',
    'Summary',
    'Filename',
  ])
  await expect(page.locator('.match-chip mark')).toHaveText([
    'Contest',
    'Entry',
    'Category',
    'Summary',
    'File',
  ])
})
