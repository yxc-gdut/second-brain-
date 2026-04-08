/**
 * 聊天 API 路由
 */
const Router = require('@koa/router');
const chatService = require('../services/chat');

const router = new Router({ prefix: '/api/chat' });

/**
 * POST /api/chat
 * 聊天问答
 */
router.post('/', async (ctx) => {
  try {
    const { message, history = [] } = ctx.request.body;
    if (!message) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: '消息不能为空'
      };
      return;
    }

    const response = await chatService.chat(message, history);
    ctx.body = {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('聊天失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: '聊天失败',
      message: error.message || '未知错误'
    };
  }
});

/**
 * GET /api/chat/quick-questions
 * 获取快捷问题
 */
router.get('/quick-questions', async (ctx) => {
  ctx.body = {
    success: true,
    data: chatService.quickQuestions
  };
});

/**
 * GET /api/chat/status
 * LLM 服务状态
 */
router.get('/status', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      available: chatService.isLLMAvailable()
    }
  };
});

module.exports = router;
