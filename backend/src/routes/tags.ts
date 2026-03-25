import Router from 'koa-router'
import * as tagService from '../services/tag'

const router = new Router({ prefix: '/api/tags' })

// 获取所有标签
router.get('/', async (ctx) => {
  try {
    const tags = await tagService.getAllTags()
    ctx.body = {
      success: true,
      data: tags
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '获取标签失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// 搜索标签
router.get('/search', async (ctx) => {
  try {
    const { q } = ctx.query
    const tags = await tagService.searchTags(q as string || '')
    ctx.body = {
      success: true,
      data: tags
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '搜索标签失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// 推荐标签
router.post('/suggest', async (ctx) => {
  try {
    const { content } = ctx.request.body as any
    
    if (!content) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: '内容不能为空'
      }
      return
    }
    
    const tags = await tagService.suggestTags(content)
    ctx.body = {
      success: true,
      data: tags
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '推荐标签失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// LLM 服务状态
router.get('/status', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      available: tagService.isLLMAvailable()
    }
  }
})

export { router as tagsRouter }
