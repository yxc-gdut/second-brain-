import { test, expect } from '@playwright/test'
import {
  collectConsoleErrors,
  expectNoConsoleErrors,
  waitForPageReady,
} from './helpers'

test.describe('AI 问答', () => {
  test('聊天页正常加载，显示欢迎状态', async ({ page }) => {
    const errors = collectConsoleErrors(page)

    await page.goto('/chat')
    await waitForPageReady(page)

    // 标题
    await expect(page.locator('.chat-title')).toHaveText(/AI 问答/)

    // 欢迎状态
    await expect(page.locator('.welcome-state')).toBeVisible()
    await expect(page.locator('.welcome-title')).toContainText(/第二大脑/)

    // 输入框存在（Chat 页用的是 input.kd-input，不是 textarea）
    await expect(page.locator('.input-wrapper .kd-input')).toBeVisible()

    expectNoConsoleErrors(errors)
  })

  test('发送消息并收到回复', async ({ page }) => {
    const errors = collectConsoleErrors(page)

    await page.goto('/chat')
    await waitForPageReady(page)

    // 输入消息
    const input = page.locator('.input-wrapper .kd-input')
    await input.fill('你好')

    // 点击发送按钮（kd-btn-primary 在 input-area 内）
    const sendBtn = page.locator('.input-area .kd-btn-primary')
    await expect(sendBtn).toBeEnabled()
    await sendBtn.click()

    // 等待 AI 回复（最多 30 秒，AI 问答可能较慢）
    await page.waitForSelector('.message.assistant', { timeout: 30000 })

    // 应该有用户消息和 AI 回复
    const messages = page.locator('.message')
    await expect(messages).toHaveCount(2)

    expectNoConsoleErrors(errors)
  })
})
