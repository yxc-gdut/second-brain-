/**
 * 聊天服务 - 直接读取 MD 文档，AI 回答
 */
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

// LLM 配置
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-3.5-turbo';

/**
 * 检查 LLM 是否可用
 */
function isLLMAvailable() {
  return !!LLM_API_KEY;
}

/**
 * 调用 LLM API
 */
async function callLLM(messages) {
  if (!LLM_API_KEY) {
    throw new Error('LLM API Key 未配置');
  }

  const response = await axios.post(LLM_API_URL, {
    model: LLM_MODEL,
    messages,
    temperature: LLM_MODEL.includes('kimi') ? 1 : 0.7,
    max_tokens: 1500
  }, {
    headers: {
      'Authorization': 'Bearer ' + LLM_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  return response.data.choices?.[0]?.message?.content || '';
}

/**
 * 读取 MD 文档内容
 */
async function readMdDocument(category) {
  const filePath = path.join(DATA_DIR, category + '.md');
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return category === 'work' 
      ? '# 工作知识库\n\n_记录工作相关的知识和灵感_\n'
      : '# 私人知识库\n\n_记录个人生活的知识和灵感_\n';
  }
}

/**
 * 获取所有笔记内容
 */
async function getAllDocuments() {
  const personal = await readMdDocument('personal');
  const work = await readMdDocument('work');
  return { personal, work };
}

/**
 * 生成知识结构
 */
async function generateKnowledgeStructure() {
  const { personal, work } = await getAllDocuments();
  
  // 简单统计
  const personalCount = (personal.match(/## /g) || []).length;
  const workCount = (work.match(/## /g) || []).length;
  
  let structure = '## 知识库统计\n\n';
  structure += '🏠 私人笔记: ' + personalCount + ' 条\n';
  structure += '💼 工作笔记: ' + workCount + ' 条\n';
  structure += '📚 总计: ' + (personalCount + workCount) + ' 条\n';
  
  return structure;
}

/**
 * 回答用户问题
 */
async function chat(query, history) {
  history = history || [];
  
  // 特殊指令处理
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('知识结构') || lowerQuery.includes('知识图谱') || lowerQuery.includes('统计')) {
    const structure = await generateKnowledgeStructure();
    return {
      role: 'assistant',
      content: structure
    };
  }

  // 读取所有文档
  const { personal, work } = await getAllDocuments();
  const allContent = '## 私人知识库\n\n' + personal + '\n\n## 工作知识库\n\n' + work;
  
  // 如果 LLM 可用，让 AI 直接基于文档内容回答
  if (isLLMAvailable()) {
    const systemPrompt = '你是用户的"第二大脑"助手。你的任务是帮助用户回顾和整理笔记。\n\n' +
      '用户的问题是："' + query + '"\n\n' +
      '请基于以下笔记内容回答用户的问题。如果笔记中没有相关信息，请如实告知。\n\n' +
      '笔记内容：\n' + allContent.slice(0, 8000);
    
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
    
    const answer = await callLLM(messages);
    return {
      role: 'assistant',
      content: answer
    };
  }

  // LLM 不可用时，简单关键词匹配
  // 提取中文字符和数字作为关键词
  const queryLower = query.toLowerCase();
  const keywords = [];
  
  // 提取中文词组（2-6字）
  const chineseMatches = queryLower.match(/[\u4e00-\u9fa5]{2,6}/g);
  if (chineseMatches) keywords.push(...chineseMatches);
  
  // 提取数字（2-4位）
  const numberMatches = queryLower.match(/\d{2,4}/g);
  if (numberMatches) {
    for (const num of numberMatches) {
      keywords.push(num);
      // 同时添加简化版本（2025 -> 25）
      if (num.length === 4 && num.startsWith('20')) {
        keywords.push(num.slice(2));
      }
    }
  }
  
  const content = allContent.toLowerCase();
  console.log('[Chat] 搜索关键词:', keywords);
  
  let hasMatch = false;
  let matchedKw = '';
  for (const kw of keywords) {
    if (content.includes(kw)) {
      hasMatch = true;
      matchedKw = kw;
      break;
    }
  }
  console.log('[Chat] 匹配结果:', hasMatch, matchedKw);
  
  if (hasMatch) {
    return {
      role: 'assistant',
      content: '我在你的笔记中找到了相关内容。请配置 LLM API Key 以获得更智能的回答。'
    };
  }
  
  return {
    role: 'assistant',
    content: '我没有在你的笔记中找到相关内容。'
  };
}

// 快捷问题模板
const quickQuestions = [
  '我的知识结构？',
  '最近学了什么？',
  '工作相关笔记',
  '私人笔记有哪些？'
];

module.exports = {
  quickQuestions,
  isLLMAvailable,
  chat
};
