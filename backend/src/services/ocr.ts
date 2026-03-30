import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

// 临时上传目录
const UPLOAD_DIR = path.join(__dirname, '../../data/uploads')

// 确保上传目录存在
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  } catch {
    // 目录已存在
  }
}

// OCR 识别结果
export interface OCRResult {
  text: string
  tableData?: string[][]
  imageUrl: string
}

// 保存上传的文件
export async function saveUploadedFile(buffer: Buffer, originalName: string): Promise<string> {
  await ensureUploadDir()

  const ext = path.extname(originalName) || '.jpg'
  const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)

  await fs.writeFile(filepath, buffer)

  // 返回相对路径
  return `/uploads/${filename}`
}

// 将 base64 图片保存为临时文件
async function saveBase64Image(imageBase64: string): Promise<string> {
  await ensureUploadDir()

  const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`
  const filepath = path.join(UPLOAD_DIR, filename)

  // 处理可能包含 data:image 前缀的 base64
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  await fs.writeFile(filepath, buffer)

  return filepath
}

// 使用 Tesseract OCR 识别文字
async function tesseractRecognize(imagePath: string, lang: string = 'chi_sim+eng'): Promise<string> {
  try {
    const { stdout } = await execAsync(`tesseract "${imagePath}" stdout -l ${lang}`)
    return stdout.trim()
  } catch (error) {
    console.error('Tesseract OCR 执行失败:', error)
    throw new Error('OCR 识别失败，请确保已安装 tesseract-ocr 和中文语言包')
  }
}

// 通用文字识别
export async function recognizeText(imageBase64: string): Promise<string> {
  const imagePath = await saveBase64Image(imageBase64)

  try {
    const text = await tesseractRecognize(imagePath)
    return text
  } finally {
    // 清理临时文件
    try {
      await fs.unlink(imagePath)
    } catch {
      // 忽略删除错误
    }
  }
}

// 表格识别（Tesseract 不原生支持表格，使用文本识别后简单处理）
export async function recognizeTable(imageBase64: string): Promise<{ text: string; tableData: string[][] }> {
  const imagePath = await saveBase64Image(imageBase64)

  try {
    const text = await tesseractRecognize(imagePath)

    // 简单表格解析：按行分割，尝试识别表格结构
    const lines = text.split('\n').filter(line => line.trim())
    const tableData: string[][] = []

    // 尝试通过空格或制表符分隔识别列
    for (const line of lines) {
      // 如果行中有多个空格，尝试分割成列
      const columns = line.trim().split(/\s{2,}/).map(cell => cell.trim())
      if (columns.length > 1) {
        tableData.push(columns)
      } else {
        // 单行作为单列
        tableData.push([line.trim()])
      }
    }

    return { text, tableData }
  } finally {
    // 清理临时文件
    try {
      await fs.unlink(imagePath)
    } catch {
      // 忽略删除错误
    }
  }
}

// 综合识别（先尝试表格，失败则使用通用识别）
export async function recognize(imageBase64: string): Promise<OCRResult> {
  try {
    // 尝试表格识别
    const { text, tableData } = await recognizeTable(imageBase64)
    return {
      text,
      tableData,
      imageUrl: '' // 由路由层填充
    }
  } catch {
    // 表格识别失败，使用通用文字识别
    const text = await recognizeText(imageBase64)
    return {
      text,
      imageUrl: '' // 由路由层填充
    }
  }
}

// 检查 OCR 是否可用（检查 tesseract 是否安装）
export async function isOCRAvailable(): Promise<boolean> {
  try {
    await execAsync('which tesseract')
    return true
  } catch {
    return false
  }
}
