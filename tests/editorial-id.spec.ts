import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import {
  createStableEditorialId,
  normalizeEditorialRecord,
} from '../src/entities/editorial/model/normalize'
import type { RawEditorialRecord } from '../src/entities/editorial/model/types'
import { buildEditorialPreviewImagePath } from '../src/shared/hooks/usePageMetadata'
import { generatePreviews, preparePreviewProject } from './fixtures/preview-project'

const cases = [
  { problem: '2026 CPC', expectedId: 'ed-1jds1ef' },
  { problem: '2026 대회', expectedId: 'ed-3cqq6h' },
  { problem: '2026 𠮷 대회', expectedId: 'ed-1gk8pfb' },
  { problem: '2026 🦆 대회', expectedId: 'ed-1n4189j' },
  { problem: '2026 🦆 대회', id: '  published-🦆  ', expectedId: 'published-🦆' },
]
const records: RawEditorialRecord[] = cases.map(({ problem, id }) => ({
  id,
  contest: 'University',
  problem,
  path: `University/${problem}.pdf`,
  filename: `${problem}.pdf`,
  title: { en: problem },
}))

test('preserves published IDs, trimming, case folding, and blank ID fallback', () => {
  for (const [index, record] of records.entries()) {
    expect(normalizeEditorialRecord(record).id).toBe(cases[index].expectedId)
  }

  const record = records[0]
  const paddedRecord = {
    ...record,
    id: '   ',
    contest: ` ${record.contest.toUpperCase()} `,
    problem: ` ${record.problem.toUpperCase()} `,
    path: ` ${record.path.toUpperCase()} `,
  }
  expect(createStableEditorialId(paddedRecord)).toBe(cases[0].expectedId)
  expect(normalizeEditorialRecord(paddedRecord).id).toBe(cases[0].expectedId)
  expect(normalizeEditorialRecord(record).summary).toEqual({})

  for (const invalid of [
    { contest: '' },
    { problem: '' },
    { path: '' },
    { path: 'University/../contest.pdf' },
    { filename: '' },
    { title: {} },
    { summary: {} },
  ]) {
    expect(() => normalizeEditorialRecord({ ...record, ...invalid })).toThrow(
      'Invalid editorial index:',
    )
  }
})

test('generates Unicode route pages and images at the IDs used by the browser', async ({
  page,
}, testInfo) => {
  const root = testInfo.outputPath('preview-project')
  await preparePreviewProject(root, records)
  const editorialIndex = { editorials: records }
  await generatePreviews(root)

  await page.route('**/data/editorial-index.json', (route) =>
    route.fulfill({ json: editorialIndex }),
  )
  for (const [index, record] of records.entries()) {
    const id = normalizeEditorialRecord(record).id
    expect(id).toBe(cases[index].expectedId)
    const routePath = `/editorials/${encodeURIComponent(id)}`
    const imagePath = buildEditorialPreviewImagePath(id)
    const imageUrl = `https://editorial.coduck.io${imagePath}`
    const html = await readFile(path.join(root, 'dist', routePath, 'index.html'), 'utf8')
    expect(html).toContain(`<link rel="canonical" href="https://editorial.coduck.io${routePath}"`)
    expect(html).toContain(`<meta property="og:image" content="${imageUrl}"`)
    expect(html).toContain(`<meta name="twitter:image" content="${imageUrl}"`)
    const image = await readFile(path.join(root, 'dist', imagePath.split('?')[0]))
    expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')

    await page.goto(routePath)
    await expect(page.getByRole('heading', { name: record.problem, exact: true })).toBeVisible()
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', imageUrl)
  }
})
