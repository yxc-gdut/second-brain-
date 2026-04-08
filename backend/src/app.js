/**
 * 第二大脑 - 后端 (JS版本)
 */
require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const path = require('path');
const notesRouter = require('./routes/notes');
const ocrRouter = require('./routes/ocr');
const chatRouter = require('./routes/chat');
const searchRouter = require('./routes/search');
const tagsRouter = require('./routes/tags');

const CONFIG = {
  port: 3000,
  dataDir: path.join(__dirname, '../data')
};


async function main() {
  const app = new Koa();
  
  // 中间件
  app.use(cors());
  app.use(bodyParser());
  
  // 路由
  app.use(notesRouter.routes());
  app.use(notesRouter.allowedMethods());
  app.use(ocrRouter.routes());
  app.use(ocrRouter.allowedMethods());
  app.use(chatRouter.routes());
  app.use(chatRouter.allowedMethods());
  app.use(searchRouter.routes());
  app.use(searchRouter.allowedMethods());
  app.use(tagsRouter.routes());
  app.use(tagsRouter.allowedMethods());
  
  // 健康检查
  app.use(async (ctx, next) => {
    if (ctx.path === '/health') {
      ctx.body = { status: 'ok', time: new Date().toISOString() };
      return;
    }
    await next();
  });
  
  // 启动
  app.listen(CONFIG.port, () => {
    console.log(`[SecondBrain] 服务器启动: http://localhost:${CONFIG.port}`);
    console.log(`[SecondBrain] 数据目录: ${CONFIG.dataDir}`);
  });
}

main().catch(console.error);
