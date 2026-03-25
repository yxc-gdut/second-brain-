import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'

// 百度 OCR 配置（需要用户填写）
const BAIDU_OCR_API_KEY = process.env.BAIDU_OCR_API_KEY || ''
const BAIDU_OCR_SECRET_KEY = process.env.BAIDU_OCR_SECRET_KEY || ''

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

// 获取百度 Access Token
async function getAccessToken(): Promise<string> {
  if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
    throw new Error('百度 OCR 配置缺失，请设置 BAIDU_OCR_API_KEY 和 BAIDU_OCR_SECRET_KEY')
  }

  const url = 'https://aip.baidubce.com/oauth/2.0/token'
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: BAIDU_OCR_API_KEY,
    client_secret: BAIDU_OCR_SECRET_KEY
  })

  const response = await axios.post(`${url}?${params.toString()}`)
  return response.data.access_token
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

// 通用文字识别（高精度版）
export async function recognizeText(imageBase64: string): Promise<string> {
  try {
    const token = await getAccessToken()
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${token}`
    
    const response = await axios.post(url, 
      { image: imageBase64 },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    
    if (response.data.error_code) {
      throw new Error(`百度 OCR 错误: ${response.data.error_msg}`)
    }
    
    const words = response.data.words_result || []
    return words.map((w: any) => w.words).join('\n')
  } catch (error) {
    console.error('OCR 识别失败:', error)
    throw error
  }
}

// 表格识别
export async function recognizeTable(imageBase64: string): Promise<{ text: string; tableData: string[][] }> {
  try {
    const token = await getAccessToken()
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/table?access_token=${token}`
    
    const response = await axios.post(url,
      { image: imageBase64 },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
    
    if (response.data.error_code) {
      throw new Error(`百度 OCR 错误: ${response.data.error_msg}`)
    }
    
    // 解析表格数据
    const result = response.data.result
    const tableData: string[][] = []
    
    if (result && result.tables) {
      for (const table of result.tables) {
        for (const cell of table.cells || []) {
          const row = cell.row || 0
          const col = cell.col || 0
          if (!tableData[row]) tableData[row] = []
          tableData[row][col] = cell.words || ''
        }
      }
    }
    
    // 提取纯文本
    const text = tableData.map(row => row.join(' ')).join('\n')
    
    return { text, tableData }
  } catch (error) {
    console.error('表格识别失败:', error)
    throw error
  }
}

// 综合识别（先尝试表格，失败则使用通用识别）
export async function recognize(imageBase64: string): Promise<OCRResult> {
  try {
    // 先尝试表格识别
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

// 检查 OCR 是否可用
export function isOCRAvailable(): boolean {
  return !!(BAIDU_OCR_API_KEY && BAIDU_OCR_SECRET_KEY)
}
