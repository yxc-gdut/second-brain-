import Koa from 'koa'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import path from 'path'
import { notesRouter } from './routes/notes'
import { ocrRouter } from './routes/ocr'
import { tagsRouter } from './routes/tags'
import { chatRouter } from './routes/chat'
import { searchRouter } from './routes/search'

// 加载环境变量
import dotenv from 'dotenv'
dotenv.config()

const app = new Koa()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(bodyParser())

// 静态文件服务（上传的图片）
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/uploads/')) {
    ctx.path = ctx.path.replace('/uploads/', '/')
    return serve(path.join(__dirname, '../data/uploads'))(ctx, next)
  }
  await next()
})

// 路由
app.use(notesRouter.routes())
app.use(notesRouter.allowedMethods())
app.use(ocrRouter.routes())
app.use(ocrRouter.allowedMethods())
app.use(tagsRouter.routes())
app.use(tagsRouter.allowedMethods())
app.use(chatRouter.routes())
app.use(chatRouter.allowedMethods())
app.use(searchRouter.routes())
app.use(searchRouter.allowedMethods())

// 健康检查
app.use(async (ctx) => {
  if (ctx.path === '/') {
    ctx.body = { status: 'ok', service: 'second-brain-api' }
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
