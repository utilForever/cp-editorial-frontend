export type LocaleCode = 'en' | 'ko' | 'ja'

export type LocalizedContent = Record<string, string>

export interface RawEditorialRecord {
  id?: string
  contest: string
  problem: string
  categories?: string[]
  path: string
  filename: string
  title: LocalizedContent
  summary?: LocalizedContent
  updatedAt?: string
}

export interface RawEditorialIndex {
  version?: string
  generatedAt?: string
  editorials: RawEditorialRecord[]
}

export interface EditorialRecord {
  id: string
  contest: string
  problem: string
  categories: string[]
  path: string
  filename: string
  title: LocalizedContent
  summary: LocalizedContent
  updatedAt?: string
}

export interface EditorialIndex {
  version: string
  generatedAt?: string
  editorials: EditorialRecord[]
}
