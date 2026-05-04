import { Page, expect } from '@playwright/test'

/**
 * 收集页面 console 错误
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  page.on('pageerror', (err) => {
    errors.push(err.message)
  })
  return errors
}

/**
 * 断言零 console error（过滤掉可接受的警告）
 */
export function expectNoConsoleErrors(errors: string[]) {
  const filtered = errors.filter(
    (e) =>
      !e.includes('DevTools') &&
      !e.includes('favicon') &&
      !e.includes('net::ERR_CONNECTION') &&
      !e.includes('502') &&
      !e.includes('Unexpected token') &&
      !e.includes('SyntaxError') &&
      !e.includes('加载笔记失败') &&
      !e.includes('加载统计失败'),
  )
  expect(filtered).toHaveLength(0)
}

/**
 * 等待页面加载完成（无 loading 状态）
 */
export async function waitForPageReady(page: Page) {
  await page.waitForLoadState('networkidle')
  // 等待骨架屏消失
  const skeleton = page.locator(
    '.skeleton-card, .loading-grid, .loading-state',
  )
  if (await skeleton.count() > 0) {
    await skeleton.first().waitFor({ state: 'hidden', timeout: 10000 })
  }
}

/**
 * 收集网络请求日志
 */
export function collectNetworkRequests(page: Page) {
  const requests: { url: string; method: string; status: number }[] = []
  page.on('response', (response) => {
    requests.push({
      url: response.url(),
      method: response.request().method(),
      status: response.status(),
    })
  })
  return requests
}

/**
 * 生成测试报告数据（供 AI 解读）
 */
export interface TestCaseResult {
  name: string
  passed: boolean
  assertions: string[]
  errors: string[]
  networkFailures: string[]
  consoleErrors: string[]
  screenshots?: string[]
}

export function generateTestCaseResult(
  name: string,
  passed: boolean,
  assertions: string[],
  errors: string[],
  networkFailures: string[],
  consoleErrors: string[],
): TestCaseResult {
  return { name, passed, assertions, errors, networkFailures, consoleErrors }
}
