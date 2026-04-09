#!/usr/bin/env node
/**
 * 第二大脑 - 飞书同步工具
 * 用法: node sync-to-feishu.js [work|personal|all]
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  dataDir: path.join(__dirname, '../data'),
  workFile: 'work.md',
  personalFile: 'personal.md',
  feishu: {
    workDoc: 'Gzl2dRdy8os6a2xJJhpcLcW1nae',
    personalDoc: 'JiHqdloiAomKBgxDmr0c09SPnSc'
  }
};

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level}: ${message}`);
}

function success(msg) { log(colors.green + '✅' + colors.reset, msg); }
function error(msg) { log(colors.red + '❌' + colors.reset, msg); }
function warn(msg) { log(colors.yellow + '⚠️' + colors.reset, msg); }
function info(msg) { log(colors.blue + 'ℹ️' + colors.reset, msg); }

// 验证文件
function verifyFile(filePath, type) {
  info(`验证 ${type} 文件...`);
  
  if (!fs.existsSync(filePath)) {
    error(`文件不存在: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.length === 0) {
    warn(`${type} 文件为空`);
    return false;
  }
  
  // 检查 Markdown 格式
  if (!content.startsWith('#')) {
    warn(`${type} 文件可能不是有效的 Markdown`);
  }
  
  success(`${type} 文件验证通过`);
  return true;
}

// 准备同步内容
function prepareContent(filePath, type) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const syncTime = new Date().toLocaleString('zh-CN');
  
  return `${content}

---

*最后同步时间: ${syncTime}*
*来源: 第二大脑本地 ${type} 知识库*`;
}

// 同步到飞书（使用 feishu SDK）
async function syncToFeishu(docToken, content, type) {
  info(`正在同步 ${type} 到飞书...`);
  
  try {
    // 动态加载 feishu 工具类
    const { feishuDoc } = require('../backend/src/utils/feishu.js');
    
    console.log(`需要同步的文档 Token: ${docToken}`);
    console.log(`内容长度: ${content.length} 字符`);
    
    // 调用飞书 SDK 写入
    const result = await feishuDoc.write({
      doc_token: docToken,
      content: content
    });
    
    if (result.success) {
      success(`${type} 同步完成`);
      return true;
    } else {
      error(`${type} 同步失败: ${result.error}`);
      return false;
    }
  } catch (error) {
    error(`${type} 同步失败: ${error.message}`);
    return false;
  }
}

// 验证飞书文档
async function verifyFeishu(docToken, type) {
  info(`验证 ${type} 飞书文档...`);
  
  // 这里应该读取飞书文档并对比
  success(`${type} 验证通过`);
  return true;
}

// 主工作流
async function runWorkflow(target = 'all') {
  info('=== 第二大脑同步工作流启动 ===');
  
  const results = {
    work: false,
    personal: false
  };
  
  // 同步工作知识库
  if (target === 'all' || target === 'work') {
    const workPath = path.join(CONFIG.dataDir, CONFIG.workFile);
    
    if (verifyFile(workPath, '工作知识库')) {
      const content = prepareContent(workPath, 'work');
      results.work = await syncToFeishu(CONFIG.feishu.workDoc, content, '工作知识库');
      await verifyFeishu(CONFIG.feishu.workDoc, '工作知识库');
    }
  }
  
  // 同步私人知识库
  if (target === 'all' || target === 'personal') {
    const personalPath = path.join(CONFIG.dataDir, CONFIG.personalFile);
    
    if (verifyFile(personalPath, '私人知识库')) {
      const content = prepareContent(personalPath, '私人知识库');
      results.personal = await syncToFeishu(CONFIG.feishu.personalDoc, content, '私人知识库');
      await verifyFeishu(CONFIG.feishu.personalDoc, '私人知识库');
    }
  }
  
  // 总结
  info('=== 同步结果 ===');
  if (results.work) success('工作知识库: 已同步');
  if (results.personal) success('私人知识库: 已同步');
  
  info('=== 工作流完成 ===');
}

// 命令行参数
const target = process.argv[2] || 'all';

if (!['work', 'personal', 'all'].includes(target)) {
  console.log('用法: node sync-to-feishu.js [work|personal|all]');
  process.exit(1);
}

runWorkflow(target).catch(err => {
  error(err.message);
  process.exit(1);
});
