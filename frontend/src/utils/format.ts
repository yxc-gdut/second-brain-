/**
 * 文本格式化工具函数
 */

/**
 * 截断文本到指定长度，超出部分用省略号替代
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || ''
  return text.substring(0, maxLength) + '...'
}

/**
 * 将换行和多余空格压缩为单行
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 2) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

/**
 * 格式化笔记摘要（去除 markdown 标记，截断长度）
 */
export function formatNoteSummary(content: string, maxLength = 120): string {
  const plain = content
    .replace(/#{1,6}\s/g, '') // 标题
    .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // 粗体/斜体
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // 代码块
    .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // 链接
  return normalizeWhitespace(plain).substring(0, maxLength) || ''
}

/**
 * 生成文件名友好的 slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}
