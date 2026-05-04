import { test, expect } from '@playwright/test'
import {
  collectConsoleErrors,
  expectNoConsoleErrors,
  waitForPageReady,
} from './helpers'

test.describe('设置', () => {
  test('设置页正常加载', async ({ page }) => {
    const errors = collectConsoleErrors(page)

    await page.goto('/settings')
    await waitForPageReady(page)

    await expect(page.locator('.settings-title')).toHaveText(/设置/)

    // 快捷操作区域存在
    await expect(page.locator('.quick-action-btn').first()).toBeVisible()

    expectNoConsoleErrors(errors)
  })
})
