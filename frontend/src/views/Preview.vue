<template>
  <div class="preview-page">
    <!-- Header: 白底 56px，返回(Light) + 标题 + 保存(Primary) -->
    <header class="preview-header">
      <button class="back-btn" @click="goBack">
        <svg class="back-icon" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="header-title">{{ headerTitle }}</h1>
      <button class="save-btn" :disabled="!canSave" @click="saveNote">
        保存
      </button>
    </header>

    <!-- Content -->
    <main class="preview-content">
      <!-- 来源输入 -->
      <div class="form-section">
        <label class="form-label">来源</label>
        <input
          v-model="source"
          type="text"
          class="kd-input"
          placeholder="书籍、公众号、小红书等..."
        />
      </div>

      <!-- 内容编辑 -->
      <div class="form-section">
        <label class="form-label">内容</label>
        <textarea
          v-model="content"
          class="kd-textarea"
          placeholder="记录你的想法..."
          rows="5"
        ></textarea>
      </div>

      <!-- 分类选择 -->
      <div class="form-section">
        <label class="form-label">分类</label>
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

      <!-- 推荐标签 (KDesign Tag 风格) -->
      <div v-if="suggestedTags.length > 0" class="form-section">
        <label class="form-label">推荐标签</label>
        <div class="tags-list">
          <button
            v-for="tag in suggestedTags"
            :key="tag"
            class="kd-tag"
            :class="{ selected: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            <span>{{ tag }}</span>
            <svg
              v-if="selectedTags.includes(tag)"
              class="tag-close-icon"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M11 5L5 11M5 5L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- AI 分析结果区域 -->
      <div v-if="false" class="ai-result-card">
        <div class="ai-result-header">
          <span class="ai-result-label">AI 分析结果</span>
        </div>
        <div class="ai-result-body">
          <p class="ai-result-text">分析内容将在此展示...</p>
        </div>
      </div>
    </main>

    <!-- 底部保存栏 -->
    <footer class="preview-footer">
      <button class="action-btn" :disabled="!canSave" @click="saveNote">
        <svg class="action-icon" viewBox="0 0 16 16" fill="none">
          <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        保存笔记
      </button>
    </footer>

    <!-- 保存成功 Toast -->
    <transition name="toast">
      <div v-if="showSuccess" class="toast success">
        <svg class="toast-icon" viewBox="0 0 16 16" fill="none">
          <path d="M13 4L6 11L3 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        笔记已保存
      </div>
    </transition>

    <!-- 错误 Toast -->
    <transition name="toast">
      <div v-if="showError" class="toast error">
        <svg class="toast-icon" viewBox="0 0 16 16" fill="none">
          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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
  background: var(--kd-color-background-base);
  padding-top: 56px;
  display: flex;
  flex-direction: column;
}

/* ========== Header ========== */
.preview-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--kd-color-fill-base);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  border-bottom: 1px solid var(--kd-color-line-light);
}

.back-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--kd-color-line-regular);
  border-radius: var(--kd-radius-md);
  color: var(--kd-color-text-primary);
  cursor: pointer;
  transition: all var(--kd-time-fast) var(--kd-easing-ease);
}

.back-btn:hover {
  background: var(--kd-color-state-hover);
  border-color: var(--kd-color-line-medium);
}

.back-btn:active {
  background: var(--kd-color-state-pressed);
}

.back-icon {
  width: 16px;
  height: 16px;
}

.header-title {
  font-size: var(--kd-font-size-middle);
  font-weight: var(--kd-font-weight-bold);
  color: var(--kd-color-text-primary);
  line-height: 24px;
}

.save-btn {
  height: 32px;
  padding: 0 16px;
  background: var(--kd-color-public-normal);
  border: none;
  border-radius: var(--kd-radius-md);
  color: var(--kd-color-text-white);
  font-size: var(--kd-font-size-sub-base);
  font-weight: var(--kd-font-weight-regular);
  cursor: pointer;
  transition: all var(--kd-time-fast) var(--kd-easing-ease);
  min-width: 72px;
}

.save-btn:hover:not(:disabled) {
  background: var(--kd-color-public-hover);
}

.save-btn:active:not(:disabled) {
  background: var(--kd-color-public-pressed);
}

.save-btn:disabled {
  opacity: var(--kd-opacity-disabled);
  cursor: not-allowed;
}

/* ========== Content ========== */
.preview-content {
  flex: 1;
  padding: 24px 16px 100px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 400;
  color: var(--kd-color-text-secondary);
  line-height: 22px;
}

