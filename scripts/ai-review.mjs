#!/usr/bin/env node
/**
 * AI Review Bot
 * 
 * 接收 GitHub PR webhook，分析 diff，审查代码质量和 E2E 用例，
 * 将审查结论发布到 PR comment。
 * 
 * 使用方式：
 *   node scripts/ai-review.mjs          # 启动 HTTP 服务
 *   node scripts/ai-review.mjs --once   # 处理单个 PR（测试用）
 *   
 * 环境变量：
 *   PORT            - 服务端口（默认 3457）
 *   GITHUB_TOKEN    - GitHub Personal Access Token（需要 repo 和 PR 权限）
 *   WEBHOOK_SECRET  - GitHub Webhook secret（可选，签名验证）
 *   REPO_OWNER      - 仓库 owner（默认 yxc-gdut）
 *   REPO_NAME       - 仓库名（默认 second-brain-）
 */

import http from 'node:http'
import crypto from 'node:crypto'
import { readdirSync } from 'node:fs'

const CONFIG = {
  port: parseInt(process.env.PORT || '3457'),
  githubToken: process.env.GITHUB_TOKEN || '',
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  repoOwner: process.env.REPO_OWNER || 'yxc-gdut',
  repoName: process.env.REPO_NAME || 'second-brain-',
}

// ===== GitHub API 工具 =====

async function githubRequest(path, options = {}) {
  const url = `https://api.github.com${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CONFIG.githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GitHub API error ${response.status}: ${text}`)
  }
  return response.json()
}

async function getPRDiff(prNumber) {
  const data = await githubRequest(
    `/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/pulls/${prNumber}`
  )
  const diffResponse = await fetch(data.diff_url)
  return await diffResponse.text()
}

async function getPRFiles(prNumber) {
  return githubRequest(
    `/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/pulls/${prNumber}/files`
  )
}

async function createPRComment(prNumber, body) {
  return githubRequest(
    `/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/issues/${prNumber}/comments`,
    { method: 'POST', body: JSON.stringify({ body }) }
  )
}

// ===== 分析逻辑 =====

/**
 * 从 diff 中提取受影响的页面和组件
 */
function analyzeDiff(diff, files) {
  const affectedPages = []
  const affectedComponents = []
  const affectedAPI = []
  const affectedRoutes = []

  for (const file of files) {
    const path = file.filename
    
    // 前端页面
    if (path.startsWith('frontend/src/views/')) {
      const page = path.replace('frontend/src/views/', '').replace('.vue', '')
      affectedPages.push(page)
    }
    
    // 前端组件
    if (path.startsWith('frontend/src/components/')) {
      const component = path.replace('frontend/src/components/', '').replace('.vue', '')
      affectedComponents.push(component)
    }
    
    // 前端 API
    if (path.startsWith('frontend/src/api/')) {
      affectedAPI.push(path)
    }
    
    // E2E 测试
    if (path.startsWith('e2e/tests/')) {
      affectedRoutes.push(path)
    }

    // 路由
    if (path === 'frontend/src/router/index.ts') {
      affectedRoutes.push('router')
    }
  }

  return { affectedPages, affectedComponents, affectedAPI, affectedRoutes }
}

/**
 * 检查 E2E 用例是否覆盖改动
 */
function checkE2ECoverage(affectedPages, affectedComponents, diff, e2eDir) {
  // 读取 e2e/tests/ 下已有的测试文件
  let e2eFiles = []
  try {
    e2eFiles = readdirSync('e2e/tests').filter(f => f.endsWith('.spec.ts'))
  } catch {
    e2eFiles = []
  }

  const coverageReport = []

  for (const page of affectedPages) {
    const expectedFile = `${page.toLowerCase()}.spec.ts`
    const hasCoverage = e2eFiles.some(f => f.includes(page.toLowerCase()) || f.includes(page.replace(/([A-Z])/g, '-$1').toLowerCase()))
    
    coverageReport.push({
      page,
      expected: `e2e/tests/${expectedFile}`,
      covered: hasCoverage,
      status: hasCoverage ? '✅' : '⚠️',
    })
  }

  for (const component of affectedComponents) {
    const hasCoverage = e2eFiles.some(f => 
      f.toLowerCase().includes(component.toLowerCase())
    )
    coverageReport.push({
      page: `组件: ${component}`,
      expected: `e2e/tests/ 中的相关用例`,
      covered: hasCoverage,
      status: hasCoverage ? '✅' : '⚠️',
    })
  }

  return coverageReport
}

