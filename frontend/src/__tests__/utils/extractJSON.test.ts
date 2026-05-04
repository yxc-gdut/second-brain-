import { describe, it, expect } from 'vitest'
import { extractJSON } from '@/utils/extractJSON'

describe('extractJSON', () => {
  it('parses direct JSON array', () => {
    const result = extractJSON('["产品", "技术", "设计"]')
    expect(result).toEqual(['产品', '技术', '设计'])
  })

  it('parses JSON array with extra text before', () => {
    const result = extractJSON('这是标签列表：["产品", "技术", "设计"]')
    expect(result).toEqual(['产品', '技术', '设计'])
  })

  it('parses JSON array with extra text after', () => {
    const result = extractJSON('["产品", "技术"]\n以上是标签')
    expect(result).toEqual(['产品', '技术'])
  })

  it('handles JSON array of numbers (converts to strings)', () => {
    const result = extractJSON('[1, 2, 3]')
    expect(result).toEqual(['1', '2', '3'])
  })

  it('falls back to splitting by comma when not valid JSON', () => {
    const result = extractJSON('产品,技术,设计,运营')
    expect(result).toEqual(['产品', '技术', '设计', '运营'])
  })

  it('falls back to splitting by newline', () => {
    const result = extractJSON('产品\n技术\n设计')
    expect(result).toEqual(['产品', '技术', '设计'])
  })

  it('handles Chinese comma as separator', () => {
    const result = extractJSON('产品，技术，设计')
    expect(result).toEqual(['产品', '技术', '设计'])
  })

  it('strips quotes from items in fallback mode', () => {
    const result = extractJSON('"产品", "技术", "设计"')
    expect(result).toEqual(['产品', '技术', '设计'])
  })

  it('filters out empty strings', () => {
    const result = extractJSON('产品,,,技术')
    expect(result).toEqual(['产品', '技术'])
  })

  it('filters out items longer than 20 chars', () => {
    const longTag = '这是一个超过二十个字符的长标签名称用以测试长度限制'
    const result = extractJSON(`短,${longTag},正常`)
    expect(result).toEqual(['短', '正常'])
  })

  it('limits to 5 items in fallback mode', () => {
    const result = extractJSON('a,b,c,d,e,f,g')
    expect(result).toHaveLength(5)
    expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('handles JSON array across multiple lines', () => {
    const result = extractJSON('[\n  "产品",\n  "技术",\n  "设计"\n]')
    expect(result).toEqual(['产品', '技术', '设计'])
  })

  it('returns empty array for empty input', () => {
    const result = extractJSON('')
    expect(result).toEqual([])
  })
})
