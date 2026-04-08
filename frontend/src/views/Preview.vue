<template>
  <div class="preview-page">
    <!-- Header -->
    <header class="preview-header">
      <button class="back-btn" @click="goBack">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="header-title">{{ headerTitle }}</h1>
      <button class="save-btn" :disabled="!canSave" @click="saveNote">
        保存
      </button>
    </header>

    <!-- Preview Content -->
    <main class="preview-content">
      <!-- Source Input -->
      <div class="input-section">
        <label class="input-label">来源</label>
        <input
          v-model="source"
          type="text"
          class="text-input"
          placeholder="书籍、公众号、小红书等..."
        />
      </div>

      <!-- Content Input -->
      <div class="input-section">
        <label class="input-label">内容</label>
        <textarea
          v-model="content"
          class="textarea-input"
          placeholder="记录你的想法..."
          rows="6"
        ></textarea>
      </div>

      <!-- Category Selector -->
      <div class="input-section">
        <label class="input-label">分类</label>
        <div class="category-options">
          <button
            class="category-btn"
            :class="{ active: category === 'work' }"
            @click="category = 'work'"
          >
            <span class="category-icon">💼</span>
            <span class="category-text">工作</span>
          </button>
          <button
            class="category-btn"
            :class="{ active: category === 'personal' }"
            @click="category = 'personal'"
          >
            <span class="category-icon">🏠</span>
            <span class="category-text">私人</span>
          </button>
        </div>
      </div>

      <!-- Tags (if any AI suggestions) -->
      <div v-if="suggestedTags.length > 0" class="input-section">
        <label class="input-label">推荐标签</label>
        <div class="tags-list">
          <button
            v-for="tag in suggestedTags"
            :key="tag"
            class="tag-btn"
            :class="{ selected: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </main>

    <!-- Bottom Action -->
    <footer class="preview-footer">
      <button class="action-btn" :disabled="!canSave" @click="saveNote">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        保存笔记
      </button>
    </footer>

    <!-- Save Success Toast -->
    <transition name="toast">
      <div v-if="showSuccess" class="toast success">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        笔记已保存
      </div>
    </transition>

    <!-- Error Toast -->
    <transition name="toast">
      <div v-if="showError" class="toast error">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ errorMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createNote, type Note } from '@/api/notes'

const router = useRouter()
const route = useRoute()

const content = ref('')
const source = ref('')
const category = ref<'work' | 'personal'>('personal')
const selectedTags = ref<string[]>([])
const suggestedTags = ref<string[]>([])
const saving = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const inputType = computed(() => route.query.type as string || 'text')

const headerTitle = computed(() => {
  switch (inputType.value) {
    case 'camera': return '拍照记录'
    case 'voice': return '语音记录'
    default: return '文字记录'
  }
})

const canSave = computed(() => {
  return content.value.trim().length > 0 && !saving.value
})

onMounted(() => {
  // For now, just initialize
})

function goBack() {
  router.back()
}

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

async function saveNote() {
  if (!canSave.value) return

  saving.value = true
  try {
    const note = {
      content: content.value,
      source: source.value || undefined,
      category: category.value,
      tags: selectedTags.value
    }
    
    await createNote(note)
    showSuccess.value = true
    
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '保存失败'
    showError.value = true
    setTimeout(() => {
      showError.value = false
    }, 3000)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.preview-page {
  min-height: 100vh;
  background: var(--color-black);
  padding-top: 48px;
  display: flex;
  flex-direction: column;
}

/* Header */
.preview-header {
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-apple-blue);
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-white);
}

.save-btn {
  padding: 8px 16px;
  background: var(--color-apple-blue);
  border: none;
  border-radius: var(--radius-pill);
  color: white;
  font-family: var(--font-text);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #0077ed;
}

.save-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

/* Content */
.preview-content {
  flex: 1;
  padding: 72px 22px 100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-label {
  font-family: var(--font-text);
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-input,
.textarea-input {
  width: 100%;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-standard);
  color: var(--color-white);
  font-family: var(--font-text);
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
}

.text-input::placeholder,
.textarea-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.text-input:focus,
.textarea-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.textarea-input {
  resize: none;
  min-height: 150px;
  line-height: 1.6;
}

/* Category */
.category-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-large);
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.category-btn.active {
  background: rgba(0, 113, 227, 0.15);
  border-color: var(--color-apple-blue);
}

.category-icon {
  font-size: 20px;
}

.category-text {
  font-family: var(--font-text);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-white);
}

/* Tags */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-pill);
  color: var(--color-white);
  font-family: var(--font-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.tag-btn.selected {
  background: var(--color-apple-blue);
  border-color: var(--color-apple-blue);
}

/* Footer */
.preview-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 22px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: var(--color-apple-blue);
  border: none;
  border-radius: var(--radius-pill);
  color: white;
  font-family: var(--font-text);
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #0077ed;
  transform: scale(1.01);
}

.action-btn:active:not(:disabled) {
  transform: scale(0.99);
}

.action-btn:disabled {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 24px;
  border-radius: var(--radius-pill);
  font-family: var(--font-text);
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.toast.success {
  background: var(--color-near-black);
  color: var(--color-white);
}

.toast.success svg {
  color: #30c864;
}

.toast.error {
  background: #1a1a1a;
  color: white;
}

.toast.error svg {
  color: #ff3b30;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