/**
 * 生成审查报告
 */
async function generateReviewReport(prNumber, diff, files) {
  const { affectedPages, affectedComponents, affectedAPI, affectedRoutes } = analyzeDiff(diff, files)
  const coverageReport = checkE2ECoverage(affectedPages, affectedComponents, diff, 'e2e/tests')

  let report = `## 🤖 AI Review Report\n\n`
  report += `**PR #${prNumber}** | Files changed: ${files.length}\n\n`

  // 变更概览
  report += `### 📋 变更概览\n\n`
  
  if (affectedPages.length > 0) {
    report += `**受影响页面**: ${affectedPages.join(', ')}\n`
  }
  if (affectedComponents.length > 0) {
    report += `**受影响组件**: ${affectedComponents.join(', ')}\n`
  }
  if (affectedAPI.length > 0) {
    report += `**受影响 API**: ${affectedAPI.join(', ')}\n`
  }
  if (affectedRoutes.length > 0) {
    report += `**受影响路由/E2E**: ${affectedRoutes.join(', ')}\n`
  }
  report += '\n'

  // E2E 覆盖检查
  const uncovered = coverageReport.filter(r => !r.covered)
  const covered = coverageReport.filter(r => r.covered)
  
  if (coverageReport.length > 0) {
    report += `### 🧪 E2E 用例覆盖\n\n`
    for (const item of coverageReport) {
      report += `- ${item.status} **${item.page}**${item.covered ? '' : ` → 期望: \`${item.expected}\``}\n`
    }
    report += '\n'
    
    if (uncovered.length > 0) {
      report += `> ⚠️ 有 ${uncovered.length} 个受影响页面/组件缺少 E2E 用例覆盖。建议补充。\n\n`
    }
  }

  // 代码质量检查
  report += `### 🔍 代码质量检查\n\n`
  
  const issues = []
  
  // 检查是否有 console.log
  const consoleLogs = diff.match(/console\.(log|debug|info)\(/g)
  if (consoleLogs && consoleLogs.length > 0) {
    issues.push(`⚠️ 发现 ${consoleLogs.length} 处 console.log/debug/info，提交前请移除`)
  }
  
  // 检查是否有 any 类型
  const anyTypes = diff.match(/:\s*any\b/g)
  if (anyTypes && anyTypes.length > 0) {
    issues.push(`⚠️ 发现 ${anyTypes.length} 处 \`any\` 类型，请使用具体类型替代`)
  }
  
  // 检查是否有 TODO 但没有 FIXME/FIX
  const todos = diff.match(/\/\/\s*TODO(?!\s*:)/g)
  if (todos && todos.length > 0) {
    issues.push(`💡 发现 ${todos.length} 处 TODO，如果是待办请保留，如果是遗漏请处理`)
  }

  if (issues.length === 0) {
    report += `✅ 未发现明显代码质量问题\n\n`
  } else {
    for (const issue of issues) {
      report += `${issue}\n`
    }
    report += '\n'
  }

  // 新增 E2E 用例审查
  const newE2EFiles = files.filter(f => f.filename.startsWith('e2e/tests/'))
  if (newE2EFiles.length > 0) {
    report += `### 🆕 新增 E2E 用例审查\n\n`
    for (const file of newE2EFiles) {
      report += `- 📝 \`${file.filename}\` (+${file.additions} / -${file.deletions})\n`
    }
    
    // 检查新用例是否覆盖了受影响的页面
    const newTestPages = newE2EFiles.map(f => f.filename.replace('e2e/tests/', ''))
    for (const page of affectedPages) {
      const isCovered = newTestPages.some(f => f.toLowerCase().includes(page.toLowerCase()) || f.includes(page.replace(/([A-Z])/g, '-$1').toLowerCase()))
      if (isCovered) {
        report += `  - ✅ 页面 \`${page}\` 已有对应新用例\n`
      }
    }
    report += '\n'
  }

  // 总结
  const riskLevel = uncovered.length > 2 ? '🔴 高' : uncovered.length > 0 ? '🟡 中' : '🟢 低'
  report += `### 📊 总结\n\n`
  report += `- 回归风险: ${riskLevel}\n`
  report += `- 受影响页面: ${affectedPages.length || 0}\n`
  report += `- E2E 覆盖: ${covered.length}/${coverageReport.length || '-'}\n`
  report += `- 代码问题: ${issues.length || 0}\n\n`
  report += `---\n`
  report += `_🤖 Generated by AI Review Bot_`

  return report
}

// ===== Webhook 处理 =====

function verifySignature(payload, signature) {
  if (!CONFIG.webhookSecret) return true
  const hmac = crypto.createHmac('sha256', CONFIG.webhookSecret)
  hmac.update(payload)
  const expected = `sha256=${hmac.digest('hex')}`
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

async function handleWebhook(event, payload) {
  if (event !== 'pull_request') return
  if (payload.action !== 'opened' && payload.action !== 'synchronize' && payload.action !== 'reopened') return

  const prNumber = payload.pull_request.number
  console.log(`[AI Review] Processing PR #${prNumber} (${payload.action})`)

  try {
    // 获取 diff 和文件列表
    const [diff, files] = await Promise.all([
      getPRDiff(prNumber),
      getPRFiles(prNumber),
    ])

    // 生成审查报告
    const report = await generateReviewReport(prNumber, diff, files)
    
    // 发布到 PR comment
    await createPRComment(prNumber, report)
    console.log(`[AI Review] Comment posted to PR #${prNumber}`)
  } catch (error) {
    console.error(`[AI Review] Error processing PR #${prNumber}:`, error)
    // 尝试发布错误通知
    try {
      await createPRComment(prNumber, `## ⚠️ AI Review Bot 错误\n\n处理 PR 时出错：\n\`\`\`\n${error.message}\n\`\`\``)
    } catch {
      // 忽略
    }
  }
}

// ===== HTTP 服务 =====

async function startServer() {
  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const payload = Buffer.concat(chunks).toString()

      // 验证签名
      const signature = req.headers['x-hub-signature-256']
      if (signature && !verifySignature(payload, signature)) {
        res.writeHead(401)
        res.end('Invalid signature')
        return
      }

      const event = req.headers['x-github-event']
      const data = JSON.parse(payload)
      
      // 异步处理，立即返回 200
      handleWebhook(event, data).catch(console.error)
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', service: 'ai-review-bot' }))
      return
    }

    res.writeHead(404)
    res.end('Not found')
  })

  server.listen(CONFIG.port, () => {
    console.log(`[AI Review Bot] Listening on port ${CONFIG.port}`)
    console.log(`[AI Review Bot] Webhook URL: http://175.178.94.65:${CONFIG.port}/webhook`)
  })
}

// 单次处理模式（测试用）
if (process.argv.includes('--once')) {
  const prNumber = process.argv.find((a, i) => a === '--pr' && process.argv[i + 1])
    ? process.argv[process.argv.indexOf('--pr') + 1]
    : null
  
  if (!prNumber) {
    console.error('Usage: node scripts/ai-review.mjs --once --pr <number>')
    process.exit(1)
  }

  const [diff, files] = await Promise.all([
    getPRDiff(prNumber),
    getPRFiles(prNumber),
  ])
  const report = await generateReviewReport(prNumber, diff, files)
  console.log(report)
  
  // 取消注释以实际发布到 PR
  // await createPRComment(prNumber, report)
  process.exit(0)
} else {
  startServer()
}
