import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { resources } from '../src/shared/i18n/resources'

const sourcePattern = 'https://raw.githubusercontent.com/utilForever/cp-editorial-data/**'
const pdfBody = '%PDF-1.4\n%%EOF\n'
const editorialIndex = {
  editorials: ['sample.pdf', 'other.PDF', '해설 #1.MD', 'notes.txt'].map((filename, index) => ({
    id: `file-${index}`,
    contest: 'CPC',
    problem: filename,
    categories: ['University'],
    path: `University/CPC/${filename}`,
    filename,
    title: { en: filename },
  })),
}

declare global {
  interface Window {
    viewerProbe: {
      created: string[]
      revoked: string[]
      signals: AbortSignal[]
      finishBody?: () => void
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.route('**/data/editorial-index.json', (route) =>
    route.fulfill({ json: editorialIndex }),
  )
  await page.addInitScript(() => {
    window.viewerProbe = { created: [], revoked: [], signals: [] }
    const originalFetch = globalThis.fetch
    globalThis.fetch = (input, init) => {
      const url = input instanceof Request ? input.url : input.toString()
      if (url.startsWith('https://raw.githubusercontent.com/') && init?.signal) {
        window.viewerProbe.signals.push(init.signal)
      }
      return originalFetch(input, init)
    }
    const createObjectURL = URL.createObjectURL.bind(URL)
    URL.createObjectURL = (blob) => {
      const url = createObjectURL(blob)
      window.viewerProbe.created.push(url)
      return url
    }
    const revokeObjectURL = URL.revokeObjectURL.bind(URL)
    URL.revokeObjectURL = (url) => {
      window.viewerProbe.revoked.push(url)
      revokeObjectURL(url)
    }
  })
})

async function navigateToViewer(page: Page, id: string) {
  await page.evaluate((id) => {
    history.pushState(null, '', `/editorials/${id}/view`)
    dispatchEvent(new PopStateEvent('popstate'))
  }, id)
}

for (const locale of ['en', 'ko', 'ja'] as const) {
  test(`recovers from timeout and HTTP failure in ${locale}`, async ({ page }) => {
    const labels = resources[locale].translation.editorial
    await page.addInitScript((locale) => {
      localStorage.setItem('cp-editorial-language', locale)
    }, locale)
    await page.clock.install()
    let outcome: 'pending' | 'http' | 'success' = 'pending'
    await page.route(sourcePattern, (route) => {
      if (outcome === 'pending') return
      return route.fulfill({
        status: outcome === 'http' ? 503 : 200,
        contentType: 'application/octet-stream',
        body: pdfBody,
      })
    })

    await page.goto('/editorials/file-0/view')
    await expect(page.getByRole('status')).toHaveText(labels.viewerLoading)
    await expect.poll(() => page.evaluate(() => window.viewerProbe.signals.length)).toBe(1)
    await page.clock.fastForward(15001)
    await expect(page.getByRole('alert')).toHaveText(labels.viewerTimeout)
    await expect(page.getByText(labels.viewerTimeoutDescription, { exact: true })).toBeVisible()
    expect(await page.evaluate(() => window.viewerProbe.signals[0].aborted)).toBe(true)

    outcome = 'http'
    await page.getByRole('button', { name: labels.retry, exact: true }).click()
    await expect(page.getByRole('alert')).toHaveText(labels.viewerLoadFailed)
    await expect(page.getByText(labels.viewerFailureDescription, { exact: true })).toBeVisible()
    const fallback = page.getByRole('region', { name: labels.viewerFailureActions })
    await expect(fallback.locator('a[target="_blank"]')).toHaveAttribute(
      'href',
      'https://raw.githubusercontent.com/utilForever/cp-editorial-data/main/University/CPC/sample.pdf',
    )
    await expect(fallback.getByRole('link', { name: labels.backToDetail })).toHaveAttribute(
      'href',
      '/editorials/file-0',
    )
    await page.clock.fastForward(15001)
    await expect(page.getByRole('alert')).toHaveText(labels.viewerLoadFailed)
    expect(await page.evaluate(() => window.viewerProbe.signals[1].aborted)).toBe(false)

    outcome = 'success'
    await page.getByRole('button', { name: labels.retry, exact: true }).click()
    const viewer = page.locator('object')
    await expect(viewer).toHaveAttribute('type', 'application/pdf')
    await expect(viewer).toHaveAttribute('data', /^blob:/)
    await expect(viewer).toHaveAttribute(
      'aria-label',
      labels.viewAria.replace('{{title}}', 'sample.pdf'),
    )
    await expect(page.getByRole('status')).toHaveCount(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    const url = (await viewer.getAttribute('data'))!
    expect(
      await page.evaluate(async (url) => (await fetch(url)).headers.get('Content-Type'), url),
    ).toBe('application/pdf')
    await page.clock.fastForward(15001)
    expect(await page.evaluate(() => window.viewerProbe.signals[2].aborted)).toBe(false)

    await page.getByRole('link', { name: labels.backToDetail, exact: true }).first().click()
    await expect(page).toHaveURL('/editorials/file-0')
    await expect.poll(() => page.evaluate(() => window.viewerProbe.revoked)).toEqual([url])
    expect(
      await page.evaluate(() => window.viewerProbe.signals.every((signal) => signal.aborted)),
    ).toBe(true)
  })

  test(`opens Markdown and text sources without a PDF request in ${locale}`, async ({ page }) => {
    const labels = resources[locale].translation.editorial
    await page.addInitScript((locale) => {
      localStorage.setItem('cp-editorial-language', locale)
    }, locale)
    await page.goto('/editorials/file-2/view')
    for (const id of ['file-2', 'file-3']) {
      await navigateToViewer(page, id)
      await expect(page.getByText(labels.viewerSourceDescription, { exact: true })).toBeVisible()
      const source = page.getByRole('link', { name: labels.openSource, exact: true })
      const filename = id === 'file-2' ? '해설 #1.MD' : 'notes.txt'
      await expect(source).toHaveAttribute(
        'href',
        `https://raw.githubusercontent.com/utilForever/cp-editorial-data/main/University/CPC/${encodeURIComponent(filename)}`,
      )
      await expect(source).toHaveAttribute('target', '_blank')
      await expect(source).toHaveAttribute('rel', 'noreferrer')
      await expect(page.locator('object')).toHaveCount(0)
      await expect(page.getByRole('status')).toHaveCount(0)
      await expect(page.getByRole('button', { name: labels.retry, exact: true })).toHaveCount(0)
    }
    expect(await page.evaluate(() => window.viewerProbe.signals.length)).toBe(0)
    expect(await page.evaluate(() => window.viewerProbe.created)).toEqual([])
  })
}

test('retries a network failure', async ({ page }) => {
  await page.route(sourcePattern, (route) => route.abort('failed'))
  await page.goto('/editorials/file-0/view')
  await expect(page.getByRole('alert')).toHaveText(
    resources.en.translation.editorial.viewerLoadFailed,
  )
  await page.unroute(sourcePattern)
  await page.route(sourcePattern, (route) => route.fulfill({ body: pdfBody }))
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.locator('object')).toHaveAttribute('data', /^blob:/)
})

for (const action of ['retry', 'navigate'] as const) {
  test(`ignores a late response body after ${action} and cleans up route changes`, async ({
    page,
  }) => {
    await page.clock.install()
    await page.route(sourcePattern, (route) => route.fulfill({ body: pdfBody }))
    await page.goto('/contribute')
    await page.evaluate(() => {
      const originalFetch = globalThis.fetch
      globalThis.fetch = (input, init) => {
        const url = input instanceof Request ? input.url : input.toString()
        if (!url.endsWith('/sample.pdf')) return originalFetch(input, init)
        if (init?.signal) window.viewerProbe.signals.push(init.signal)
        const response = new Response('')
        response.arrayBuffer = () =>
          new Promise<ArrayBuffer>((resolve) => {
            // Deliberately finish after abort to exercise the stale-response guard.
            window.viewerProbe.finishBody = () =>
              resolve(new TextEncoder().encode('old PDF').buffer)
          })
        return Promise.resolve(response)
      }
    })
    await navigateToViewer(page, 'file-0')
    await expect.poll(() => page.evaluate(() => Boolean(window.viewerProbe.finishBody))).toBe(true)

    if (action === 'retry') {
      await page.clock.fastForward(15001)
      await expect(page.getByRole('alert')).toHaveText(
        resources.en.translation.editorial.viewerTimeout,
      )
      await page.evaluate(() => {
        const originalFetch = globalThis.fetch
        globalThis.fetch = (input, init) => {
          const url = input instanceof Request ? input.url : input.toString()
          if (!url.endsWith('/sample.pdf')) return originalFetch(input, init)
          if (init?.signal) window.viewerProbe.signals.push(init.signal)
          return Promise.resolve(new Response('new PDF'))
        }
      })
      await page.getByRole('button', { name: 'Retry', exact: true }).click()
    } else {
      await navigateToViewer(page, 'file-1')
    }

    await expect(page.locator('object')).toHaveAttribute('data', /^blob:/)
    const url = (await page.locator('object').getAttribute('data'))!
    expect(await page.evaluate(() => window.viewerProbe.signals[0].aborted)).toBe(true)
    await page.evaluate(async () => {
      window.viewerProbe.finishBody!()
      await new Promise((resolve) => requestAnimationFrame(resolve))
    })
    await expect(page.locator('object')).toHaveAttribute('data', url)
    expect(await page.evaluate(() => window.viewerProbe.created)).toEqual([url])
    await page.clock.fastForward(15001)
    expect(
      await page.evaluate(
        () => window.viewerProbe.signals[window.viewerProbe.signals.length - 1].aborted,
      ),
    ).toBe(false)

    await navigateToViewer(page, 'file-2')
    await expect(page.getByRole('link', { name: 'Open source file', exact: true })).toBeVisible()
    await expect(page.locator('object')).toHaveCount(0)
    expect(await page.evaluate(() => window.viewerProbe.revoked)).toEqual([url])
    await page.clock.fastForward(15001)
    await expect(page.getByRole('alert')).toHaveCount(0)
  })
}

test('cancels a pending request on navigation without showing a timeout', async ({ page }) => {
  await page.clock.install()
  await page.route(sourcePattern, () => undefined)
  await page.goto('/editorials/file-0/view')
  await expect.poll(() => page.evaluate(() => window.viewerProbe.signals.length)).toBe(1)
  await page.getByRole('link', { name: 'Back to editorial', exact: true }).click()
  await expect(page).toHaveURL('/editorials/file-0')
  await expect.poll(() => page.evaluate(() => window.viewerProbe.signals[0].aborted)).toBe(true)
  await page.clock.fastForward(15001)
  await expect(page.getByRole('alert')).toHaveCount(0)
  expect(await page.evaluate(() => window.viewerProbe.created)).toEqual([])
})
