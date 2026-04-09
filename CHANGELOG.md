# 更新日志

## 2026-04-10 01:22
- ✅ 启动脚本改用 pm2 管理进程（挂了自动重启）
- ✅ 配置金山文档同步（wps-doc-cli）
- ✅ 同步 personal.md 和 work.md 到金山文档
- ✅ 设置每周日凌晨自动同步到金山文档

## 2026-04-09 19:21
- ✅ 实现增量同步功能（只追加新增内容，不再重复）
- ✅ 修复飞书 API 路径（添加 /open-apis 前缀）
- ✅ 支持全量同步（--full）和增量同步模式
- ✅ 设置每日凌晨 2:00 自动全量同步
- ✅ 浏览器标签页标题改为"第二大脑"

## 2026-04-09 18:19
- ✅ 修复 Tailwind CSS v4 语法问题（@tailwind → @import "tailwindcss"）
- ✅ 修复 Kimi k2.5 API temperature 配置（必须为 1）
- ✅ 部署第二大脑到外网 175.178.94.65
- ✅ AI 问答功能正式启用

## 2026-04-08 22:01
- ✅ UI 大翻新：Apple Design System 设计规范
- ✅ 新增 apple.css 设计系统变量
- ✅ 首页：黑色英雄区 + 胶囊按钮
- ✅ AI 问答：全黑 ChatGPT 风格界面
- ✅ 设置页：深色半透明卡片 + 统计数据
- ✅ 预览页：沉浸式深色录入界面
- ✅ 新增 NoteDetail 笔记详情页
- ✅ 玻璃态导航栏 (backdrop-filter blur)

## 2026-04-08 20:55
- ✅ 新增 API 路由：chat、ocr、search、tags
- ✅ 新增服务：markdown存储、chat、ocrService、tag
- ✅ 修复笔记解析 bug（parseMarkdown 空行问题）
- ✅ 后端服务数据目录调整为 backend/data
- ✅ 前端 PWA + Nginx 已部署

## 2026-04-06 16:08
- ✅ 工作流测试成功
- ✅ 飞书自动同步功能完成
- ✅ 代码已推送到 GitHub

## 2026-04-06 16:01
- ✅ 实现飞书自动同步功能
- ✅ 部署到生产环境
- ✅ 代码已推送到 GitHub
