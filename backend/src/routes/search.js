/**
 * 搜索 API 路由
 */
const Router = require('@koa/router');
const { getAllNotes } = require('../services/markdown');

const router = new Router({ prefix: '/api/search' });

/**
 * 计算匹配次数
 */
function countMatches(note, query) {
  let count = 0;
  const content = note.content.toLowerCase();
  const source = (note.source || '').toLowerCase();

  // 计算内容匹配次数
  let pos = content.indexOf(query);
  while (pos !== -1) {
    count++;
    pos = content.indexOf(query, pos + 1);
  }

  // 来源匹配权重更高
  if (source.includes(query)) {
    count += 5;
  }

  // 标签匹配
  if (note.tags?.some(t => t.toLowerCase().includes(query))) {
    count += 3;
  }

  return count;
}

/**
 * GET /api/search
 * 全文搜索
 */
router.get('/', async (ctx) => {
  try {
    const { q, category, tag } = ctx.query;
    if (!q && !category && !tag) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: '请提供搜索关键词、分类或标签'
      };
      return;
    }

    const notes = await getAllNotes();
    const results = notes.filter(note => {
      // 分类筛选
      if (category && note.category !== category) {
        return false;
      }
      // 标签筛选
      if (tag && !note.tags?.includes(tag)) {
        return false;
      }
      // 关键词搜索
      if (q) {
        const query = q.toLowerCase();
        const contentMatch = note.content.toLowerCase().includes(query);
        const sourceMatch = note.source?.toLowerCase().includes(query);
        const tagMatch = note.tags?.some(t => t.toLowerCase().includes(query));
        if (!contentMatch && !sourceMatch && !tagMatch) {
          return false;
        }
      }
      return true;
    });

    // 按相关度排序（简单的匹配次数排序）
    if (q) {
      const query = q.toLowerCase();
      results.sort((a, b) => {
        const scoreA = countMatches(a, query);
        const scoreB = countMatches(b, query);
        return scoreB - scoreA;
      });
    }

    ctx.body = {
      success: true,
      data: results,
      meta: {
        total: results.length,
        query: q,
        category,
        tag
      }
    };
  } catch (error) {
    console.error('搜索失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: '搜索失败',
      message: error.message || '未知错误'
    };
  }
});

module.exports = router;
