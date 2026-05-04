import { describe, it, expect } from 'vitest'
import { truncateText, normalizeWhitespace, formatRelativeTime, formatNoteSummary, slugify } from '@/utils/format'

describe('truncateText', () => {
  it('returns original text if shorter than maxLength', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('returns original text if equal to maxLength', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })

  it('truncates and adds ellipsis', () => {
    expect(truncateText('hello world', 5)).toBe('hello...')
  })

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('')
  })
})

describe('normalizeWhitespace', () => {
  it('replaces newlines with spaces', () => {
    expect(normalizeWhitespace('line1\nline2')).toBe('line1 line2')
  })

  it('collapses multiple spaces', () => {
    expect(normalizeWhitespace('a  b   c')).toBe('a b c')
  })

  it('trims leading/trailing whitespace', () => {
    expect(normalizeWhitespace('  hello  ')).toBe('hello')
  })

  it('handles complex whitespace', () => {
    expect(normalizeWhitespace('  a\n\nb  c  \n  ')).toBe('a b c')
  })
})

describe('formatRelativeTime', () => {
  it('returns "刚刚" for very recent dates', () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('刚刚')
  })

  it('returns minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(date)).toBe('5分钟前')
  })

  it('returns hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(date)).toBe('3小时前')
  })

  it('returns "昨天" for 1 day ago', () => {
    const date = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(date)).toBe('昨天')
  })

  it('returns days ago for recent days', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(date)).toBe('3天前')
  })

  it('returns formatted date for old dates', () => {
    const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    const result = formatRelativeTime(date)
    // Should contain month/day, not relative time
    expect(result).not.toContain('前')
  })
})

describe('formatNoteSummary', () => {
  it('strips markdown headers', () => {
    expect(formatNoteSummary('# 标题\n内容')).toContain('标题')
  })

  it('strips bold/italic', () => {
    expect(formatNoteSummary('这是**加粗**的文字')).toContain('这是加粗的文字')
  })

  it('strips images', () => {
    const result = formatNoteSummary('文字![图片](url)更多文字')
    expect(result).not.toContain('![')
    expect(result).toContain('文字')
  })

  it('strips links but keeps text', () => {
    expect(formatNoteSummary('查看[链接文字](http://example.com)')).toContain('链接文字')
  })

  it('truncates to maxLength', () => {
    const longText = 'A'.repeat(200)
    const result = formatNoteSummary(longText, 100)
    expect(result.length).toBeLessThanOrEqual(100)
  })

  it('handles empty string', () => {
    expect(formatNoteSummary('')).toBe('')
  })
})

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('replaces special chars with hyphens', () => {
    expect(slugify('test@#$123')).toBe('test-123')
  })

  it('handles Chinese characters', () => {
    expect(slugify('会议纪要')).toBe('会议纪要')
  })

  it('removes leading/trailing hyphens', () => {
    expect(slugify('---test---')).toBe('test')
  })

  it('limits to 50 characters', () => {
    const long = 'A'.repeat(100)
    expect(slugify(long).length).toBeLessThanOrEqual(50)
  })
})
