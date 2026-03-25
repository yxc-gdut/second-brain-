import Router from 'koa-router'
import * as ocrService from '../services/ocr'

const router = new Router({ prefix: '/api/ocr' })

// 图片 OCR 预览（接收 base64 图片）
router.post('/preview', async (ctx) => {
  try {
    // 检查 OCR 服务是否可用
    if (!ocrService.isOCRAvailable()) {
      ctx.status = 503
      ctx.body = {
        success: false,
        error: 'OCR 服务未配置',
        message: '请设置 BAIDU_OCR_API_KEY 和 BAIDU_OCR_SECRET_KEY 环境变量'
      }
      return
    }

    const { image, imageName = 'upload.jpg' } = ctx.request.body as any
    
    if (!image) {
      ctx.status = 400
      ctx.body = {
        success: false,
        error: '请提供图片数据（base64 格式）'
      }
      return
    }

    // 保存图片文件
    const imageBuffer = Buffer.from(image, 'base64')
    const imageUrl = await ocrService.saveUploadedFile(imageBuffer, imageName)

    // 调用 OCR 识别
    const result = await ocrService.recognize(image)
    result.imageUrl = imageUrl

    ctx.body = {
      success: true,
      data: {
        text: result.text,
        tableData: result.tableData,
        imageUrl: result.imageUrl
      }
    }
  } catch (error) {
    console.error('OCR 处理失败:', error)
    ctx.status = 500
    ctx.body = {
      success: false,
      error: 'OCR 识别失败',
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
})

// OCR 服务状态检查
router.get('/status', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      available: ocrService.isOCRAvailable()
    }
  }
})

export { router as ocrRouter }
