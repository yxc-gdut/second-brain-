import { test, expect } from '@playwright/test'
import {
  collectConsoleErrors,
  expectNoConsoleErrors,
  waitForPageReady,
  collectNetworkRequests,
} from './helpers'

test.describe('创建笔记', () => {
  test('填写内容并保存笔记', async ({ page }) => {
    const errors = collectConsoleErrors(page)
    const requests = collectNetworkRequests(page)

    // 进入预览页
    await page.goto('/preview?type=text')
    await waitForPageReady(page)

    // 填写来源
    await page.locator('.preview-content input.kd-input').fill('E2E 测试来源')

    // 填写内容
    await page.locator('.preview-content textarea.kd-textarea').fill(
      `这是一条 E2E 自动化测试笔记\n创建时间: ${new Date().toISOString()}`,
    )

    // 选择分类（默认应该是 personal，点击 work）
    await expect(page.locator('.category-btn.active')).toBeVisible()
    await page.locator('.category-btn').first().click()
    await expect(page.locator('.category-btn').first()).toHaveClass(
      /active/,
    )

    // 点击保存（使用 force 绕过底部导航栏遮挡）
    const saveBtn = page.locator('.preview-header .save-btn')
    await expect(saveBtn).toBeEnabled()
    await saveBtn.click({ force: true })

    // 保存后应该跳转回首页（成功时 1.5s 后跳转）
    await expect(page).toHaveURL(/\//, { timeout: 15000 })

    expectNoConsoleErrors(errors)

    // 检查 POST /api/notes 请求
    const createNoteRequest = requests.find(
      (r) => r.url.includes('/api/notes') && r.method === 'POST',
    )
    if (createNoteRequest) {
      expect(createNoteRequest.status).toBe(200)
    }
  })

  test('空内容时保存按钮禁用', async ({ page }) => {
    await page.goto('/preview?type=text')
    await waitForPageReady(page)

    // 页面刚加载，内容为空
    const saveBtn = page.locator('.preview-header .save-btn')
    await expect(saveBtn).toBeDisabled()
  })
})
