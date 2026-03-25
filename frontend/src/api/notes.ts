const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface Note {
  id: string
  content: string
  source?: string
  category: 'work' | 'personal'
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateNoteData {
  content: string
  source?: string
  category: 'work' | 'personal'
  tags?: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 获取所有笔记
export async function getNotes(): Promise<Note[]> {
  const response = await fetch(`${API_BASE_URL}/api/notes`)
  const result: ApiResponse<Note[]> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '获取笔记失败')
  }
  
  return result.data
}

// 获取单条笔记
export async function getNoteById(id: string): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`)
  const result: ApiResponse<Note> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '获取笔记失败')
  }
  
  return result.data
}

// 创建笔记
export async function createNote(data: CreateNoteData): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  const result: ApiResponse<Note> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '创建笔记失败')
  }
  
  return result.data
}

// 更新笔记
export async function updateNote(id: string, data: Partial<CreateNoteData>): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  
  const result: ApiResponse<Note> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '更新笔记失败')
  }
  
  return result.data
}

// 删除笔记
export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
    method: 'DELETE'
  })
  
  const result: ApiResponse<void> = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || '删除笔记失败')
  }
}

// ========== OCR API ==========

export interface OCRResult {
  text: string
  tableData?: string[][]
  imageUrl: string
}

// 图片 OCR 识别
export async function recognizeImage(imageBase64: string, imageName?: string): Promise<OCRResult> {
  const response = await fetch(`${API_BASE_URL}/api/ocr/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: imageBase64, imageName })
  })
  
  const result: ApiResponse<OCRResult> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '图片识别失败')
  }
  
  return result.data
}

// 检查 OCR 服务状态
export async function getOCRStatus(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/ocr/status`)
  const result: ApiResponse<{ available: boolean }> = await response.json()
  return result.data?.available || false
}

// ========== 标签 API ==========

export interface Tag {
  id?: string
  name: string
  color: string
}

// 获取所有标签
export async function getTags(): Promise<Tag[]> {
  const response = await fetch(`${API_BASE_URL}/api/tags`)
  const result: ApiResponse<Tag[]> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '获取标签失败')
  }
  
  return result.data
}

// 搜索标签
export async function searchTags(query: string): Promise<Tag[]> {
  const response = await fetch(`${API_BASE_URL}/api/tags/search?q=${encodeURIComponent(query)}`)
  const result: ApiResponse<Tag[]> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '搜索标签失败')
  }
  
  return result.data
}

// 推荐标签
export async function suggestTags(content: string): Promise<Tag[]> {
  const response = await fetch(`${API_BASE_URL}/api/tags/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  })
  
  const result: ApiResponse<Tag[]> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '推荐标签失败')
  }
  
  return result.data
}

// 检查 LLM 服务状态
export async function getLLMStatus(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/tags/status`)
  const result: ApiResponse<{ available: boolean }> = await response.json()
  return result.data?.available || false
}

// ========== 聊天 API ==========

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  references?: {
    noteId: string
    content: string
    source?: string
    category: string
    createdAt: string
  }[]
}

// 发送聊天消息
export async function chat(message: string, history: ChatMessage[] = []): Promise<ChatMessage> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message, history })
  })
  
  const result: ApiResponse<ChatMessage> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '聊天失败')
  }
  
  return result.data
}

// 获取快捷问题
export async function getQuickQuestions(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/chat/quick-questions`)
  const result: ApiResponse<string[]> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '获取快捷问题失败')
  }
  
  return result.data
}

// ========== 搜索 API ==========

export interface SearchOptions {
  q?: string
  category?: 'work' | 'personal'
  tag?: string
}

// 搜索笔记
export async function searchNotes(options: SearchOptions): Promise<Note[]> {
  const params = new URLSearchParams()
  if (options.q) params.append('q', options.q)
  if (options.category) params.append('category', options.category)
  if (options.tag) params.append('tag', options.tag)
  
  const response = await fetch(`${API_BASE_URL}/api/search?${params.toString()}`)
  const result: ApiResponse<Note[]> = await response.json()
  
  if (!result.success || !result.data) {
    throw new Error(result.error || '搜索失败')
  }
  
  return result.data
}
