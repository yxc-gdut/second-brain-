/**
 * 从 LLM 返回的文本中提取 JSON 数组
 * 移植自 backend/src/services/tag.js 的 extractJSON 函数
 */

/**
 * 尝试从文本中解析 JSON 数组
 * 支持直接 JSON、嵌入文本中的 JSON、以及降级按行分割
 */
export function extractJSON(text: string): string[] {
  // 1. 尝试直接解析
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    // 继续尝试
  }

  // 2. 尝试从文本中提取 JSON 数组
  const match = text.match(/\[[\s\S]*\]/)
  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      // 继续尝试
    }
  }

  // 3. 降级：按分隔符分割并清理
  return text
    .split(/[,，\n]/)
    .map((s) => s.trim().replace(/^["']|["']$/g, ''))
    .filter((s) => s.length > 0 && s.length <= 20)
    .slice(0, 5)
}
