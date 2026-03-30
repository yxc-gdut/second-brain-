# 第二大脑 (Second Brain)

一款 AI 驱动的个人知识库工具，帮助你在阅读、观看内容时快速记录关键信息，自动归类整理。

> 灵感来源：《第二大脑》书籍

## 产品定位

一款轻量级灵感/知识收集工具，帮助用户在阅读、观看内容时快速记录关键信息，自动归类整理，打造个人知识库。

## 核心价值主张

- **记录零摩擦** — 不打断阅读心流，一键/一语完成记录
- **自动智能归类** — AI 自动提取标签，告别手动整理
- **检索高效** — 支持全文搜索，快速找到所需内容
- **数据安全** — Markdown 结构导出，可同步飞书备份

## 目标用户

- 热爱阅读实体书、公众号、小红书等内容的人
- 需要收集金句、数据、灵感用于写作/工作的知识工作者
- 希望构建个人知识体系的终身学习者

## 核心功能

### 📷 拍照识别
实体书拍照，OCR 提取文字，自动识别表格数据

### 🎤 语音输入
语音转文字，不打断阅读，快速记录想法

### ✏️ 文字记录
快速输入文字笔记，支持 Markdown 格式

### 🏷️ AI 标签推荐
基于内容语义自动提取标签（如"茅台"、"用户调研"）

### 💼 智能分类
工作/私人自动分类，AI 建议置信度

### 🔍 AI 问答
通过对话访问知识库，AI 实时分析所有笔记后回答

### 📊 知识图谱
AI 实时生成思维导图式知识图谱

## 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx                                 │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  80 端口        │  │  /api/ → localhost:3000        │  │
│  │  静态文件托管   │  │  /     → /var/www/second-brain │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
        ┌─────▼─────┐                 ┌──────▼──────┐
        │  前端静态  │                 │  后端 API   │
        │  (Vue 3)   │                 │  (Koa 3000) │
        └───────────┘                 └─────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + Vite + PWA | 移动端优先，支持离线访问 |
| 后端 | Koa.js 2.0 + TypeScript | 轻量 API 服务 |
| 存储 | Markdown 文件 + JSON | work.md / personal.md / tags.json |
| OCR | Tesseract OCR (本地) | 印刷体文字识别，支持中英文 |
| ASR | 讯飞语音 | 语音识别转文字 |
| AI | Kimi API | 标签推荐、分类建议、问答 |

## 项目结构

```
second-brain/
├── frontend/          # Vue 3 PWA 前端
│   ├── src/
│   │   ├── api/      # API 客户端
│   │   ├── views/    # 页面组件
│   │   └── components/ # 可复用组件
│   └── dist/         # 构建输出
├── backend/          # Koa.js 后端
│   ├── src/
│   │   ├── routes/   # API 路由
│   │   └── services/ # 业务逻辑
│   ├── data/         # Markdown 数据
│   │   ├── work.md
│   │   ├── personal.md
│   │   └── tags.json
│   └── .env          # 环境变量配置
├── nginx/            # Nginx 配置
│   └── second-brain.conf
└── README.md
```

## 快速开始

### 后端

```bash
cd backend
npm install

# 配置环境变量（可选，用于 LLM 功能）
cp .env.example .env
# 编辑 .env 文件，填入你的 LLM API Key

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

### 生产环境部署

1. **构建前端**
```bash
cd frontend
npm run build
sudo cp -r dist /var/www/second-brain
sudo chmod -R 755 /var/www/second-brain
```

2. **配置 Nginx**
```bash
sudo cp nginx/second-brain.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/second-brain.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo nginx -s reload
```

3. **启动后端服务**
```bash
cd backend
npm install
# 创建 .env 文件并配置密钥
npm run dev
# 或使用 pm2: pm2 start src/app.ts --name second-brain-api
```

## 环境变量配置

后端支持从 `.env` 文件加载环境变量，参考 `backend/.env.example`。

### OCR 配置（Tesseract）

Tesseract OCR 在本地运行，无需配置 API Key。

**安装依赖：**
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim tesseract-ocr-chi-tra

# macOS
brew install tesseract tesseract-lang
```

**验证安装：**
```bash
tesseract --version
```

### LLM 配置（可选）

```bash
export LLM_API_KEY="your-api-key"
export LLM_API_URL="https://api.openai.com/v1/chat/completions"
export LLM_MODEL="gpt-3.5-turbo"
```

## API 接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/notes` | GET/POST | 笔记列表/创建 |
| `/api/notes/:id` | GET/PUT/DELETE | 单条笔记操作 |
| `/api/ocr/preview` | POST | 图片 OCR 识别 |
| `/api/tags/suggest` | POST | 标签推荐 |
| `/api/chat` | POST | AI 问答 |
| `/api/search` | GET | 全文搜索 |

## 数据存储格式

### Markdown 格式

```markdown
# 工作知识库

## 2025-03-24 14:30 | 财务,销售数据
**来源**：小红书
**分类**：工作
**图片**：/images/xxx.jpg（可选）

Q1销售额增长20%，主要得益于新渠道拓展...

---

## 2025-03-24 16:00 | 产品,用户调研
**来源**：《用户体验要素》
**分类**：工作

用户研究的核心是理解用户目标...
```

### 标签存储格式

```json
{
  "tags": [
    {
      "name": "财务",
      "color": "#EF4444",
      "lastUsedAt": "2025-03-24T14:30:00Z",
      "useCount": 15
    }
  ]
}
```

## 使用场景

### 场景一：阅读实体书
1. 看到精彩段落，打开手机 App
2. 选择拍照或语音输入
3. AI 自动识别文字并提取标签
4. 自动记录来源（可手动补充书名）
5. 一键保存，继续阅读

### 场景二：刷小红书/微信文章
1. 看到有价值的内容，截图保存
2. 如整篇文章有价值，复制链接收藏
3. AI 自动 OCR 截图内容，提取关键信息
4. 自动记录来源（小红书账号/公众号名称）
5. 自动生成标签归类

### 场景三：PC 端整理
1. 打开手机端同步的内容
2. 全文搜索查找特定记录
3. 按标签浏览，整理知识体系
4. 导出 Markdown 到飞书备份

## 开发进度

- ✅ Phase 1: 基础功能（Vue + Koa + Markdown 存储）
- ✅ Phase 2: 智能输入（OCR + 标签推荐）
- ✅ Phase 3: AI 功能（问答 + 搜索）
- ✅ Phase 4: 生产环境部署（Nginx + 静态文件托管）
- 📝 Phase 5: 优化（PWA 离线、性能优化）

## 相关文档

- [技术设计文档](https://my.feishu.cn/docx/E8lJdE9MtobI5Kxf33Hc4spantb)
- [产品需求文档（PRD）](https://my.feishu.cn/docx/RG7bdvw4MonYK8xHLy8cFmA8n5c)

## License

MIT
