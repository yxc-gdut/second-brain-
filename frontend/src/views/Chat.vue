<template>
  <div class="chat-page">
    <header class="chat-header">
      <h1 class="chat-title">AI 问答</h1>
    </header>

    <!-- Messages Area -->
    <main ref="messagesContainer" class="messages-container">
      <div class="messages-inner">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="welcome-state">
          <div class="welcome-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 class="welcome-title">你好，我是你的第二大脑</h2>
          <p class="welcome-desc">可以问我关于笔记的任何问题</p>

          <!-- Quick Questions -->
          <div class="quick-questions">
            <button
              v-for="q in quickQuestions"
              :key="q"
              class="kd-tag"
              @click="askQuick(q)"
            >
              {{ q }}
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message"
          :class="msg.role"
        >
          <div class="message-avatar">
            <div v-if="msg.role === 'assistant'" class="avatar ai-avatar">AI</div>
            <div v-else class="avatar user-avatar">我</div>
          </div>

          <div class="message-bubble-wrapper">
            <div class="message-bubble">
              <p class="message-text">{{ msg.content }}</p>
            </div>

            <!-- References -->
            <div v-if="msg.role === 'assistant' && msg.references?.length" class="references">
              <button class="refs-toggle" @click="toggleRefs(index)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                查看来源 ({{ msg.references.length }})
              </button>
              <div v-if="showRefs[index]" class="refs-list">
                <div
                  v-for="ref in msg.references"
                  :key="ref.noteId"
                  class="ref-item"
                >
                  <span class="ref-category">{{ ref.category === 'work' ? '💼' : '🏠' }}</span>
                  <span class="ref-content">{{ ref.content?.substring(0, 60) }}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="loading" class="message assistant">
          <div class="message-avatar">
            <div class="avatar ai-avatar">AI</div>
          </div>
          <div class="message-bubble-wrapper">
            <div class="message-bubble typing">
              <div class="kd-loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Input Area -->
    <footer class="input-area">
      <div class="input-wrapper">
        <input
          v-model="inputText"
          type="text"
          class="kd-input"
          placeholder="问我任何关于笔记的问题..."
          :disabled="loading"
          @keyup.enter="sendMessage"
        />
        <button
          class="kd-btn kd-btn-primary"
          :disabled="loading || !inputText.trim()"
          @click="sendMessage"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { chat, getQuickQuestions, type ChatMessage } from '@/api/notes'

const messages = ref<ChatMessage[]>([])
const inputText = ref('')
const loading = ref(false)
const showRefs = ref<Record<number, boolean>>({})
const messagesContainer = ref<HTMLElement | null>(null)

const quickQuestions = ref<string[]>([
  '我的知识结构是什么样的？',
  '最近学了什么新东西？',
  '有哪些工作相关的笔记？'
])

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  messages.value.push({
    role: 'user',
    content: text
  })

  inputText.value = ''
  loading.value = true
  await scrollToBottom()

  try {
    const response = await chat(text, messages.value)
    messages.value.push(response)
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，发生了错误：' + (err instanceof Error ? err.message : '未知错误'),
      references: []
    })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

async function askQuick(q: string) {
  inputText.value = q
  await sendMessage()
}

function toggleRefs(index: number) {
  showRefs.value[index] = !showRefs.value[index]
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
/* === KDesign Tokens === */
.chat-page {
  min-height: 100vh;
  background: var(--kd-color-background-base);
  display: flex;
  flex-direction: column;
  padding-top: 48px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

/* === Header === */
.chat-header {
  padding: 12px 24px;
  text-align: center;
  border-bottom: 1px solid var(--kd-color-line-light);
  background: var(--kd-color-fill-base);
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  z-index: 100;
}

.chat-title {
  font-size: var(--kd-font-size-large);
  font-weight: var(--kd-font-weight-bold);
  color: var(--kd-color-text-primary);
  line-height: 30px;
  margin: 0;
}

/* === Messages Container === */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 80px 24px 120px;
}

.messages-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* === Welcome State === */
.welcome-state {
  text-align: center;
  padding: 64px 20px;
}

.welcome-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  background: var(--kd-color-public-light);
  border-radius: var(--kd-radius-round, 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--kd-color-public-normal);
}

.welcome-title {
  font-size: var(--kd-font-size-xxl);
  font-weight: var(--kd-font-weight-bold);
  color: var(--kd-color-text-primary);
  line-height: 36px;
  margin: 0 0 8px;
}

.welcome-desc {
  font-size: var(--kd-font-size-base);
  color: var(--kd-color-text-secondary);
  line-height: 22px;
  margin: 0 0 32px;
}

/* === Quick Questions — KDesign Tag Style === */
.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 320px;
  margin: 0 auto;
}

