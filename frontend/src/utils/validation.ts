/**
 * 笔记内容校验函数
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 校验笔记内容是否有效
 */
export function validateNoteContent(content: string): ValidationResult {
  const errors: string[] = []

  if (!content || content.trim().length === 0) {
    return { valid: false, errors: ['笔记内容不能为空'] }
  }

  if (content.trim().length < 2) {
    errors.push('笔记内容至少需要 2 个字符')
  }

  if (content.length > 50000) {
    errors.push('笔记内容不能超过 50000 个字符')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 校验笔记标题
 */
export function validateNoteTitle(title: string): ValidationResult {
  const errors: string[] = []

  if (!title || title.trim().length === 0) {
    return { valid: false, errors: ['标题不能为空'] }
  }

  if (title.length > 100) {
    errors.push('标题不能超过 100 个字符')
  }

  if (/[<>"'&]/.test(title)) {
    errors.push('标题不能包含特殊字符 < > " \' &')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 校验分类值
 */
export function isValidCategory(category: string): category is 'work' | 'personal' {
  return category === 'work' || category === 'personal'
}

/**
 * 校验标签名
 */
export function isValidTagName(tag: string): boolean {
  if (!tag || tag.trim().length === 0) return false
  if (tag.length > 20) return false
  if (/[<>"'&]/.test(tag)) return false
  return true
}

/**
 * 校验搜索关键词
 */
export function isValidSearchQuery(query: string): boolean {
  if (!query || query.trim().length === 0) return false
  if (query.length > 200) return false
  return true
}
