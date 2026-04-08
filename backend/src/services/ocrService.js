/**
 * OCR 服务 - 基于 Tesseract
 */
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs/promises');
const path = require('path');

const execAsync = util.promisify(exec);

// 临时上传目录
const UPLOAD_DIR = path.join(__dirname, '../../data/uploads');

/**
 * 确保上传目录存在
 */
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    // 目录已存在
  }
}

/**
 * 保存上传的文件
 * @param {Buffer} buffer - 文件内容
 * @param {string} originalName - 原始文件名
 * @returns {string} 返回相对路径 /uploads/xxx.jpg
 */
async function saveUploadedFile(buffer, originalName) {
  await ensureUploadDir();
  const ext = path.extname(originalName) || '.jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filepath, buffer);
  // 返回相对路径
  return `/uploads/${filename}`;
}

/**
 * 使用 Tesseract OCR 识别文字
 * @param {string} imagePath - 图片路径
 * @param {string} lang - 语言包，默认中文简体+英文
 * @returns {string} 识别的文字
 */
async function tesseractRecognize(imagePath, lang = 'chi_sim+eng') {
  try {
    const { stdout } = await execAsync(`tesseract "${imagePath}" stdout -l ${lang}`);
    return stdout.trim();
  } catch (error) {
    console.error('Tesseract OCR 执行失败:', error);
    throw new Error('OCR 识别失败，请确保已安装 tesseract-ocr 和中文语言包');
  }
}

/**
 * 通用文字识别（从文件路径）
 * @param {string} imagePath - 图片路径
 * @returns {string} 识别的文字
 */
async function recognizeTextFromFile(imagePath) {
  const text = await tesseractRecognize(imagePath);
  return text;
}

/**
 * 表格识别（从文件路径）
 * @param {string} imagePath - 图片路径
 * @returns {object} { text, tableData }
 */
async function recognizeTableFromFile(imagePath) {
  const text = await tesseractRecognize(imagePath);
  // 简单表格解析：按行分割，尝试识别表格结构
  const lines = text.split('\n').filter(line => line.trim());
  const tableData = [];

  // 尝试通过空格或制表符分隔识别列
  for (const line of lines) {
    // 如果行中有多个空格，尝试分割成列
    const columns = line.trim().split(/\s{2,}/).map(cell => cell.trim());
    if (columns.length > 1) {
      tableData.push(columns);
    } else {
      // 单行作为单列
      tableData.push([line.trim()]);
    }
  }

  return { text, tableData };
}

/**
 * 综合识别（从文件路径）
 * @param {string} imagePath - 图片路径
 * @returns {object} { text, tableData, imageUrl }
 */
async function recognizeFromFile(imagePath) {
  try {
    // 尝试表格识别
    const { text, tableData } = await recognizeTableFromFile(imagePath);
    return {
      text,
      tableData,
      imageUrl: '' // 由路由层填充
    };
  } catch {
    // 表格识别失败，使用通用文字识别
    const text = await recognizeTextFromFile(imagePath);
    return {
      text,
      imageUrl: '' // 由路由层填充
    };
  }
}

/**
 * 检查 OCR 是否可用（检查 tesseract 是否安装）
 * @returns {boolean}
 */
async function isOCRAvailable() {
  try {
    await execAsync('which tesseract');
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  saveUploadedFile,
  recognizeTextFromFile,
  recognizeTableFromFile,
  recognizeFromFile,
  isOCRAvailable
};
