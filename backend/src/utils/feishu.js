/**
 * 飞书文档工具 - 完整实现
 * 直接调用飞书 Open API
 */
const https = require('https');

// 飞书配置
const FEISHU_CONFIG = {
  appId: process.env.FEISHU_APP_ID || 'cli_a93d12281fbc1bd3',
  appSecret: process.env.FEISHU_APP_SECRET || 'EgS66Ea3pxWMDKf91TpDifEPJr5HZr8z'
};

let tenantAccessToken = null;
let tokenExpireTime = 0;

const feishuDoc = {
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
    tokenExpireTime = Date.now() + (data.expire - 300) * 1000;
    return tenantAccessToken;
  },

  async httpPost(path, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: `/open-apis${path}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        }
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(responseData)); } 
          catch { resolve({ code: -1, msg: responseData }); }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  },

  async httpGet(path, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'open.feishu.cn',
        port: 443,
        path: `/open-apis${path}`,
        method: 'GET',
        headers
      };
      
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(responseData)); } 
          catch { resolve({ code: -1, msg: responseData }); }
        });
      });
      
      req.on('error', reject);
      req.end();
    });
  },

  /**
   * 写入飞书文档 - 使用 raw_content API
   */
  async write(options) {
    try {
      console.log(`[Feishu] 开始写入: ${options.doc_token}`);
      
      const token = await this.getToken();
      
      // 方案：使用飞书文档的 raw_content 方式
      // 先获取文档信息，找到可编辑的 block
      const docInfo = await this.httpGet(
        `/docx/v1/documents/${options.doc_token}/blocks`,
        { 'Authorization': `Bearer ${token}` }
      );
      
      if (docInfo.code !== 0) {
        throw new Error(`获取文档失败: ${docInfo.msg}`);
      }
      
      // 获取第一个 page block 的 ID
      const pageBlock = docInfo.data?.items?.find(b => b.block_type === 1);
      if (!pageBlock) {
        throw new Error('未找到 page block');
      }
      
      // 在 page block 下创建子 block
      const result = await this.createBlocks(
        options.doc_token, 
        pageBlock.block_id, 
        options.content, 
        token
      );
      
      console.log(`[Feishu] ✅ 写入成功`);
      return { success: true };
    } catch (error) {
      console.error(`[Feishu] ❌ 写入失败:`, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * 创建 blocks
   */
  async createBlocks(docToken, parentBlockId, content, token) {
    // 解析 Markdown 为 blocks
    const lines = content.split('\n').filter(l => l.trim());
    const blocks = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      let block;
      
      if (trimmed.startsWith('# ')) {
        block = {
          block_type: 3, // heading1
          heading1: {
            elements: [{ text_run: { content: trimmed.substring(2) } }]
          }
        };
      } else if (trimmed.startsWith('## ')) {
        block = {
          block_type: 4, // heading2
          heading2: {
            elements: [{ text_run: { content: trimmed.substring(3) } }]
          }
        };
      } else if (trimmed.startsWith('- ')) {
        block = {
          block_type: 12, // bullet
          bullet: {
            elements: [{ text_run: { content: trimmed.substring(2) } }]
          }
        };
      } else if (trimmed === '---') {
        block = {
          block_type: 22, // divider
          divider: {}
        };
      } else {
        block = {
          block_type: 2, // text
          text: {
            elements: [{ text_run: { content: trimmed } }]
          }
        };
      }
      
      blocks.push(block);
    }
    
    // 分批创建（每批最多 50 个）
    const batchSize = 50;
    for (let i = 0; i < blocks.length; i += batchSize) {
      const batch = blocks.slice(i, i + batchSize);
      
      const result = await this.httpPost(
        `/docx/v1/documents/${docToken}/blocks/${parentBlockId}/children`,
        { children: batch },
        { 'Authorization': `Bearer ${token}` }
      );
      
      if (result.code !== 0) {
        throw new Error(`创建 block 失败: ${result.msg}`);
      }
    }
    
    return { success: true };
  },

  async read(options) {
    try {
      const token = await this.getToken();
      
      const result = await this.httpGet(
        `/docx/v1/documents/${options.doc_token}/blocks`,
        { 'Authorization': `Bearer ${token}` }
      );
      
      if (result.code === 0) {
        const content = this.parseBlocks(result.data?.items || []);
        return { success: true, content };
      } else {
        throw new Error(result.msg);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  parseBlocks(blocks) {
    const lines = [];
    
    for (const block of blocks) {
      const text = block.text?.elements?.[0]?.text_run?.content || 
                   block.heading1?.elements?.[0]?.text_run?.content ||
                   block.heading2?.elements?.[0]?.text_run?.content ||
                   block.bullet?.elements?.[0]?.text_run?.content || '';
      
      switch (block.block_type) {
        case 3: lines.push(`# ${text}`); break;
        case 4: lines.push(`## ${text}`); break;
        case 2: lines.push(text); break;
        case 12: lines.push(`- ${text}`); break;
        case 22: lines.push('---'); break;
        default: if (text) lines.push(text);
      }
    }
    
    return lines.join('\n');
  }
};

module.exports = { feishuDoc };
