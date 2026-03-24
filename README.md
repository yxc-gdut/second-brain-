# 第二大脑 (Second Brain)

一款 AI 驱动的个人知识库工具，帮助你在阅读、观看内容时快速记录关键信息，自动归类整理。

## 核心功能

- 📷 **拍照识别** - OCR 提取实体书文字
- 🎤 **语音输入** - ASR 转写，不打断阅读
- ✏️ **文字记录** - 快速输入笔记
- 🤖 **AI 自动分类** - 智能区分工作/私人
- 💬 **AI 问答** - 通过对话访问知识库

## 技术栈

- **前端**: Vue 3 + Vite + PWA + Tailwind CSS
- **后端**: Koa.js + TypeScript
- **存储**: Markdown 文件 (work.md + personal.md)
- **AI**: Kimi API
- **OCR**: 百度表格识别
- **ASR**: 讯飞语音

## 项目结构

```
second-brain/
├── frontend/          # Vue 3 PWA 前端
├── backend/           # Koa.js 后端
└── README.md
```

## 开发计划

- Phase 1: 基础功能（项目骨架 + Markdown 存储）
- Phase 2: 智能输入（OCR + ASR）
- Phase 3: AI 功能（问答 + 分类）
- Phase 4: 优化（PWA + 性能）

## 文档

- [PRD 文档](https://my.feishu.cn/docx/RG7bdvw4MonYK8xHLy8cFmA8n5c)
- [技术设计文档](https://my.feishu.cn/docx/E8lJdE9MtobI5Kxf33Hc4spantb)
