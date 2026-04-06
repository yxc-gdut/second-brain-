/**
 * Markdown 存储服务
 */
const fs = require('fs').promises;
const path = require('path');

class MdStorage {
  constructor(dataDir) {
    this.dataDir = dataDir;
  }
  
  async saveNote(note) {
    const filePath = path.join(this.dataDir, `${note.category}.md`);
    const header = this.formatNote(note);
    
    // 确保目录存在
    await fs.mkdir(this.dataDir, { recursive: true });
    
    // 检查文件是否存在
    let existing = '';
    try {
      existing = await fs.readFile(filePath, 'utf-8');
    } catch {
      existing = note.category === 'work' 
        ? '# 工作知识库\n\n_记录工作相关的知识和灵感_\n\n---\n'
        : '# 私人知识库\n\n_记录个人生活的知识和灵感_\n\n---\n';
    }
    
    // 追加新笔记
    const newContent = existing + '\n' + header;
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    console.log(`[MdStorage] 笔记已保存: ${filePath}`);
  }
  
  async getNotes(category) {
    const filePath = path.join(this.dataDir, `${category}.md`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.parseMarkdown(content, category);
    } catch {
      return [];
    }
  }
  
  parseMarkdown(content, category) {
    const notes = [];
    const sections = content.split('---\n').filter(s => s.trim());
    
    for (const section of sections) {
      const lines = section.split('\n');
      const titleMatch = lines[0].match(/## (.+) \| (.+)/);
      
      if (titleMatch) {
        const [, dateStr, tagStr] = titleMatch;
        const tags = tagStr.split(',').map(t => t.trim());
        
        let contentStart = 1;
        while (contentStart < lines.length && 
               (lines[contentStart].startsWith('**') || lines[contentStart].trim() === '')) {
          contentStart++;
        }
        
        const noteContent = lines.slice(contentStart).join('\n').trim();
        
        notes.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: noteContent,
          tags,
          category,
          createdAt: dateStr.trim(),
          updatedAt: new Date().toISOString()
        });
      }
    }
    return notes;
  }
  
  async readFile(category) {
    const filePath = path.join(this.dataDir, `${category}.md`);
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return category === 'work' 
        ? '# 工作知识库\n\n_记录工作相关的知识和灵感_\n\n---\n'
        : '# 私人知识库\n\n_记录个人生活的知识和灵感_\n\n---\n';
    }
  }
  
  formatNote(note) {
    const tags = note.tags.join(',');
    return `## ${note.createdAt} | ${tags}
**来源**: ${note.source || '未记录'}
**分类**: ${note.category}

${note.content}

---
`;
  }
}

module.exports = { MdStorage };
