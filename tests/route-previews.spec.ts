import { appendFile, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import sharp from 'sharp'
import type { RawEditorialRecord } from '../src/entities/editorial/model/types'
import { generatePreviews, preparePreviewProject } from './fixtures/preview-project'

test('compresses previews and reuses them after dist is cleared', async () => {
  const root = test.info().outputPath('preview-project')
  const records: RawEditorialRecord[] = [
    {
      id: 'korean',
      contest: '대전과학고등학교',
      problem: '제1회 대전과학고등학교 프로그래밍 경진대회 DSHStack',
      path: 'School/대전과학고등학교/DSHStack.pdf',
      filename: 'DSHStack.pdf',
      categories: ['School'],
      title: { ko: '제1회 대전과학고등학교 프로그래밍 경진대회 DSHStack' },
    },
    {
      id: 'long-title',
      contest: 'Taiwan',
      problem: 'The 2020 ICPC Asia Taipei-Hsinchu Site Programming Contest',
      path: 'ICPC/Taiwan/2020.pdf',
      filename: '2020.pdf',
      categories: ['ICPC'],
      title: { en: 'The 2020 ICPC Asia Taipei-Hsinchu Site Programming Contest' },
    },
  ]
  const imageDirectory = path.join(root, 'dist/images/editorials')
  const cacheDirectory = path.join(root, '.cache/route-previews')
  const readImages = () =>
    Promise.all(records.map((record) => readFile(path.join(imageDirectory, `${record.id}.png`))))

  await preparePreviewProject(root, records)
  expect(await generatePreviews(root)).toContain('2 editorial images; reused 0 images')
  const originalImages = await readImages()
  for (const image of originalImages) {
    expect(image.length).toBeLessThan(500_000)
    expect(await sharp(image).metadata()).toMatchObject({
      format: 'png',
      width: 1200,
      height: 630,
      isPalette: true,
    })
    await sharp(image).raw().toBuffer()
  }

  await rm(path.join(root, 'dist'), { recursive: true })
  await preparePreviewProject(root, records)
  expect(await generatePreviews(root)).toContain('0 editorial images; reused 2 images')
  expect(await readImages()).toEqual(originalImages)

  records[0].title = { ko: '변경된 대회 해설' }
  await writeFile(
    path.join(root, 'dist/data/editorial-index.json'),
    JSON.stringify({ editorials: records }),
  )
  expect(await generatePreviews(root)).toContain('1 editorial images; reused 1 images')
  const changedImages = await readImages()
  expect(changedImages[0].equals(originalImages[0])).toBe(false)
  expect(changedImages[1].equals(originalImages[1])).toBe(true)

  for (const file of [
    'scripts/generate-route-previews.mjs',
    ...(await readdir(path.join(root, 'scripts/assets/fonts')))
      .filter((file) => /\.(otf|ttf)$/.test(file))
      .map((file) => `scripts/assets/fonts/${file}`),
    'dist/images/editorial-info-base.png',
    'package-lock.json',
  ]) {
    // Trailing whitespace changes each input's bytes without invalidating its format.
    await appendFile(path.join(root, file), '\n')
    expect(await generatePreviews(root), file).toContain('2 editorial images; reused 0 images')
    expect(await generatePreviews(root), file).toContain('0 editorial images; reused 2 images')
  }

  const cacheFiles = await readdir(cacheDirectory)
  expect(cacheFiles.every((file) => file.endsWith('.png'))).toBe(true)
  await rm(cacheDirectory, { recursive: true })
  expect(await generatePreviews(root)).toContain('2 editorial images; reused 0 images')
})

test('keeps Pretendard text and renders CJK and emoji fallbacks in titles and footers', async () => {
  const root = test.info().outputPath('preview-project')
  const records = [
    ['multilingual', 'ABC 한글 日本語 中文 𠮷 🦆 👩‍💻 👍🏽 🇰🇷'],
    ['wrapped-unicode', '𠮷👩‍💻'.repeat(20)],
  ].map(([id, text]) => ({
    id,
    contest: 'Coduck <2026> & 日本語 🦆',
    problem: text,
    path: `Unicode/${id}.pdf`,
    filename: `${id}.pdf`,
    title: { en: text },
    categories: [text],
  }))
  await preparePreviewProject(root, records)
  await generatePreviews(root)
  for (const { id } of records) {
    const image = await sharp(path.join(root, `dist/images/editorials/${id}.png`))
      .extract({ left: 80, top: 140, width: 700, height: 420 })
      .png()
      .toBuffer()
    expect(image).toMatchSnapshot(`${id}.png`, { maxDiffPixels: 0 })
  }
})
