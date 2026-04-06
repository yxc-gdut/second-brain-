/**
 * 第二大脑 - 后端 (JS版本)
 */
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const path = require('path');
const notesRouter = require('./routes/notes');
const { getSyncService } = require('./services/syncService');

const CONFIG = {
  port: 3000,
  dataDir: path.join(__dirname, '../data'),
  feishu: {
    workDocToken: 'Gzl2dRdy8os6a2xJJhpcLcW1nae',
    personalDocToken: 'JiHqdloiAomKBgxDmr0c09SPnSc'
  }
};


async function main() {
  const app = new Koa();
  
  // 中间件
  app.use(cors());
  app.use(bodyParser());
  
  // 初始化同步服务
  const sync = getSyncService({
    dataDir: CONFIG.dataDir,
    workDocToken: CONFIG.feishu.workDocToken,
    personalDocToken: CONFIG.feishu.personalDocToken
  });
  await sync.init();
  
  // 路由
  app.use(notesRouter.routes());
  app.use(notesRouter.allowedMethods());
  
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