.kd-tag {
  padding: 8px 16px;
  background: var(--kd-color-fill-base);
  border: 1px solid var(--kd-color-line-regular);
  border-radius: var(--kd-radius-full);
  color: var(--kd-color-text-primary);
  font-size: var(--kd-font-size-sub-base);
  line-height: 22px;
  cursor: pointer;
  transition: all var(--kd-time-fast, 120ms) var(--kd-easing-ease, cubic-bezier(.25,.10,.25,1.00));
}

.kd-tag:hover {
  border-color: var(--kd-color-line-medium);
  background: var(--kd-color-state-hover);
}

.kd-tag:active {
  background: var(--kd-color-state-pressed);
}

/* === Messages === */
.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

/* === Avatars — Letter Style === */
.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--kd-radius-round, 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--kd-font-size-small);
  font-weight: var(--kd-font-weight-bold);
}

.ai-avatar {
  background: var(--kd-color-public-normal);
  color: var(--kd-color-text-white);
}

.user-avatar {
  background: var(--kd-color-fill-regular);
  color: var(--kd-color-text-primary);
}

/* === Message Bubbles === */
.message-bubble-wrapper {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message.user .message-bubble-wrapper {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: var(--kd-radius-lg);
  max-width: 100%;
}

.message.user .message-bubble {
  background: var(--kd-color-public-light);
  color: var(--kd-color-text-primary);
  border-top-right-radius: var(--kd-radius-xs);
}

.message.assistant .message-bubble {
  background: var(--kd-color-fill-base);
  color: var(--kd-color-text-primary);
  border-top-left-radius: var(--kd-radius-xs);
  border: 1px solid var(--kd-color-line-light);
}

.message-text {
  font-size: var(--kd-font-size-base);
  line-height: 1.625;
  white-space: pre-wrap;
  margin: 0;
}

/* === Typing Indicator — KDesign Loading Style === */
.typing-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.kd-loading-dots {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.kd-loading-dots span {
  width: 6px;
  height: 6px;
  background: var(--kd-color-text-tertiary);
  border-radius: var(--kd-radius-full);
  animation: kd-dot-bounce 1.4s infinite ease-in-out both;
}

.kd-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.kd-loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes kd-dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* === References === */
.references {
  margin-top: 4px;
}

.refs-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--kd-color-text-public);
  font-size: var(--kd-font-size-small);
  cursor: pointer;
  padding: 0;
  transition: opacity var(--kd-time-fast, 120ms);
}

.refs-toggle:hover {
  opacity: 0.8;
}

.refs-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ref-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: var(--kd-color-fill-light);
  border-radius: var(--kd-radius-md);
  font-size: var(--kd-font-size-small);
}

.ref-category {
  font-size: var(--kd-font-size-sub-base);
  flex-shrink: 0;
}

.ref-content {
  color: var(--kd-color-text-secondary);
  line-height: 20px;
}

/* === Input Area === */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 24px;
  background: var(--kd-color-fill-base);
  border-top: 1px solid var(--kd-color-line-light);
}

.input-wrapper {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* === KDesign Input Style === */
.kd-input {
  flex: 1;
  height: 36px;
  padding: 0 12px;
  background: var(--kd-color-fill-base);
  border: 1px solid var(--kd-color-line-regular);
  border-radius: var(--kd-radius-md);
  color: var(--kd-color-text-primary);
  font-size: var(--kd-font-size-sub-base);
  line-height: 22px;
  outline: none;
  transition: border-color var(--kd-time-fast, 120ms);
  box-sizing: border-box;
}

.kd-input::placeholder {
  color: var(--kd-color-text-tertiary);
}

.kd-input:hover {
  border-color: var(--kd-color-line-medium);
}

.kd-input:focus {
  border-color: var(--kd-color-line-public);
  box-shadow: var(--kd-shadow-glow-blue);
}

.kd-input:disabled {
  opacity: var(--kd-opacity-disabled);
  cursor: not-allowed;
}

/* === KDesign Button Primary Style === */
.kd-btn {
  height: 36px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: var(--kd-radius-md);
  font-size: var(--kd-font-size-sub-base);
  line-height: 22px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all var(--kd-time-fast, 120ms) var(--kd-easing-ease, cubic-bezier(.25,.10,.25,1.00));
  flex-shrink: 0;
  box-sizing: border-box;
}

.kd-btn-primary {
  background: var(--kd-color-public-normal);
  color: var(--kd-color-text-white);
}

.kd-btn-primary:hover:not(:disabled) {
  background: var(--kd-color-public-hover);
}

.kd-btn-primary:active:not(:disabled) {
  background: var(--kd-color-public-pressed);
}

.kd-btn-primary:disabled {
  opacity: var(--kd-opacity-disabled);
  cursor: not-allowed;
  background: var(--kd-color-fill-regular);
}

/* === Responsive === */
@media (max-width: 640px) {
  .message-bubble-wrapper {
    max-width: 85%;
  }

  .welcome-state {
    padding: 40px 16px;
  }

  .quick-questions {
    padding: 0 8px;
  }
}
</style>
