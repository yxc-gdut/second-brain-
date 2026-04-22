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
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 class="welcome-title">你好，我是你的第二大脑</h2>
          <p class="welcome-desc">可以问我关于笔记的任何问题</p>
          
          <!-- Quick Questions -->
          <div class="quick-questions">
            <button
              v-for="q in quickQuestions"
              :key="q"
              class="quick-btn"
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
            <div v-if="msg.role === 'assistant'" class="avatar ai-avatar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div v-else class="avatar user-avatar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <div class="message-bubble-wrapper">
            <div class="message-bubble">
              <p class="message-text">{{ msg.content }}</p>
            </div>
            
            <!-- References -->
            <div v-if="msg.role === 'assistant' && msg.references?.length" class="references">
              <button class="refs-toggle" @click="toggleRefs(index)">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
            <div class="avatar ai-avatar">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div class="message-bubble-wrapper">
            <div class="message-bubble typing">
              <div class="typing-dots">
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
          class="text-input"
          placeholder="问我任何关于笔记的问题..."
          :disabled="loading"
          @keyup.enter="sendMessage"
        />
        <button
          class="send-btn"
          :disabled="loading || !inputText.trim()"
          @click="sendMessage"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
.chat-page {
  min-height: 100vh;
  background: var(--color-black);
  display: flex;
  flex-direction: column;
  padding-top: 48px;
}

.chat-header {
  padding: 16px 22px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  z-index: 100;
}

.chat-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-white);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 80px 22px 120px;
}

.messages-inner {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Welcome State */
.welcome-state {
  text-align: center;
  padding: 60px 20px;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: rgba(0, 113, 227, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-apple-blue);
}

.welcome-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-white);
  margin-bottom: 8px;
}

.welcome-desc {
  font-family: var(--font-text);
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 32px;
}

.quick-questions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
  margin: 0 auto;
}

.quick-btn {
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-large);
  color: var(--color-white);
  font-family: var(--font-text);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Messages */
.message {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-avatar {
  background: var(--color-apple-blue);
  color: white;
}

.user-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

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
  padding: 14px 18px;
  border-radius: 20px;
  max-width: 100%;
}

.message.user .message-bubble {
  background: var(--color-apple-blue);
  color: white;
  border-bottom-right-radius: 6px;
}

.message.assistant .message-bubble {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  border-bottom-left-radius: 6px;
}

.message-text {
  font-family: var(--font-text);
  font-size: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* Typing Indicator */
.typing-dots {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* References */
.references {
  margin-top: 8px;
}

.refs-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: var(--color-apple-blue);
  font-family: var(--font-text);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.refs-toggle:hover {
  text-decoration: underline;
}

.refs-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ref-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-standard);
  font-size: 13px;
}

.ref-category {
  font-size: 16px;
  flex-shrink: 0;
}

.ref-content {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

/* Input Area */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 22px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.input-wrapper {
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: center;
}

.text-input {
  flex: 1;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-pill);
  color: var(--color-white);
  font-family: var(--font-text);
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
}

.text-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.text-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.text-input:disabled {
  opacity: 0.5;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-apple-blue);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #0077ed;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .message-bubble-wrapper {
    max-width: 85%;
  }
  
  .welcome-state {
    padding: 40px 16px;
  }
  
  .quick-questions {
    padding: 0 10px;
  }
}
</style>
