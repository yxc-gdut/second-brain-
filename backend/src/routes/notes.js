/**
 * 笔记 API 路由
 */
const Router = require('@koa/router');
const { getSyncService } = require('../services/syncService');

const router = new Router({ prefix: '/api' });

/**
 * POST /api/notes
 * 保存笔记并自动同步到飞书
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
    
    // 构建笔记
    const note = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: body.content,
      tags: body.tags || [],
      source: body.source,
      category: body.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 保存并自动同步
    const sync = getSyncService();
    await sync.saveNote(note);
    
    ctx.body = { 
      success: true, 
      data: { 
        id: note.id, 
        message: '笔记已保存并同步到飞书' 
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
 * 获取笔记列表
 */
router.get('/notes', async (ctx) => {
  try {
    const { category } = ctx.query;
    const sync = getSyncService();
    const notes = await sync.getMdStorage().getNotes(category);
    
    ctx.body = { success: true, data: notes };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: '获取失败' };
  }
});

/**
 * GET /api/sync/status
 * 获取同步状态
 */
router.get('/sync/status', async (ctx) => {
  try {
    const sync = getSyncService();
    const work = await sync.verify('work');
    const personal = await sync.verify('personal');
    
    ctx.body = {
      success: true,
      data: { 
        work, 
        personal, 
        all: work && personal 
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false };
  }
});

module.exports = router;
