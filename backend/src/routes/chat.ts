import Router from 'koa-router'
import * as chatService from '../services/chat'

const router = new Router({ prefix: '/api/chat' })

// 聊天问答
router.post('/', async (ctx) => {
  try {
    const { message, history = [] } = ctx.request.body as any
    
    if (!message) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: '消息不能为空'
      }
      return
    }
    
    const response = await chatService.chat(message, history)
    
    ctx.body = {
      success: true,
      data: response
    }
  } catch (error) {
    console.error('聊天失败:', error)
    ctx.status = 500
    ctx.body = {
      success: false,
      error: '聊天失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// 获取快捷问题
router.get('/quick-questions', async (ctx) => {
  ctx.body = {
    success: true,
    data: chatService.quickQuestions
  }
})

// LLM 服务状态
router.get('/status', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      available: chatService.isLLMAvailable()
    }
  }
})

export { router as chatRouter }
