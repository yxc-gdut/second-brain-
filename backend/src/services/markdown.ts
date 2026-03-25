import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(__dirname, '../../data/notes')

// 确保数据目录存在
async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (err) {
    // 目录已存在
  }
}

// 生成文件名
function generateFilename(id: string, title?: string): string {
  const date = new Date().toISOString().split('T')[0]
  const safeTitle = title ? title.replace(/[^\w\u4e00-\u9fa5]/g, '_').slice(0, 30) : 'untitled'
  return `${date}_${safeTitle}_${id}.md`
}

// 笔记接口
export interface Note {
  id: string
  content: string
  source?: string
  category: 'work' | 'personal'
  tags?: string[]
  createdAt: string
  updatedAt: string
}

// 创建笔记
export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  await ensureDir()
  
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
  const now = new Date().toISOString()
  
  const fullNote: Note = {
    id,
    ...note,
    createdAt: now,
    updatedAt: now
  }
  
  const filename = generateFilename(id, note.source)
  const filepath = path.join(DATA_DIR, filename)
  
  // 构建 Markdown 内容
  const mdContent = buildMarkdown(fullNote)
  await fs.writeFile(filepath, mdContent, 'utf-8')
  
  // 保存元数据索引
  await updateIndex(fullNote)
  
  return fullNote
}

// 获取所有笔记
export async function getAllNotes(): Promise<Note[]> {
  await ensureDir()
  
  try {
    const indexPath = path.join(DATA_DIR, 'index.json')
    const data = await fs.readFile(indexPath, 'utf-8')
    const notes = JSON.parse(data)
    return notes.sort((a: Note, b: Note) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  } catch {
    return []
  }
}

// 获取单条笔记
export async function getNoteById(id: string): Promise<Note | null> {
  const notes = await getAllNotes()
  return notes.find(n => n.id === id) || null
}

// 更新笔记
export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
  const note = await getNoteById(id)
  if (!note) return null
  
  const updatedNote: Note = {
    ...note,
    ...updates,
    id: note.id, // 不允许修改 id
    createdAt: note.createdAt, // 不允许修改创建时间
    updatedAt: new Date().toISOString()
  }
  
  // 更新 Markdown 文件
  const files = await fs.readdir(DATA_DIR)
  const oldFile = files.find(f => f.includes(id) && f.endsWith('.md'))
  
  if (oldFile) {
    await fs.unlink(path.join(DATA_DIR, oldFile))
  }
  
  const filename = generateFilename(id, updatedNote.source)
  const filepath = path.join(DATA_DIR, filename)
  const mdContent = buildMarkdown(updatedNote)
  await fs.writeFile(filepath, mdContent, 'utf-8')
  
  // 更新索引
  await updateIndex(updatedNote, true)
  
  return updatedNote
}

// 删除笔记
export async function deleteNote(id: string): Promise<boolean> {
  const note = await getNoteById(id)
  if (!note) return false
  
  // 删除 Markdown 文件
  const files = await fs.readdir(DATA_DIR)
  const file = files.find(f => f.includes(id) && f.endsWith('.md'))
  
  if (file) {
    await fs.unlink(path.join(DATA_DIR, file))
  }
  
  // 更新索引
  const notes = await getAllNotes()
  const filtered = notes.filter(n => n.id !== id)
  const indexPath = path.join(DATA_DIR, 'index.json')
  await fs.writeFile(indexPath, JSON.stringify(filtered, null, 2), 'utf-8')
  
  return true
}

// 构建 Markdown 内容
function buildMarkdown(note: Note): string {
  const tags = note.tags?.map(t => `#${t}`).join(' ') || ''
  
  return `---
id: ${note.id}
source: ${note.source || '未标注'}
category: ${note.category}
tags: ${note.tags?.join(', ') || ''}
createdAt: ${note.createdAt}
updatedAt: ${note.updatedAt}
---

${note.content}

${tags}
`
}

// 更新索引
async function updateIndex(note: Note, isUpdate = false): Promise<void> {
  const indexPath = path.join(DATA_DIR, 'index.json')
  let notes: Note[] = []
  
  try {
    const data = await fs.readFile(indexPath, 'utf-8')
    notes = JSON.parse(data)
  } catch {
    // 索引不存在，创建新的
  }
  
  if (isUpdate) {
    const idx = notes.findIndex(n => n.id === note.id)
    if (idx >= 0) {
      notes[idx] = note
    } else {
      notes.push(note)
    }
  } else {
    notes.push(note)
  }
  
  await fs.writeFile(indexPath, JSON.stringify(notes, null, 2), 'utf-8')
}
