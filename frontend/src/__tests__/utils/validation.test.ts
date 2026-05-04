import { describe, it, expect } from 'vitest'
import { validateNoteContent, validateNoteTitle, isValidCategory, isValidTagName, isValidSearchQuery } from '@/utils/validation'

describe('validateNoteContent', () => {
  it('rejects empty content', () => {
    const result = validateNoteContent('')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('笔记内容不能为空')
  })

  it('rejects whitespace-only content', () => {
    const result = validateNoteContent('   \n\t  ')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('笔记内容不能为空')
  })

  it('rejects content shorter than 2 characters', () => {
    const result = validateNoteContent('A')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('笔记内容至少需要 2 个字符')
  })

  it('accepts content with exactly 2 characters', () => {
    const result = validateNoteContent('AB')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects content longer than 50000 characters', () => {
    const longContent = 'A'.repeat(50001)
    const result = validateNoteContent(longContent)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('笔记内容不能超过 50000 个字符')
  })

  it('accepts content at boundary (50000)', () => {
    const content = 'A'.repeat(50000)
    const result = validateNoteContent(content)
    expect(result.valid).toBe(true)
  })

  it('accepts normal content', () => {
    const result = validateNoteContent('这是一条正常的笔记内容')
    expect(result.valid).toBe(true)
  })
})

describe('validateNoteTitle', () => {
  it('rejects empty title', () => {
    const result = validateNoteTitle('')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('标题不能为空')
  })

  it('rejects title longer than 100 characters', () => {
    const longTitle = 'A'.repeat(101)
    const result = validateNoteTitle(longTitle)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('标题不能超过 100 个字符')
  })

  it('accepts title at boundary (100)', () => {
    const title = 'A'.repeat(100)
    const result = validateNoteTitle(title)
    expect(result.valid).toBe(true)
  })

  it('rejects title with special characters', () => {
    const result = validateNoteTitle('Test<script>alert(1)</script>')
    expect(result.valid).toBe(false)
  })

  it('accepts normal title', () => {
    const result = validateNoteTitle('会议纪要 - 周一例会')
    expect(result.valid).toBe(true)
  })
})

describe('isValidCategory', () => {
  it('accepts "work"', () => {
    expect(isValidCategory('work')).toBe(true)
  })

  it('accepts "personal"', () => {
    expect(isValidCategory('personal')).toBe(true)
  })

  it('rejects other values', () => {
    expect(isValidCategory('other')).toBe(false)
    expect(isValidCategory('')).toBe(false)
    expect(isValidCategory('Work')).toBe(false)
  })
})

describe('isValidTagName', () => {
  it('accepts normal tag', () => {
    expect(isValidTagName('产品')).toBe(true)
  })

  it('rejects empty tag', () => {
    expect(isValidTagName('')).toBe(false)
  })

  it('rejects tag longer than 20 characters', () => {
    expect(isValidTagName('A'.repeat(21))).toBe(false)
  })

  it('accepts tag at boundary (20)', () => {
    expect(isValidTagName('A'.repeat(20))).toBe(true)
  })

  it('rejects tag with special characters', () => {
    expect(isValidTagName('test<script>')).toBe(false)
  })
})

describe('isValidSearchQuery', () => {
  it('accepts normal query', () => {
    expect(isValidSearchQuery('财务报告')).toBe(true)
  })

  it('rejects empty query', () => {
    expect(isValidSearchQuery('')).toBe(false)
  })

  it('rejects query longer than 200 characters', () => {
    expect(isValidSearchQuery('A'.repeat(201))).toBe(false)
  })
})
