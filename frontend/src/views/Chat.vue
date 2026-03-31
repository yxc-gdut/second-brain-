<template>
  <div class="chat">
    <header class="header">
      <h1 class="title">AI 问答</h1>
    </header>

    <main class="messages" ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message"
        :class="msg.role"
      >
        <div class="bubble">
          <p v-if="msg.role === 'user'">{{ msg.content }}</p>
          <div v-else class="ai-content">
            <p class="ai-text">{{ msg.content }}</p>
            <div v-if="msg.references?.length" class="references">
              <button class="toggle-btn" @click="toggleRefs(index)">
                {{ showRefs[index] ? '隐藏来源' : '查看来源' }}
              </button>
              <ul v-if="showRefs[index]" class="refs-list">
                <li v-for="ref in msg.references" :key="ref.noteId" class="ref-item">
                  <span class="ref-category">{{ ref.category === 'work' ? '💼' : '🏠' }}</span>
                  <span class="ref-preview">{{ ref.content?.substring(0, 50) }}...</span>
                  <span class="ref-source">({{ formatDate(ref.createdAt) }})</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loading" class="message assistant">
        <div class="bubble">
          <div class="typing">思考中<span class="dots">...</span></div>
        </div>
      </div>
    </main>

    <footer class="footer">
      <div class="quick-questions">
        <button
          v-for="q in quickQuestions"
          :key="q"
          class="quick-btn"
          @click="askQuick(q)"
          :disabled="loading"
        >
          {{ q }}
        </button>
      </div>
      <div class="input-area">
        <input
          v-model="input"
          type="text"
          class="input"
          placeholder="输入问题..."
          @keyup.enter="send"
          :disabled="loading"
        />
        <button class="send-btn" @click="send" :disabled="loading || !input.trim()">
          <PaperAirplaneIcon class="w-5 h-5" />
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { PaperAirplaneIcon } from '@heroicons/vue/24/solid'
import { chat, getQuickQuestions, type ChatMessage } from '@/api/notes'

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: '你好！我是你的第二大脑助手。你可以问我关于你笔记的任何问题，比如"我的知识结构是什么样的？"或"最近学了什么？"',
    references: []
  }
])

const input = ref('')
const loading = ref(false)
const quickQuestions = ref<string[]>(['我的知识结构？', '最近学了什么？', '工作相关笔记'])
const showRefs = ref<Record<number, boolean>>({})
const messagesContainer = ref<HTMLElement | null>(null)

onMounted(async () => {
  try {
    const questions = await getQuickQuestions()
    quickQuestions.value = questions
  } catch (err) {
    console.error('获取快捷问题失败:', err)
  }
})

function toggleRefs(index: number) {
  showRefs.value[index] = !showRefs.value[index]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

async function askQuick(q: string) {
  input.value = q
  await send()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text
  })
  
  input.value = ''
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
</script>

<style scoped>
.chat {
  min-height: 100vh;
  background: #F3F4F6;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.message {
  margin-bottom: 16px;
}

.message.user {
  display: flex;
  justify-content: flex-end;
}

.bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 12px;
}

.message.user .bubble {
  background: #3B82F6;
  color: white;
}

.message.assistant .bubble {
  background: white;
  color: #111827;
}

.ai-content p {
  white-space: pre-line;
  line-height: 1.6;
}

.ai-text {
  margin: 0;
}

.references {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E7EB;
}

.toggle-btn {
  font-size: 13px;
  color: #3B82F6;
  background: none;
  border: none;
  cursor: pointer;
}

.refs-list {
  margin-top: 8px;
  font-size: 13px;
  color: #6B7280;
  list-style: none;
  padding: 0;
}

.ref-item {
  margin-bottom: 8px;
  padding: 8px;
  background: #F3F4F6;
  border-radius: 6px;
}

.ref-category {
  margin-right: 4px;
}

.ref-preview {
  color: #111827;
}

.ref-source {
  color: #9CA3AF;
  font-size: 12px;
}

.typing {
  color: #6B7280;
  font-size: 14px;
}

.dots {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.footer {
  padding: 16px;
  background: white;
  border-top: 1px solid #E5E7EB;
}

.quick-questions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
}

.quick-btn {
  padding: 8px 12px;
  background: #F3F4F6;
  border-radius: 16px;
  font-size: 13px;
  color: #6B7280;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: #E5E7EB;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-area {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input {
  flex: 1;
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
}

.input:disabled {
  background: #F3F4F6;
}

.send-btn {
  padding: 12px;
  border-radius: 8px;
  background: #3B82F6;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #2563EB;
}

.send-btn:disabled {
  background: #93C5FD;
  cursor: not-allowed;
}
</style>
