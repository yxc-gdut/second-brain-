# AI Review Bot

自动审查 GitHub PR 的代码质量和 E2E 用例覆盖。

## 功能

- 分析 PR diff，提取受影响的页面/组件/API
- 检查 E2E 用例是否覆盖改动
- 审查新增 E2E 用例质量
- 代码质量检查（console.log、any 类型等）
- 将审查报告发布到 PR comment

## 使用

### 启动服务

```bash
# 使用 PM2
pm2 start scripts/ecosystem.config.cjs

# 或直接运行
node scripts/ai-review.mjs
```

### 测试单个 PR

```bash
GITHUB_TOKEN=ghp_xxx node scripts/ai-review.mjs --once --pr 1
```

### GitHub Webhook 配置

1. 仓库 Settings → Webhooks → Add webhook
2. Payload URL: `http://175.178.94.65:3457/webhook`
3. Content type: `application/json`
4. Secret: （可选，配置 WEBHOOK_SECRET 环境变量）
5. Events: Pull requests

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| GITHUB_TOKEN | GitHub Personal Access Token | ✅ |
| PORT | 服务端口 | 默认 3457 |
| WEBHOOK_SECRET | Webhook 签名密钥 | 可选 |
| REPO_OWNER | 仓库 owner | 默认 yxc-gdut |
| REPO_NAME | 仓库名 | 默认 second-brain- |

## 审查报告格式

Bot 会在 PR 中发布包含以下内容的 comment：

- 📋 变更概览（受影响的页面/组件/API）
- 🧪 E2E 用例覆盖检查
- 🔍 代码质量检查
- 🆕 新增 E2E 用例审查
- 📊 总结（回归风险评估）
