import axios from 'axios'
import { getAllNotes } from './markdown'

// LLM 配置（复用 tag.ts 的配置）
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai'
const LLM_API_KEY = process.env.LLM_API_KEY || ''
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions'
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-3.5-turbo'

// 检查 LLM 是否可用
export function isLLMAvailable(): boolean {
  return !!LLM_API_KEY
}

// 聊天记录接口
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  references?: Reference[]
}

export interface Reference {
  noteId: string
  content: string
  source?: string
  category: string
  createdAt: string
}

// 调用 LLM API
async function callLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (!LLM_API_KEY) {
    throw new Error('LLM API Key 未配置')
  }

  const response = await axios.post(
    LLM_API_URL,
    {
      model: LLM_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    },
    {
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  return response.data.choices?.[0]?.message?.content || ''
}

// 搜索相关笔记（简单关键词匹配）
async function searchRelevantNotes(query: string): Promise<Reference[]> {
  const notes = await getAllNotes()
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2)
  
  const scored = notes.map(note => {
    const content = (note.content + ' ' + (note.source || '')).toLowerCase()
    let score = 0
    
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        score += 1
      }
    }
    
    // 标题/来源匹配权重更高
    if (note.source && keywords.some(k => note.source!.toLowerCase().includes(k))) {
      score += 2
    }
    
    return { note, score }
  })
  
  // 返回最相关的3条笔记
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => ({
      noteId: item.note.id,
      content: item.note.content.slice(0, 200) + (item.note.content.length > 200 ? '...' : ''),
      source: item.note.source,
      category: item.note.category,
      createdAt: item.note.createdAt
    }))
}

// 生成知识结构（基于所有笔记）
async function generateKnowledgeStructure(): Promise<string> {
  const notes = await getAllNotes()
  
  if (notes.length === 0) {
    return '暂无笔记数据'
  }
  
  // 按分类统计
  const byCategory: Record<string, number> = {}
  const byTag: Record<string, number> = {}
  
  for (const note of notes) {
    byCategory[note.category] = (byCategory[note.category] || 0) + 1
    for (const tag of note.tags || []) {
      byTag[tag] = (byTag[tag] || 0) + 1
    }
  }
  
  let structure = '📊 笔记统计\n'
  structure += `总计: ${notes.length} 条笔记\n\n`
  
  structure += '📁 按分类\n'
  for (const [cat, count] of Object.entries(byCategory)) {
    const emoji = cat === 'work' ? '💼' : '🏠'
    structure += `${emoji} ${cat === 'work' ? '工作' : '私人'}: ${count} 条\n`
  }
  
  if (Object.keys(byTag).length > 0) {
    structure += '\n🏷️ 常用标签\n'
    const sortedTags = Object.entries(byTag)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    for (const [tag, count] of sortedTags) {
      structure += `#${tag}: ${count} 条\n`
    }
  }
  
  return structure
}

// 回答用户问题
export async function chat(query: string, history: ChatMessage[] = []): Promise<ChatMessage> {
  // 特殊指令处理
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('知识结构') || lowerQuery.includes('知识图谱')) {
    const structure = await generateKnowledgeStructure()
    return {
      role: 'assistant',
      content: structure
    }
  }
  
  if (lowerQuery.includes('最近') || lowerQuery.includes('最新')) {
    const notes = await getAllNotes()
    const recent = notes.slice(0, 5)
    
    if (recent.length === 0) {
      return {
        role: 'assistant',
        content: '暂无笔记记录'
      }
    }
    
    let content = '📝 最近笔记\n\n'
    for (const note of recent) {
      const emoji = note.category === 'work' ? '💼' : '🏠'
      const preview = note.content.slice(0, 50) + (note.content.length > 50 ? '...' : '')
      content += `${emoji} ${preview}\n来源: ${note.source || '未标注'}\n\n`
    }
    
    return {
      role: 'assistant',
      content
    }
  }
  
  // 搜索相关笔记
  const references = await searchRelevantNotes(query)
  
  // 构建上下文
  let context = ''
  if (references.length > 0) {
    context = '根据你的笔记，我找到了以下内容：\n\n'
    for (const ref of references) {
      context += `[${ref.category === 'work' ? '工作' : '私人'}] ${ref.source || '未标注来源'}\n${ref.content}\n\n`
    }
  } else {
    context = '我没有在你的笔记中找到相关内容。'
  }
  
  // 如果 LLM 可用，使用 LLM 生成回答
  if (isLLMAvailable()) {
    const messages = [
      {
        role: 'system',
        content: '你是用户的"第二大脑"助手，帮助用户回顾和整理笔记。基于提供的笔记内容回答用户问题，如果笔记中没有相关信息，请如实告知。'
      },
      ...history.slice(-4).map(h => ({ role: h.role, content: h.content })),
      {
        role: 'user',
        content: `用户问题：${query}\n\n相关笔记内容：\n${context}\n\n请基于以上笔记内容回答用户问题。`
      }
    ]
    
    const answer = await callLLM(messages)
    
    return {
      role: 'assistant',
      content: answer,
      references
    }
  }
  
  // LLM 不可用时，直接返回搜索结果
  return {
    role: 'assistant',
    content: context,
    references
  }
}

// 快捷问题模板
export const quickQuestions = [
  '我的知识结构？',
  '最近学了什么？',
  '工作相关笔记',
  '私人笔记有哪些？'
]
