/**
 * 飞书同步服务
 */
const { MdStorage } = require('./mdStorage');
const { feishuDoc } = require('../utils/feishu');

class SyncService {
  constructor(config) {
    this.config = config;
    this.md = new MdStorage(config.dataDir);
    this.queue = [];
    this.syncing = false;
  }
  
  async init() {
    console.log('[Sync] 初始化完成');
  }
  
  async saveNote(note) {
    // 1. 保存到本地
    await this.md.saveNote(note);
    
    // 2. 加入同步队列
    this.queue.push({ cat: note.category, retry: 0 });
    
    // 3. 触发异步同步
    this.trigger();
  }
  
  async trigger() {
    if (this.syncing || this.queue.length === 0) return;
    this.syncing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      try {
        const content = await this.md.readFile(task.cat);
        const token = task.cat === 'work' 
          ? this.config.workDocToken 
          : this.config.personalDocToken;
        
        await feishuDoc.write({ doc_token: token, content });
        console.log(`[Sync] ${task.cat} 同步成功`);
      } catch (e) {
        console.error(`[Sync] ${task.cat} 失败:`, e.message);
        if (task.retry < 3) {
          task.retry++;
          this.queue.push(task);
        }
      }
    }
    
    this.syncing = false;
  }
  
  async verify(cat) {
    try {
      const local = await this.md.readFile(cat);
      const token = cat === 'work' 
        ? this.config.workDocToken 
        : this.config.personalDocToken;
      const remote = await feishuDoc.read({ doc_token: token });
      return remote.content?.includes(local.slice(0, 50)) || false;
    } catch { 
      return false; 
    }
  }
  
  getMdStorage() {
    return this.md;
  }
}

// 单例
let inst = null;
function getSyncService(cfg) {
  if (!inst && cfg) inst = new SyncService(cfg);
  if (!inst) throw new Error('SyncService 未初始化');
  return inst;
}

module.exports = { SyncService, getSyncService };
