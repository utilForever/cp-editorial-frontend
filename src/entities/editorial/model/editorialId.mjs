/** @param {Pick<import('./types').RawEditorialRecord, 'contest' | 'problem' | 'path'>} record */
export function createStableEditorialId(record) {
  const base =
    `${record.contest.trim()}::${record.problem.trim()}::${record.path.trim()}`.toLowerCase()
  let hash = 0

  // Keep UTF-16 code-unit hashing to preserve published runtime IDs.
  for (let index = 0; index < base.length; index += 1) {
    hash = (hash * 31 + base.charCodeAt(index)) >>> 0
  }

  return `ed-${hash.toString(36)}`
}
