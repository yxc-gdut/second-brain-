/**
 * Markdown 笔记服务
 */
const fs = require('fs/promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data/notes');

/**
 * 确保数据目录存在
 */
async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // 目录已存在
  }
}

/**
 * 生成文件名
 */
function generateFilename(id, title) {
  const date = new Date().toISOString().split('T')[0];
  const safeTitle = title ? title.replace(/[^\w\u4e00-\u9fa5]/g, '_').slice(0, 30) : 'untitled';
  return `${date}_${safeTitle}_${id}.md`;
}

/**
 * 构建 Markdown 内容
 */
function buildMarkdown(note) {
  const tags = note.tags?.map(t => `#${t}`).join(' ') || '';
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
`;
}

/**
 * 更新索引
 */
async function updateIndex(note, isUpdate = false) {
  const indexPath = path.join(DATA_DIR, 'index.json');
  let notes = [];
  try {
    const data = await fs.readFile(indexPath, 'utf-8');
    notes = JSON.parse(data);
  } catch {
    // 索引不存在，创建新的
  }

  if (isUpdate) {
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = note;
    } else {
      notes.push(note);
    }
  } else {
    notes.push(note);
  }

  await fs.writeFile(indexPath, JSON.stringify(notes, null, 2), 'utf-8');
}

/**
 * 创建笔记
 */
async function createNote(note) {
  await ensureDir();
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const now = new Date().toISOString();
  const fullNote = {
    id,
    ...note,
    createdAt: now,
    updatedAt: now
  };

  const filename = generateFilename(id, note.source);
  const filepath = path.join(DATA_DIR, filename);
  const mdContent = buildMarkdown(fullNote);

  await fs.writeFile(filepath, mdContent, 'utf-8');
  await updateIndex(fullNote);

  return fullNote;
}

/**
 * 获取所有笔记
 */
async function getAllNotes() {
  await ensureDir();
  try {
    const indexPath = path.join(DATA_DIR, 'index.json');
    const data = await fs.readFile(indexPath, 'utf-8');
    const notes = JSON.parse(data);
    return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

/**
 * 获取单条笔记
 */
async function getNoteById(id) {
  const notes = await getAllNotes();
  return notes.find(n => n.id === id) || null;
}

/**
 * 更新笔记
 */
async function updateNote(id, updates) {
  const note = await getNoteById(id);
  if (!note) return null;

  const updatedNote = {
    ...note,
    ...updates,
    id: note.id,
    createdAt: note.createdAt,
    updatedAt: new Date().toISOString()
  };

  // 更新 Markdown 文件
  const files = await fs.readdir(DATA_DIR);
  const oldFile = files.find(f => f.includes(id) && f.endsWith('.md'));
  if (oldFile) {
    await fs.unlink(path.join(DATA_DIR, oldFile));
  }

  const filename = generateFilename(id, updatedNote.source);
  const filepath = path.join(DATA_DIR, filename);
  const mdContent = buildMarkdown(updatedNote);

  await fs.writeFile(filepath, mdContent, 'utf-8');
  await updateIndex(updatedNote, true);

  return updatedNote;
}

/**
 * 删除笔记
 */
async function deleteNote(id) {
  const note = await getNoteById(id);
  if (!note) return false;

  // 删除 Markdown 文件
  const files = await fs.readdir(DATA_DIR);
  const file = files.find(f => f.includes(id) && f.endsWith('.md'));
  if (file) {
    await fs.unlink(path.join(DATA_DIR, file));
  }

  // 更新索引
  const notes = await getAllNotes();
  const filtered = notes.filter(n => n.id !== id);
  const indexPath = path.join(DATA_DIR, 'index.json');
  await fs.writeFile(indexPath, JSON.stringify(filtered, null, 2), 'utf-8');

  return true;
}

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
};
