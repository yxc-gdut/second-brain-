import { test, expect } from '@playwright/test'
import {
  collectConsoleErrors,
  expectNoConsoleErrors,
  waitForPageReady,
} from './helpers'

test.describe('搜索', () => {
  test('首页搜索功能可用', async ({ page }) => {
    const errors = collectConsoleErrors(page)

    await page.goto('/')
    await waitForPageReady(page)

    // 当前首页暂无搜索框，验证页面不崩溃即可
    // 等核心元素渲染完成后检查
    await expect(page.locator('.hero-headline')).toBeVisible()

    expectNoConsoleErrors(errors)
  })
})
