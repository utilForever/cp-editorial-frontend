import { execFile } from 'node:child_process'
import { copyFile, cp, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import type { RawEditorialRecord } from '../../src/entities/editorial/model/types'

const execFileAsync = promisify(execFile)

export async function preparePreviewProject(root: string, records: RawEditorialRecord[]) {
  for (const [source, destination] of [
    ['scripts/generate-route-previews.mjs', 'scripts/generate-route-previews.mjs'],
    [
      'src/entities/editorial/model/editorialId.mjs',
      'src/entities/editorial/model/editorialId.mjs',
    ],
    ['public/images/editorial-info-base.png', 'dist/images/editorial-info-base.png'],
    ['index.html', 'dist/index.html'],
    ['package-lock.json', 'package-lock.json'],
  ]) {
    const target = path.join(root, destination)
    await mkdir(path.dirname(target), { recursive: true })
    await copyFile(source, target)
  }
  await cp('scripts/assets/fonts', path.join(root, 'scripts/assets/fonts'), { recursive: true })
  await mkdir(path.join(root, 'dist/data'), { recursive: true })
  await writeFile(
    path.join(root, 'dist/data/editorial-index.json'),
    JSON.stringify({ editorials: records }),
  )
}

export async function generatePreviews(root: string) {
  const { stdout } = await execFileAsync(process.execPath, [
    path.join(root, 'scripts/generate-route-previews.mjs'),
  ])
  return stdout
}