/* ========== Input / Textarea (KDesign 风格) ========== */
.kd-input,
.kd-textarea {
  width: 100%;
  padding: 4px 12px;
  height: 36px;
  background: var(--kd-color-fill-base);
  border: 1px solid var(--kd-color-line-regular);
  border-radius: var(--kd-radius-md);
  color: var(--kd-color-text-primary);
  font-size: var(--kd-font-size-sub-base);
  line-height: 28px;
  outline: none;
  transition: border-color var(--kd-time-fast) var(--kd-easing-ease),
              box-shadow var(--kd-time-fast) var(--kd-easing-ease);
  box-sizing: border-box;
}

.kd-input::placeholder,
.kd-textarea::placeholder {
  color: var(--kd-color-text-tertiary);
}

.kd-input:hover,
.kd-textarea:hover {
  border-color: var(--kd-color-line-medium);
}

.kd-input:focus,
.kd-textarea:focus {
  border-color: var(--kd-color-line-public);
  box-shadow: var(--kd-shadow-glow-blue);
}

.kd-textarea {
  height: auto;
  min-height: 120px;
  padding: 8px 12px;
  resize: vertical;
  line-height: 22px;
}

/* ========== Category (Segmented 风格) ========== */
.category-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  background: var(--kd-color-fill-base);
  border: 1px solid var(--kd-color-line-regular);
  border-radius: var(--kd-radius-md);
  cursor: pointer;
  transition: all var(--kd-time-fast) var(--kd-easing-ease);
}

.category-btn:hover {
  background: var(--kd-color-state-hover);
  border-color: var(--kd-color-line-medium);
}

.category-btn.active {
  background: var(--kd-color-public-light);
  border-color: var(--kd-color-public-normal);
}

.category-btn.active .category-text {
  color: var(--kd-color-public-normal);
}

.category-icon {
  font-size: 16px;
  line-height: 1;
}

.category-text {
  font-size: var(--kd-font-size-sub-base);
  font-weight: var(--kd-font-weight-regular);
  color: var(--kd-color-text-primary);
  line-height: 20px;
}

/* ========== Tags (KDesign Tag 风格) ========== */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.kd-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  background: var(--kd-color-fill-regular);
  border: none;
  border-radius: var(--kd-radius-sm);
  color: var(--kd-color-text-primary);
  font-size: var(--kd-font-size-small);
  font-weight: var(--kd-font-weight-regular);
  cursor: pointer;
  transition: all var(--kd-time-fast) var(--kd-easing-ease);
  line-height: 20px;
}

.kd-tag:hover {
  background: var(--kd-color-fill-heavy);
}

.kd-tag.selected {
  background: var(--kd-color-public-light);
  color: var(--kd-color-public-normal);
}

.kd-tag.selected:hover {
  background: #dce8ff;
}

.tag-close-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

/* ========== AI 分析结果卡片 ========== */
.ai-result-card {
  background: var(--kd-color-fill-base);
  border-radius: var(--kd-radius-lg);
  overflow: hidden;
}

.ai-result-header {
  padding: 12px 16px 0;
}

.ai-result-label {
  font-size: var(--kd-font-size-sub-base);
  font-weight: var(--kd-font-weight-bold);
  color: var(--kd-color-text-primary);
  line-height: 20px;
}

.ai-result-body {
  padding: 8px 16px 16px;
}

.ai-result-text {
  font-size: var(--kd-font-size-sub-base);
  color: var(--kd-color-text-primary);
  line-height: 1.6;
}

/* ========== Footer ========== */
.preview-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: var(--kd-color-fill-base);
  border-top: 1px solid var(--kd-color-line-light);
  display: flex;
  justify-content: center;
}

.action-btn {
  width: 100%;
  max-width: 640px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 36px;
  background: var(--kd-color-public-normal);
  border: none;
  border-radius: var(--kd-radius-md);
  color: var(--kd-color-text-white);
  font-size: var(--kd-font-size-sub-base);
  font-weight: var(--kd-font-weight-regular);
  cursor: pointer;
  transition: all var(--kd-time-fast) var(--kd-easing-ease);
}

.action-btn:hover:not(:disabled) {
  background: var(--kd-color-public-hover);
}

.action-btn:active:not(:disabled) {
  background: var(--kd-color-public-pressed);
}

.action-btn:disabled {
  opacity: var(--kd-opacity-disabled);
  cursor: not-allowed;
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* ========== Toast ========== */
.toast {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: var(--kd-radius-md);
  font-size: var(--kd-font-size-sub-base);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  box-shadow: var(--kd-shadow-lg);
  white-space: nowrap;
}

.toast.success {
  background: var(--kd-color-fill-base);
  color: var(--kd-color-success-normal);
}

.toast.success .toast-icon {
  color: var(--kd-color-success-normal);
}

.toast.error {
  background: var(--kd-color-fill-base);
  color: var(--kd-color-error-normal);
}

.toast.error .toast-icon {
  color: var(--kd-color-error-normal);
}

.toast-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--kd-time-normal) var(--kd-easing-ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
</style>
