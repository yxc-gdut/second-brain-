#!/usr/bin/env node
/**
 * 第二大脑 - 飞书同步工具
 * 用法: node sync-to-feishu.js [work|personal|all|incremental|full]
 */

const { feishuDoc } = require('../backend/src/utils/feishu.js');
const fs = require('fs');
const path = require('path');

// 颜色输出
const reset = '\x1b[0m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';

const log = {
  info: (msg) => console.log(`${yellow}[INFO]${reset} ${msg}`),
  success: (msg) => console.log(`${green}[SUCCESS]${reset} ${msg}`),
  error: (msg) => console.error(`${red}[ERROR]${reset} ${msg}`)
};

// 飞书文档配置
const FEISHU_CONFIGS = {
  personal: {
    docToken: 'JiHqdloiAomKBgxDmr0c09SPnSc',
    file: 'personal.md'
  },
  work: {
    docToken: 'Gzl2dRdy8os6a2xJJhpcLcW1nae',
    file: 'work.md'
  }
};

/**
 * 增量同步 - 只同步新增内容
 */
async function incrementalSync(type) {
  const config = FEISHU_CONFIGS[type];
  const filePath = path.join(__dirname, `../backend/data/${config.file}`);
  
  log.info(`开始增量同步 ${type}...`);
  
  // 读取最后同步时间
  const lastSyncTime = feishuDoc.getLastSyncTime(type);
  
  // 读取当前内容
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    log.error(`读取文件失败: ${e.message}`);
    return false;
  }
  
  // 提取新增内容
  const newContent = feishuDoc.parseNewContent(content, lastSyncTime);
  
  if (!newContent || newContent.trim() === '') {
    log.info(`没有新增内容需要同步`);
    return true;
  }
  
  // 同步到飞书
  const result = await feishuDoc.write({
    doc_token: config.docToken,
    content: newContent
  });
  
  if (result.success) {
    // 更新同步时间
    feishuDoc.setLastSyncTime(type, new Date().toISOString());
    log.success(`${type} 增量同步成功`);
    return true;
  } else {
    log.error(`${type} 增量同步失败: ${result.error}`);
    return false;
  }
}

/**
 * 全量同步 - 同步全部内容
 */
async function fullSync(type) {
  const config = FEISHU_CONFIGS[type];
  const filePath = path.join(__dirname, `../backend/data/${config.file}`);
  
  log.info(`开始全量同步 ${type}...`);
  
  // 读取内容
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    log.error(`读取文件失败: ${e.message}`);
    return false;
  }
  
  // 全量同步到飞书
  const result = await feishuDoc.fullSync({
    doc_token: config.docToken,
    content: content
  });
  
  if (result.success) {
    // 更新同步时间
    feishuDoc.setLastSyncTime(type, new Date().toISOString());
    log.success(`${type} 全量同步成功`);
    return true;
  } else {
    log.error(`${type} 全量同步失败: ${result.error}`);
    return false;
  }
}

/**
 * 同步指定类型
 */
async function sync(type, mode = 'incremental') {
  if (mode === 'full') {
    return await fullSync(type);
  } else {
    return await incrementalSync(type);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--full') || args.includes('-f') ? 'full' : 'incremental';
  
  let types = [];
  
  if (args.includes('personal')) {
    types.push('personal');
  } else if (args.includes('work')) {
    types.push('work');
  } else if (args.includes('all')) {
    types = ['personal', 'work'];
  } else {
    console.log('用法: node sync-to-feishu.js [personal|work|all] [--full]');
    console.log('  --full: 全量同步（清除旧内容后写入）');
    console.log('  默认: 增量同步（只追加新内容）');
    process.exit(1);
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`飞书同步工具 - 模式: ${mode === 'full' ? '全量同步' : '增量同步'}`);
  console.log(`${'='.repeat(50)}\n`);
  
  let allSuccess = true;
  
  for (const type of types) {
    const success = await sync(type, mode);
    if (!success) allSuccess = false;
    console.log('');
  }
  
  if (allSuccess) {
    console.log(`${'='.repeat(50)}`);
    console.log('✅ 全部同步完成');
    console.log(`${'='.repeat(50)}`);
    process.exit(0);
  } else {
    console.log(`${'='.repeat(50)}`);
    console.log('❌ 部分同步失败');
    console.log(`${'='.repeat(50)}`);
    process.exit(1);
  }
}

main();
