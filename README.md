# 第二大脑 (Second Brain)

个人知识管理系统，帮助用户快速记录阅读中的关键信息，自动归类整理。

## 技术栈

- **前端**: Vue 3 + Vite + PWA + Tailwind CSS
- **后端**: Koa.js + Node.js
- **存储**: Markdown 文件
- **AI**: Kimi API / Moonshot API

## 快速开始

### 后端

```bash
cd backend
npm install
node src/app.js
```

后端端口: 3000

### 前端

```bash
cd frontend
npm install
npm run dev
```

### 生产环境部署

```bash
# 构建前端
cd frontend && npm run build

# 配置 Nginx
sudo cp nginx/second-brain.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/second-brain.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload

# 启动后端
cd backend && node src/app.js
```

## 功能

- [x] 文字输入笔记
- [x] 图片 OCR 识别
- [x] 语音输入 (ASR)
- [x] AI 自动标签
- [x] 工作/私人分类
- [x] Markdown 数据存储
- [x] AI 问答 (Kimi k2.5)
- [ ] 飞书同步

## 文档

- [PRD](https://my.feishu.cn/docx/RG7bdvw4MonYK8xHLy8cFmA8n5c)
- [技术设计](https://my.feishu.cn/docx/E8lJdE9MtobI5Kxf33Hc4spantb)

## 更新日志

见 CHANGELOG.md

---

最后更新: 2026-04-09
