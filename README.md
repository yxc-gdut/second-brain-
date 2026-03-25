# 第二大脑 (Second Brain)

一款 AI 驱动的个人知识库工具，帮助你在阅读、观看内容时快速记录关键信息，自动归类整理。

## 核心功能

- 📷 **拍照识别** - OCR 提取图片文字
- 🎤 **语音输入** - 语音转文字（预留接口）
- ✏️ **文字记录** - 快速输入笔记
- 🏷️ **AI 标签推荐** - 智能推荐标签
- 💼 **智能分类** - 工作/私人自动分类
- 🔍 **全文搜索** - 关键词+分类筛选
- 💬 **AI 问答** - 通过对话访问知识库

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite + PWA + Tailwind CSS
- **后端**: Koa.js + TypeScript
- **存储**: Markdown 文件 + JSON 索引
- **AI**: OpenAI/Claude API（可选）
- **OCR**: 百度 OCR API（可选）

## 项目结构

```
second-brain/
├── frontend/          # Vue 3 PWA 前端
│   ├── src/
│   │   ├── api/     # API 客户端
│   │   ├── views/   # 页面组件
│   │   └── components/ # 可复用组件
│   └── package.json
├── backend/          # Koa.js 后端
│   ├── src/
│   │   ├── routes/  # API 路由
│   │   └── services/ # 业务逻辑
│   └── package.json
└── README.md
```

## 快速开始

### 后端
```bash
cd backend
npm install
npm run dev
# 服务运行在 http://localhost:3000
```

### 前端
```bash
cd frontend
npm install
npm run dev
# 服务运行在 http://localhost:3001
```

## 环境变量（可选）

### OCR 配置（百度智能云）
```bash
export BAIDU_OCR_API_KEY="your-api-key"
export BAIDU_OCR_SECRET_KEY="your-secret-key"
```

### LLM 配置（OpenAI/Claude）
```bash
export LLM_API_KEY="your-api-key"
export LLM_API_URL="https://api.openai.com/v1/chat/completions"
export LLM_MODEL="gpt-3.5-turbo"
```

## API 文档

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/notes` | GET/POST | 笔记列表/创建 |
| `/api/notes/:id` | GET/PUT/DELETE | 单条笔记操作 |
| `/api/ocr/preview` | POST | 图片 OCR 识别 |
| `/api/tags/suggest` | POST | 标签推荐 |
| `/api/chat` | POST | AI 问答 |
| `/api/search` | GET | 全文搜索 |

## 开发进度

- ✅ Phase 1: 基础功能（Vue + Koa + Markdown 存储）
- ✅ Phase 2: 智能输入（OCR + 标签推荐）
- ✅ Phase 3: AI 功能（问答 + 搜索）
- 📝 Phase 4: 优化（PWA 离线、性能优化）

## 截图

![首页](screenshots/home.png)
![录入](screenshots/preview.png)
![AI问答](screenshots/chat.png)

## License

MIT
