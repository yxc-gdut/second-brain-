import Router from 'koa-router'
import * as ocrService from '../services/ocr'
import path from 'path'

const router = new Router({ prefix: '/api/ocr' })

// 图片 OCR 预览（接收 base64 图片）
router.post('/preview', async (ctx) => {
  try {
    // 检查 OCR 服务是否可用
    const available = await ocrService.isOCRAvailable()
    if (!available) {
      ctx.status = 503
      ctx.body = {
        success: false,
        error: 'OCR 服务未配置',
        message: '请安装 tesseract-ocr 和中文语言包：sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-chi-tra'
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

    // 处理可能包含 data:image 前缀的 base64
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

    // 保存图片文件
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const imageUrl = await ocrService.saveUploadedFile(imageBuffer, imageName)

    // 获取文件绝对路径进行 OCR 识别
    const UPLOAD_DIR = path.join(__dirname, '../../data/uploads')
    const filename = path.basename(imageUrl)
    const imagePath = path.join(UPLOAD_DIR, filename)

    // 调用 OCR 识别
    const result = await ocrService.recognizeFromFile(imagePath)
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
  const available = await ocrService.isOCRAvailable()
  ctx.body = {
    success: true,
    data: {
      available
    }
  }
})

export { router as ocrRouter }
