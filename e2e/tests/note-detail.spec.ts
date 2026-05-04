import { test, expect } from '@playwright/test'
import {
  collectConsoleErrors,
  expectNoConsoleErrors,
  waitForPageReady,
} from './helpers'

test.describe('笔记详情', () => {
  test('从首页进入笔记详情页', async ({ page }) => {
    const errors = collectConsoleErrors(page)

    await page.goto('/')
    await waitForPageReady(page)

    // 等待加载完成（骨架屏消失或笔记出现）
    const firstNote = page.locator('.note-card, .empty-state')
    await expect(firstNote.first()).toBeVisible({ timeout: 15000 })

    // 如果有笔记卡片，点击第一个进入详情
    const noteCards = page.locator('.note-card')
    if ((await noteCards.count()) > 0) {
      await noteCards.first().click()

      // 应该跳转到详情页
      await expect(page).toHaveURL(/\/note\//)
      await expect(page.locator('.detail-header')).toBeVisible()
      await expect(page.locator('.header-title')).toHaveText(/笔记详情/)

      // 详情页应该有内容
      await expect(page.locator('.note-body')).toBeVisible()
    }

    expectNoConsoleErrors(errors)
  })

  test('详情页返回按钮正常工作', async ({ page }) => {
    await page.goto('/')
    await waitForPageReady(page)

    const noteCards = page.locator('.note-card')
    if ((await noteCards.count()) > 0) {
      await noteCards.first().click()
      await expect(page).toHaveURL(/\/note\//)

      // 点击返回按钮
      await page.locator('.kd-btn--back').click()
      await expect(page).toHaveURL(/\//)
    }
  })
})
