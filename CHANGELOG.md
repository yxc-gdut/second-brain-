# 更新日志

## 2026-05-04（质量走廊）
- ✅ **Gate 1：AI 编码规则增强**
  - CLAUDE.md 新增组件开发模板、API 调用规范、状态管理规范、错误处理规范
  - Cursor Rules 增强安全红线、性能规范、禁止模式清单
  - Cursor Rules 增强前端 E2E 测试规范、KDesign Token 规范、组件拆分原则
- ✅ **Gate 2：Pre-commit Hook 完善**
  - lint-staged 配置（提交时自动 eslint + prettier）
  - ESLint 加强：no-explicit-any → error、no-console → warn
  - 移除 Settings.vue 中的 any 类型
- ✅ **Gate 3：CI 增强**
  - ci.yml 新增 concurrency（同 PR 只跑最后一次）+ permissions 限制
  - 新增 e2e job（Playwright E2E 测试，含报告上传）
  - 新增 PULL_REQUEST_TEMPLATE.md
- ✅ **Gate 4：Vitest 单元测试**
  - 安装 vitest + @vue/test-utils + jsdom
  - 新增工具函数：validation.ts、format.ts、extractJSON.ts
  - 72 个单元测试全部通过
- ✅ **Gate 5：E2E 回归保护**
  - Playwright E2E 框架（Chromium 移动端 375x812）
  - 10 个 E2E 用例覆盖核心用户路径，全部通过
  - AI Review Bot（scripts/ai-review.mjs）- GitHub PR webhook 审查服务
  - PM2 配置（ecosystem.config.cjs）
  - 服务器已部署，端口 3457

## 2026-05-04
- ✅ **设计系统迁移：Apple Design → KDesign**
  - 新增 `kdesign-tokens.css` 全局设计变量（颜色、字号、字重、圆角、阴影、动效等）
  - 移除 `apple.css` 和 `design.md`（Apple Design 参考文档）
  - 所有组件（App.vue、Home、Chat、NoteDetail、Preview、Settings、CaptureButton、CategorySelector、NoteCard、WelcomeItem）统一迁移至 KDesign Token
  - 统一字体系统、间距、边框、圆角、阴影、交互状态
  - 重构按钮（Primary/Secondary/Light/Danger）、Tag、Modal、Input、Loading 等基础组件样式
  - 骨架屏改用 KDesign pulse 动画
  - 聊天页头像改为文字头像（AI/我），消息气泡改用 KDesign 风格
- ✅ 新增后端健康检查脚本 `backend/health-check.sh`（PM2 自动重启）

## 2026-04-29 22:02
- ✅ 修复新建笔记后飞书同步不触发的 TODO
- ✅ 新增笔记异步触发增量同步到飞书（fire-and-forget）
- ✅ PM2 管理后端进程，开机自启

## 2026-04-22 22:45
- ✅ 新增代码规范体系：ESLint + Prettier + Husky pre-commit hook
- ✅ 新增 GitHub Actions CI workflow（lint + type-check + build）
- ✅ 新增 VS Code 插件推荐和项目级设置
- ✅ 新增 CLAUDE.md（AI 开发规范指南，供 Cursor 等工具参考）
- ✅ 新增 CONTRIBUTING.md 协作开发指南
- ✅ 修复 Chat.vue 中 NoteDetail import 路径错误

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
