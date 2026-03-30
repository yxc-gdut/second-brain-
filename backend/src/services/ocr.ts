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

// 通用文字识别（从文件路径）
export async function recognizeTextFromFile(imagePath: string): Promise<string> {
  const text = await tesseractRecognize(imagePath)
  return text
}

// 表格识别（从文件路径）
export async function recognizeTableFromFile(imagePath: string): Promise<{ text: string; tableData: string[][] }> {
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
}

// 综合识别（从文件路径）
export async function recognizeFromFile(imagePath: string): Promise<OCRResult> {
  try {
    // 尝试表格识别
    const { text, tableData } = await recognizeTableFromFile(imagePath)
    return {
      text,
      tableData,
      imageUrl: '' // 由路由层填充
    }
  } catch {
    // 表格识别失败，使用通用文字识别
    const text = await recognizeTextFromFile(imagePath)
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
