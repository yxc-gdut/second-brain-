import Router from 'koa-router'
import * as markdownService from '../services/markdown'

const router = new Router({ prefix: '/api/notes' })

// 获取所有笔记
router.get('/', async (ctx) => {
  try {
    const notes = await markdownService.getAllNotes()
    ctx.body = {
      success: true,
      data: notes
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '获取笔记失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// 获取单条笔记
router.get('/:id', async (ctx) => {
  try {
    const { id } = ctx.params
    const note = await markdownService.getNoteById(id)
    
    if (!note) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: '笔记不存在'
      }
      return
    }
    
    ctx.body = {
      success: true,
      data: note
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '获取笔记失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// 创建笔记
router.post('/', async (ctx) => {
  try {
    const { content, source, category, tags } = ctx.request.body as any
    
    if (!content) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: '内容不能为空'
      }
      return
    }
    
    if (!category || !['work', 'personal'].includes(category)) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: '分类必须是 work 或 personal'
      }
      return
    }
    
    const note = await markdownService.createNote({
      content,
      source,
      category,
      tags: tags || []
    })
    
    ctx.body = {
      success: true,
      data: note
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '创建笔记失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// 更新笔记
router.put('/:id', async (ctx) => {
  try {
    const { id } = ctx.params
    const updates = ctx.request.body as any
    
    const note = await markdownService.updateNote(id, updates)
    
    if (!note) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: '笔记不存在'
      }
      return
    }
    
    ctx.body = {
      success: true,
      data: note
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '更新笔记失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// 删除笔记
router.delete('/:id', async (ctx) => {
  try {
    const { id } = ctx.params
    const success = await markdownService.deleteNote(id)
    
    if (!success) {
      ctx.status = 404
      ctx.body = {
        success: false,
        error: '笔记不存在'
      }
      return
    }
    
    ctx.body = {
      success: true,
      message: '删除成功'
    }
  } catch (error) {
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '删除笔记失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

export { router as notesRouter }