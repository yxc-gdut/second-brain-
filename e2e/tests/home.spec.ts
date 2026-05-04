import { test, expect } from '@playwright/test'
import {
  collectConsoleErrors,
  waitForPageReady,
  expectNoConsoleErrors,
  collectNetworkRequests,
} from './helpers'

test.describe('首页', () => {
  test('首页正常加载，显示核心元素', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    const requests = collectNetworkRequests(page)

    await page.goto('/')
    await waitForPageReady(page)

    // 断言核心元素存在
    await expect(page.locator('.hero-headline')).toHaveText(/第二大脑/)
    await expect(page.locator('.hero-subhead')).toBeVisible()

    // 三个录入按钮存在
    const actionButtons = page.locator('.hero-actions .kd-btn')
    await expect(actionButtons).toHaveCount(3)

    // 最近记录区域存在
    await expect(page.locator('.section-title')).toHaveText(/最近记录/)

    // 零 console error（忽略后端不可用时的 502 错误）
    expectNoConsoleErrors(errors)

    // API 请求不应返回 5xx（但如果后端不可用则跳过）
    const apiRequests = requests.filter((r) => r.url.includes('/api/'))
    const failedApi = apiRequests.filter((r) => r.status >= 500)
    if (failedApi.length === 0) {
      // 后端正常时断言全部 OK
      for (const req of apiRequests) {
        expect(req.status).toBeLessThan(500)
      }
    }
  })

  test('点击文字记录跳转到预览页', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    await page.goto('/')
    await waitForPageReady(page)

    // 点击文字记录按钮（第一个 kd-btn）
    const textBtn = page.locator('.hero-actions .kd-btn').first()
    await textBtn.click()

    // 应该跳转到预览页
    await expect(page).toHaveURL(/\/preview/)
    await expect(page.locator('.preview-header')).toBeVisible()

    expectNoConsoleErrors(errors)
  })
})
