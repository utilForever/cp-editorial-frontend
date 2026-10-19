import { expect, test } from '@playwright/test'
import type * as EditorialRepository from '../src/shared/api/editorialRepository'

const editorialIndex = {
  version: 'index-reuse',
  editorials: [
    {
      id: 'cpc-2026',
      contest: 'CPC',
      problem: '2026 CPC',
      categories: ['University'],
      path: 'University/CPC/2026 CPC.pdf',
      filename: '2026 CPC.pdf',
      title: { en: '2026 CPC' },
    },
  ],
}

test('shares concurrent requests and the same normalized result', async ({ page }) => {
  let requests = 0
  await page.route('**/data/editorial-index.json', (route) => {
    requests += 1
    return route.fulfill({ json: editorialIndex })
  })
  await page.goto('/contribute')

  const result = await page.evaluate(async () => {
    const modulePath = '/src/shared/api/editorialRepository.ts'
    const { fetchEditorialIndex, getCachedEditorialIndex } = (await import(
      modulePath
    )) as typeof EditorialRepository
    const first = fetchEditorialIndex()
    const second = fetchEditorialIndex()
    const [firstIndex, secondIndex] = await Promise.all([first, second])
    const cachedIndex = await fetchEditorialIndex()
    return {
      sameRequest: first === second,
      sameIndex: firstIndex === secondIndex && firstIndex === cachedIndex,
      cached: getCachedEditorialIndex() === firstIndex,
      summary: firstIndex.editorials[0].summary,
    }
  })

  expect(result).toEqual({ sameRequest: true, sameIndex: true, cached: true, summary: {} })
  expect(requests).toBe(1)
})

test('reuses data without loading flashes across routes and refreshes on reload', async ({
  page,
}) => {
  let requests = 0
  await page.route('**/data/editorial-index.json', (route) => {
    requests += 1
    return route.fulfill({ json: { ...editorialIndex, version: `deployment-${requests}` } })
  })
  await page.goto('/')
  await expect(page.getByText('deployment-1', { exact: true })).toBeVisible()

  await page.evaluate(() => {
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.textContent?.includes('Loading editorial index...')) {
            document.body.dataset.indexLoading = 'true'
          }
        }
      }
    }).observe(document.querySelector('main')!, { childList: true, subtree: true })
  })

  await page.locator('nav a[href="/search"]').click()
  await page.locator('#search-input').fill('CPC')
  await page.locator('.competition-editorials__title').click()
  await expect(page).toHaveURL('/editorials/cpc-2026')
  await expect(page.getByRole('heading', { name: '2026 CPC', exact: true })).toBeVisible()
  await page.goBack()
  await expect(page.locator('.competition-editorials__title')).toBeVisible()
  await page.locator('.layout__nav-desktop a[href="/categories"]').click()
  await page.locator('.card__title').click()
  await expect(page).toHaveURL('/categories/University')
  await page.locator('.card__title').click()
  await expect(page).toHaveURL('/categories/University/CPC')
  await page.locator('.layout__brand').click()
  await expect(page.getByText('deployment-1', { exact: true })).toBeVisible()
  expect(requests).toBe(1)
  await expect(page.locator('body')).not.toHaveAttribute('data-index-loading', 'true')

  await page.reload()
  await expect(page.getByText('deployment-2', { exact: true })).toBeVisible()
  expect(requests).toBe(2)
})

for (const failure of ['network', 'http', 'json', 'validation']) {
  test(`recovers from a ${failure} failure on later navigation`, async ({ page }) => {
    let requests = 0
    await page.route('**/data/editorial-index.json', (route) => {
      requests += 1
      if (requests > 1) {
        return route.fulfill({ json: editorialIndex })
      }
      if (failure === 'network') {
        return route.abort('failed')
      }
      if (failure === 'http') {
        return route.fulfill({ status: 503 })
      }
      if (failure === 'json') {
        return route.fulfill({ contentType: 'application/json', body: '{' })
      }
      return route.fulfill({
        json: { editorials: [{ ...editorialIndex.editorials[0], title: {} }] },
      })
    })
    await page.goto('/')
    await expect(page.locator('main .error')).toBeVisible()
    if (failure === 'http') {
      await expect(page.locator('main .error')).toHaveText('Unable to fetch editorial index (503).')
    }
    if (failure === 'validation') {
      await expect(page.locator('main .error')).toHaveText(
        'Invalid editorial index: "title" must contain at least one locale.',
      )
    }
    expect(requests).toBe(1)

    await page.locator('.layout__nav-desktop a[href="/categories"]').click()
    await expect(page.locator('.card__title')).toHaveText('University')
    await page.locator('.layout__brand').click()
    await expect(page.getByText('index-reuse', { exact: true })).toBeVisible()
    await expect(page.locator('main .error')).toHaveCount(0)
    expect(requests).toBe(2)
  })
}
