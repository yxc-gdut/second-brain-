/**
 * 飞书文档工具 - 完整实现
 * 支持全量同步和增量同步
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// 飞书配置
const FEISHU_CONFIG = {
  appId: process.env.FEISHU_APP_ID || 'cli_a93d12281fbc1bd3',
  appSecret: process.env.FEISHU_APP_SECRET || 'EgS66Ea3pxWMDKf91TpDifEPJr5HZr8z'
};

let tenantAccessToken = null;
let tokenExpireTime = 0;

const feishuDoc = {
  /**
   * 获取 tenant access token
   */
  async getToken() {
    if (tenantAccessToken && Date.now() < tokenExpireTime) {
      return tenantAccessToken;
    }
    
    const data = await this.httpPost('/auth/v3/tenant_access_token/internal', {
      app_id: FEISHU_CONFIG.appId,
      app_secret: FEISHU_CONFIG.appSecret
    });
    
    if (data.code !== 0) {
      throw new Error(`获取 Token 失败: ${data.msg}`);
    }
    
    tenantAccessToken = data.tenant_access_token;
    tokenExpireTime = Date.now() + (data.expire - 60) * 1000;
    
    return tenantAccessToken;
  },

  /**
   * HTTP GET 请求
   */
  httpGet(pathname, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: '/open-apis' + pathname,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  },

  /**
   * HTTP POST 请求
   */
  httpPost(pathname, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const body = JSON.stringify(data);
      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: '/open-apis' + pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseData));
          } catch {
            resolve(responseData);
          }
        });
      });

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  },

  /**
   * 解析 Markdown 内容为飞书 blocks
   */
  parseMarkdownToBlocks(markdown) {
    const lines = markdown.split('\n');
    const blocks = [];
    let currentText = '';
    let inCodeBlock = false;
    let codeContent = [];

    const flushText = () => {
      if (currentText.trim()) {
        blocks.push({
          block_type: 2, // text
          text: {
            elements: [{
              text_run: {
                content: currentText,
                text_element_style: {}
              }
            }],
            style: {}
          }
        });
        currentText = '';
      }
    };

    for (const line of lines) {
      // 跳过仅包含---的行（分隔线）
      if (line.trim() === '---') {
        flushText();
        blocks.push({ block_type: 22 }); // divider
        continue;
      }

      // 代码块
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // 结束代码块
          blocks.push({
            block_type: 14, // code
            code: {
              elements: [{
                text_run: {
                  content: codeContent.join('\n'),
                  text_element_style: {}
                }
              }],
              style: { language: 1 }
            }
          });
          codeContent = [];
          inCodeBlock = false;
        } else {
          flushText();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // 一级标题
      if (line.startsWith('# ')) {
        flushText();
        blocks.push({
          block_type: 3, // heading1
          heading1: {
            elements: [{
              text_run: {
                content: line.substring(2),
                text_element_style: {}
              }
            }],
            style: {}
          }
        });
        continue;
      }

      // 二级标题
      if (line.startsWith('## ')) {
        flushText();
        blocks.push({
          block_type: 4, // heading2
          heading2: {
            elements: [{
              text_run: {
                content: line.substring(3),
                text_element_style: {}
              }
            }],
            style: {}
          }
        });
        continue;
      }

      // 三级标题
      if (line.startsWith('### ')) {
        flushText();
        blocks.push({
          block_type: 5, // heading3
          heading3: {
            elements: [{
              text_run: {
                content: line.substring(4),
                text_element_style: {}
              }
            }],
            style: {}
          }
        });
        continue;
      }

      // 无序列表
      if (line.match(/^[-*+]\s/)) {
        flushText();
        blocks.push({
          block_type: 12, // bullet
          bullet: {
            elements: [{
              text_run: {
                content: line.replace(/^[-*+]\s/, ''),
                text_element_style: {}
              }
            }],
            style: {}
          }
        });
        continue;
      }

      // 有序列表
      if (line.match(/^\d+\.\s/)) {
        flushText();
        blocks.push({
          block_type: 13, // ordered
          ordered: {
            elements: [{
              text_run: {
                content: line.replace(/^\d+\.\s/, ''),
                text_element_style: {}
              }
            }],
            style: {}
          }
        });
        continue;
      }

      // 普通文本
      currentText += (currentText ? '\n' : '') + line;
    }

    flushText();
    return blocks;
  },

  /**
   * 批量创建 blocks
   */
  async createBlocks(docToken, parentBlockId, markdown, token) {
    const blocks = this.parseMarkdownToBlocks(markdown);
    
    if (blocks.length === 0) {
      console.log('[Feishu] 没有内容需要同步');
      return { success: true };
    }

    // 分批创建，每批最多 50 个
    const batchSize = 50;
    let index = 0;

    while (index < blocks.length) {
      const batch = blocks.slice(index, index + batchSize);
      
      const result = await this.httpPost(
        `/docx/v1/documents/${docToken}/blocks/${parentBlockId}/children`,
        { children: batch, index: -1 },
        { 'Authorization': `Bearer ${token}` }
      );

      if (result.code !== 0) {
        throw new Error(`创建 Block 失败: ${result.msg}`);
      }

      index += batchSize;
      console.log(`[Feishu] 已创建 ${Math.min(index, blocks.length)}/${blocks.length} blocks`);
    }

    return { success: true };
  },

  /**
   * 增量同步 - 只追加新内容到文档末尾
   */
  async write(options) {
    try {
      console.log(`[Feishu] 开始增量同步: ${options.doc_token}`);
      
      const token = await this.getToken();
      
      // 获取文档 blocks
      const docInfo = await this.httpGet(
        `/docx/v1/documents/${options.doc_token}/blocks`,
        { 'Authorization': `Bearer ${token}` }
      );

      if (docInfo.code !== 0) {
        throw new Error(`获取文档失败: ${docInfo.msg}`);
      }

      // 获取 page block
      const pageBlock = docInfo.data?.items?.find(b => b.block_type === 1);
      if (!pageBlock) {
        throw new Error('未找到 page block');
      }

      // 增量同步：在末尾追加新内容
      const result = await this.createBlocks(
        options.doc_token,
        pageBlock.block_id,
        options.content,
        token
      );

      console.log(`[Feishu] ✅ 增量同步成功`);
      return { success: true };
    } catch (error) {
      console.error(`[Feishu] ❌ 同步失败:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 全量同步 - 清除旧内容后写入新内容
   */
  async fullSync(options) {
    try {
      console.log(`[Feishu] 开始全量同步: ${options.doc_token}`);
      
      const token = await this.getToken();
      
      // 获取文档 blocks
      const docInfo = await this.httpGet(
        `/docx/v1/documents/${options.doc_token}/blocks`,
        { 'Authorization': `Bearer ${token}` }
      );

      if (docInfo.code !== 0) {
        throw new Error(`获取文档失败: ${docInfo.msg}`);
      }

      // 获取 page block
      const pageBlock = docInfo.data?.items?.find(b => b.block_type === 1);
      if (!pageBlock) {
        throw new Error('未找到 page block');
      }

      // 获取现有的子 blocks
      const children = pageBlock.children || [];

      // 清除旧内容
      if (children.length > 0) {
        await this.httpPost(
          `/docx/v1/documents/${options.doc_token}/blocks/${pageBlock.block_id}/children/delete`,
          { start_index: 0, end_index: children.length },
          { 'Authorization': `Bearer ${token}` }
        );
        console.log(`[Feishu] 已清除旧内容 (${children.length} blocks)`);
      }

      // 写入新内容
      const result = await this.createBlocks(
        options.doc_token,
        pageBlock.block_id,
        options.content,
        token
      );

      console.log(`[Feishu] ✅ 全量同步成功`);
      return { success: true };
    } catch (error) {
      console.error(`[Feishu] ❌ 全量同步失败:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 获取最后同步时间
   */
  getLastSyncTime(docType) {
    try {
      const syncFile = path.join(__dirname, '../../data/.sync_status.json');
      if (fs.existsSync(syncFile)) {
        const data = JSON.parse(fs.readFileSync(syncFile, 'utf-8'));
        return data[docType]?.lastSyncTime || null;
      }
    } catch (e) {
      console.error('[Feishu] 读取同步状态失败:', e.message);
    }
    return null;
  },

  /**
   * 保存最后同步时间
   */
  setLastSyncTime(docType, lastSyncTime) {
    try {
      const syncFile = path.join(__dirname, '../../data/.sync_status.json');
      let data = {};
      if (fs.existsSync(syncFile)) {
        data = JSON.parse(fs.readFileSync(syncFile, 'utf-8'));
      }
      if (!data[docType]) data[docType] = {};
      data[docType].lastSyncTime = lastSyncTime;
      fs.writeFileSync(syncFile, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('[Feishu] 保存同步状态失败:', e.message);
    }
  },

  /**
   * 解析 MD 内容，提取指定时间之后的新内容
   */
  parseNewContent(markdown, sinceTime) {
    if (!sinceTime) return markdown;
    
    const sinceDate = new Date(sinceTime);
    const lines = markdown.split('\n');
    const newLines = [];
    let capture = false;
    let lastDate = null;

    for (const line of lines) {
      // 匹配时间戳格式：## YYYY-MM-DD 或 ## YYYY-MM-DDTHH:mm:ss
      const dateMatch = line.match(/^##\s+(\d{4}-\d{2}-\d{2})(?:T\d{2}:\d{2}:\d{2})?/);
      if (dateMatch) {
        lastDate = new Date(dateMatch[1]);
        capture = lastDate > sinceDate;
      }
      
      if (capture) {
        newLines.push(line);
      }
    }

    return newLines.join('\n');
  }
};

module.exports = { feishuDoc };
