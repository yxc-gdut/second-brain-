import axios from 'axios'

// LLM API 配置（支持多种提供商）
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai' // openai, anthropic, custom
const LLM_API_KEY = process.env.LLM_API_KEY || ''
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions'
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-3.5-turbo'

// 标签颜色池
const COLOR_POOL = [
  '#EF4444', // 红色
  '#F97316', // 橙色
  '#EAB308', // 黄色
  '#22C55E', // 绿色
  '#3B82F6', // 蓝色
  '#8B5CF6', // 紫色
  '#EC4899', // 粉色
  '#6B7280', // 灰色
]

// 标签接口
export interface Tag {
  id?: string
  name: string
  color: string
  lastUsedAt?: string
}

// 检查 LLM 是否可用
export function isLLMAvailable(): boolean {
  return !!LLM_API_KEY
}

// 调用 LLM API
async function callLLM(prompt: string): Promise<string> {
  if (!LLM_API_KEY) {
    throw new Error('LLM API Key 未配置')
  }

  const response = await axios.post(
    LLM_API_URL,
    {
      model: LLM_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一个标签提取助手。请从用户提供的文本中提取3-5个关键词标签，只返回JSON数组格式的标签列表，不要其他解释。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 100
    },
    {
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const content = response.data.choices?.[0]?.message?.content || ''
  return content
}

// 提取 JSON 数组
function extractJSON(text: string): string[] {
  try {
    // 尝试直接解析
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // 尝试从文本中提取 JSON
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed)) return parsed
      } catch {
        // 解析失败
      }
    }
  }
  
  // 如果都失败了，按行分割并清理
  return text
    .split(/[,，\n]/)
    .map(s => s.trim().replace(/^["']|["']$/g, ''))
    .filter(s => s.length > 0 && s.length <= 20)
    .slice(0, 5)
}

// 分配颜色
function assignColor(index: number): string {
  return COLOR_POOL[index % COLOR_POOL.length]
}

// 推荐标签
export async function suggestTags(content: string): Promise<Tag[]> {
  if (!content.trim()) {
    return []
  }

  // 如果 LLM 不可用，使用简单规则提取
  if (!isLLMAvailable()) {
    return extractKeywordsFallback(content)
  }

  try {
    const prompt = `请从以下内容中提取3-5个关键词标签（每个标签不超过10个字符），返回JSON数组格式：\n\n${content.slice(0, 500)}`
    const result = await callLLM(prompt)
    const tagNames = extractJSON(result)
    
    return tagNames.map((name, index) => ({
      name,
      color: assignColor(index)
    }))
  } catch (error) {
    console.error('LLM 标签推荐失败:', error)
    // 降级到简单规则
    return extractKeywordsFallback(content)
  }
}

// 备用关键词提取（规则-based）
function extractKeywordsFallback(content: string): Tag[] {
  const keywords: string[] = []
  
  // 常见关键词模式
  const patterns = [
    { regex: /(财务|销售|收入|成本|利润|预算)/g, tag: '财务' },
    { regex: /(产品|用户|需求|功能|迭代)/g, tag: '产品' },
    { regex: /(会议|讨论|决策|共识)/g, tag: '会议' },
    { regex: /(读书|笔记|学习|知识)/g, tag: '读书笔记' },
    { regex: /(想法|灵感|创意)/g, tag: '想法' },
    { regex: /(工作|项目|任务|进度)/g, tag: '工作' },
    { regex: /(生活|家庭|健康|旅行)/g, tag: '生活' },
  ]
  
  for (const pattern of patterns) {
    if (pattern.regex.test(content) && !keywords.includes(pattern.tag)) {
      keywords.push(pattern.tag)
    }
  }
  
  // 如果没有匹配到，提取高频词
  if (keywords.length === 0) {
    const words = content
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && w.length <= 10)
    
    const freq: Record<string, number> = {}
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1
    }
    
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word)
    
    keywords.push(...sorted)
  }
  
  return keywords.map((name, index) => ({
    name,
    color: assignColor(index)
  }))
}

// 从已有笔记中提取所有标签
export async function getAllTags(): Promise<Tag[]> {
  // 这里应该从数据库或索引中读取
  // 暂时返回示例标签
  return [
    { name: '财务', color: '#EF4444', lastUsedAt: new Date().toISOString() },
    { name: '销售', color: '#3B82F6', lastUsedAt: new Date().toISOString() },
    { name: '读书笔记', color: '#22C55E', lastUsedAt: new Date().toISOString() },
    { name: '产品', color: '#8B5CF6', lastUsedAt: new Date().toISOString() },
  ]
}

// 搜索标签
export async function searchTags(query: string): Promise<Tag[]> {
  const allTags = await getAllTags()
  if (!query) return allTags
  
  return allTags.filter(tag => 
    tag.name.toLowerCase().includes(query.toLowerCase())
  )
}
