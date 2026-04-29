/**
 * 笔记 API 路由 - 简化版，直接追加到 MD 文件
 */
const Router = require('@koa/router');
const fs = require('fs').promises;
const path = require('path');
const { feishuDoc } = require('../utils/feishu');

const router = new Router({ prefix: '/api' });
const DATA_DIR = path.join(__dirname, '../../data');

// 飞书文档 token 配置（从环境变量读取，兼容旧硬编码）
const FEISHU_CONFIGS = {
  work: {
    docToken: process.env.FEISHU_WORK_DOC || 'Gzl2dRdy8os6a2xJJhpcLcW1nae'
  },
  personal: {
    docToken: process.env.FEISHU_PERSONAL_DOC || 'JiHqdloiAomKBgxDmr0c09SPnSc'
  }
};

/**
 * POST /api/notes
 * 保存笔记并同步到飞书
 */
router.post('/notes', async (ctx) => {
  try {
    const body = ctx.request.body;
    
    // 验证
    if (!body.content || !body.category) {
      ctx.status = 400;
      ctx.body = { success: false, error: '缺少content或category' };
      return;
    }
    
    const note = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: body.content,
      tags: body.tags || [],
      source: body.source,
      category: body.category,
      createdAt: new Date().toISOString()
    };
    
    // 直接追加到 MD 文件
    const filePath = path.join(DATA_DIR, `${note.category}.md`);
    const entry = formatNoteEntry(note);
    
    // 确保目录存在
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // 检查文件是否存在，不存在则创建头部
    let existing = '';
    try {
      existing = await fs.readFile(filePath, 'utf-8');
    } catch {
      existing = note.category === 'work' 
        ? '# 工作知识库\n\n_记录工作相关的知识和灵感_\n'
        : '# 私人知识库\n\n_记录个人生活的知识和灵感_\n';
    }
    
    // 追加新笔记
    const newContent = existing + '\n' + entry;
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    // 触发飞书异步增量同步（不阻塞响应）
    triggerFeishuAsync(note.category, newContent);
    
    ctx.body = { 
      success: true, 
      data: { 
        id: note.id, 
        message: '笔记已保存' 
      }
    };
  } catch (error) {
    console.error('[API] 保存失败:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: '保存失败' };
  }
});

/**
 * GET /api/notes?category=work
 * 获取笔记列表（从 MD 文件解析）
 */
router.get('/notes', async (ctx) => {
  try {
    const { category } = ctx.query;
    const filePath = path.join(DATA_DIR, `${category}.md`);
    
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch {
      ctx.body = { success: true, data: [] };
      return;
    }
    
    // 简单解析 MD 文件
    const notes = parseMarkdown(content, category);
    
    ctx.body = { success: true, data: notes };
  } catch (error) {
    console.error('[API] 获取失败:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: '获取失败' };
  }
});

/**
 * GET /api/sync/status
 * 获取同步状态
 */
router.get('/sync/status', async (ctx) => {
  // 简化版，直接返回成功
  ctx.body = {
    success: true,
    data: { 
      work: true, 
      personal: true, 
      all: true 
    }
  };
});

/**
 * 格式化笔记条目
 */
function formatNoteEntry(note) {
  const tags = note.tags.join(',');
  return `## ${note.createdAt} | ${tags}
**来源**: ${note.source || '未记录'}
**分类**: ${note.category}

${note.content}

---
`;
}

/**
 * 解析 Markdown 内容
 */
function parseMarkdown(content, category) {
  const notes = [];
  const sections = content.split('---\n').filter(s => s.trim());
  
  for (const section of sections) {
    const lines = section.split('\n');
    
    // 找到第一个匹配标题模式的行（跳过开头的空行）
    let titleLineIndex = 0;
    while (titleLineIndex < lines.length && !lines[titleLineIndex].match(/## (.+) \| (.+)/)) {
      titleLineIndex++;
    }
    
    if (titleLineIndex >= lines.length) continue; // 没找到标题，跳过
    
    const titleMatch = lines[titleLineIndex].match(/## (.+) \| (.+)/);
    const [, dateStr, tagStr] = titleMatch;
    const tags = tagStr.split(',').map(t => t.trim()).filter(t => t);
    
    let contentStart = titleLineIndex + 1;
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
      source: lines.find(l => l.startsWith('**来源**:'))?.replace('**来源**:', '').trim() || ''
    });
  }
  return notes.reverse(); // 最新的在前
}

/**
 * 异步触发飞书增量同步（fire-and-forget，不阻塞响应）
 * 原理：读取本地 MD 文件整体内容，feishuDoc.write() 会通过时间戳比对
 *       自动只追加新增部分，实现增量同步
 */
function triggerFeishuAsync(category, content) {
  const config = FEISHU_CONFIGS[category];
  if (!config?.docToken) {
    console.warn(`[Sync] 跳过 ${category}：未配置飞书 docToken`);
    return;
  }

  // 获取上次同步时间，用于 feishuDoc 判断增量范围
  const lastSyncTime = feishuDoc.getLastSyncTime(category);
  const newContent = feishuDoc.parseNewContent(content, lastSyncTime);

  if (!newContent || !newContent.trim()) {
    console.log(`[Sync] ${category} 无新增内容需要同步`);
    return;
  }

  feishuDoc.write({ doc_token: config.docToken, content: newContent })
    .then(result => {
      if (result.success) {
        feishuDoc.setLastSyncTime(category, new Date().toISOString());
        console.log(`[Sync] ✅ ${category} 增量同步完成`);
      } else {
        console.error(`[Sync] ❌ ${category} 增量同步失败: ${result.error}`);
      }
    })
    .catch(err => {
      console.error(`[Sync] ❌ ${category} 同步异常:`, err.message);
    });
}

module.exports = router;
