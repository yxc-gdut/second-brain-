<template>
  <div class="note-detail-page">
    <!-- Header Navigation -->
    <header class="detail-header">
      <button class="kd-btn kd-btn--light kd-btn--back" @click="goBack">
        <svg class="kd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="kd-btn__label">返回</span>
      </button>
      <h1 class="header-title">笔记详情</h1>
      <button class="kd-btn kd-btn--light kd-btn--danger" @click="confirmDelete">
        <svg class="kd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span class="kd-btn__label">删除</span>
      </button>
    </header>

    <!-- Note Content -->
    <main v-if="note" class="detail-content">
      <div class="note-meta">
        <span
          class="kd-tag kd-tag--category"
          :class="{ 'kd-tag--work': note.category === 'work', 'kd-tag--personal': note.category === 'personal' }"
        >
          {{ note.category === 'work' ? '💼 工作' : '🏠 私人' }}
        </span>
        <span class="kd-tag kd-tag--date">{{ formatDate(note.createdAt) }}</span>
      </div>

      <p v-if="note.source" class="note-source">
        <span class="source-label">来源：</span>{{ note.source }}
      </p>

      <div class="note-body">
        <p class="note-text">{{ note.content }}</p>
      </div>

      <div v-if="note.tags?.length" class="note-tags">
        <span v-for="tag in note.tags" :key="tag" class="kd-tag kd-tag--default">{{ tag }}</span>
      </div>
    </main>

    <!-- Loading State -->
    <div v-else-if="loading" class="state-container">
      <div class="loading-spinner"></div>
      <p class="state-text">加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else class="state-container">
      <p class="state-text">笔记不存在</p>
    </div>

    <!-- Delete Confirmation Modal -->
    <transition name="kd-modal">
      <div v-if="showDeleteModal" class="kd-modal-mask" @click="cancelDelete">
        <div class="kd-modal-container" @click.stop>
          <div class="kd-modal-header">
            <h2 class="kd-modal-title">删除笔记</h2>
          </div>
          <div class="kd-modal-body">
            <p class="kd-modal-text">确定要删除这条笔记吗？此操作无法撤销。</p>
          </div>
          <div class="kd-modal-footer">
            <button class="kd-btn kd-btn--secondary kd-modal-cancel" @click="cancelDelete">
              取消
            </button>
            <button class="kd-btn kd-btn--primary kd-btn--danger kd-modal-ok" @click="handleDelete">
              删除
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNoteById, deleteNote as deleteNoteById, type Note } from '@/api/notes'

const router = useRouter()
const route = useRoute()

const note = ref<Note | null>(null)
const loading = ref(true)
const showDeleteModal = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  try {
    note.value = await getNoteById(id)
  } catch (err) {
    console.error('加载笔记失败:', err)
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}

function confirmDelete() {
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
}

async function handleDelete() {
  if (!note.value) return

  try {
    await deleteNoteById(note.value.id)
    router.push('/')
  } catch (err) {
    console.error('删除失败:', err)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
/* ========================================
   KDesign Design Tokens
   ======================================== */
.note-detail-page {
  min-height: 100vh;
  background: var(--kd-color-background-base);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
    "Noto Color Emoji";
  padding-top: 56px;
}

/* ========================================
   Header — white bar, 56px, KDesign border
   ======================================== */
.detail-header {
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
  box-shadow: var(--kd-shadow-sm);
}

.header-title {
  font-size: var(--kd-font-size-middle);
  font-weight: var(--kd-font-weight-bold);
  color: var(--kd-color-text-primary);
  line-height: 24px;
  margin: 0;
}

/* ========================================
   KDesign Button (pure CSS, light variant)
   ======================================== */
.kd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  font-size: var(--kd-font-size-sub-base);
  font-weight: var(--kd-font-weight-regular);
  font-family: inherit;
  border: 1px solid var(--kd-color-line-regular);
  border-radius: var(--kd-radius-md);
  cursor: pointer;
  transition: all var(--kd-time-fast) var(--kd-easing-ease);
  outline: none;
  user-select: none;
  white-space: nowrap;
}

.kd-btn--light {
  background: var(--kd-color-fill-base);
  color: var(--kd-color-text-primary);
}

.kd-btn--light:hover {
  background: var(--kd-color-state-hover);
}

.kd-btn--light:active {
  background: var(--kd-color-state-pressed);
}

.kd-btn--secondary {
  background: var(--kd-color-fill-light);
  color: var(--kd-color-text-primary);
  border-color: var(--kd-color-line-regular);
}

.kd-btn--secondary:hover {
  background: var(--kd-color-state-hover);
  border-color: var(--kd-color-line-medium);
}

.kd-btn--primary {
  background: var(--kd-color-public-normal);
  color: var(--kd-color-text-white);
  border-color: transparent;
}

.kd-btn--primary:hover {
  background: var(--kd-color-public-hover);
}

.kd-btn--primary:active {
  background: var(--kd-color-public-pressed);
}

.kd-btn--danger {
  color: var(--kd-color-error-normal);
  border-color: var(--kd-color-error-normal);
  background: var(--kd-color-fill-base);
}

.kd-btn--danger:hover {
  background: var(--kd-color-error-light);
}

.kd-btn--danger.kd-btn--primary {
  background: var(--kd-color-error-normal);
  color: var(--kd-color-text-white);
  border-color: transparent;
}

.kd-btn--danger.kd-btn--primary:hover {
  background: var(--kd-color-error-hover);
}

.kd-btn--danger.kd-btn--primary:active {
  background: var(--kd-color-error-pressed);
}

.kd-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.kd-btn__label {
  line-height: 1;
}

/* ========================================
   KDesign Tag
   ======================================== */
.kd-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  font-size: var(--kd-font-size-small);
  font-weight: var(--kd-font-weight-regular);
  border-radius: var(--kd-radius-sm);
  line-height: 1;
  white-space: nowrap;
}

.kd-tag--default {
  background: var(--kd-color-fill-regular);
  color: var(--kd-color-text-secondary);
}

.kd-tag--category {
  background: var(--kd-color-fill-light);
  color: var(--kd-color-text-primary);
}

.kd-tag--work {
  background: var(--kd-color-public-light);
  color: var(--kd-color-public-normal);
}

.kd-tag--personal {
  background: var(--kd-color-success-light);
  color: var(--kd-color-success-normal);
}

.kd-tag--date {
  background: var(--kd-color-fill-regular);
  color: var(--kd-color-text-secondary);
}

/* ========================================
   Detail Content
   ======================================== */
.detail-content {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.note-source {
  font-size: var(--kd-font-size-base);
  color: var(--kd-color-text-public);
  margin-bottom: 16px;
  line-height: 22px;
}

.source-label {
  color: var(--kd-color-text-secondary);
}

.note-body {
  background: var(--kd-color-fill-base);
  border-radius: var(--kd-radius-xl);
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: var(--kd-shadow-sm);
}

.note-text {
  font-size: var(--kd-font-size-base);
  color: var(--kd-color-text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ========================================
   Loading & Error States
   ======================================== */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.state-text {
  font-size: var(--kd-font-size-base);
  color: var(--kd-color-text-tertiary);
  margin: 0;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--kd-color-fill-regular);
  border-top-color: var(--kd-color-public-normal);
  border-radius: 50%;
  animation: kd-spin 0.8s linear infinite;
}

@keyframes kd-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========================================
   KDesign Modal
   ======================================== */
.kd-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.kd-modal-container {
  width: 480px;
  max-width: calc(100vw - 32px);
  background: var(--kd-color-background-plate);
  border-radius: var(--kd-radius-xl);
  box-shadow: var(--kd-shadow-lg);
  overflow: hidden;
}

.kd-modal-header {
  padding: 24px 24px 0;
}

.kd-modal-title {
  font-size: var(--kd-font-size-middle);
  font-weight: var(--kd-font-weight-bold);
  color: var(--kd-color-text-primary);
  line-height: 24px;
  margin: 0;
}

.kd-modal-body {
  padding: 12px 24px 0;
}

.kd-modal-text {
  font-size: var(--kd-font-size-base);
  color: var(--kd-color-text-secondary);
  line-height: 22px;
  margin: 0;
}

.kd-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 24px;
}

/* ========================================
   Modal Transitions
   ======================================== */
.kd-modal-enter-active,
.kd-modal-leave-active {
  transition: opacity var(--kd-time-normal) var(--kd-easing-ease);
}

.kd-modal-enter-from,
.kd-modal-leave-to {
  opacity: 0;
}

.kd-modal-enter-active .kd-modal-container,
.kd-modal-leave-active .kd-modal-container {
  transition: transform var(--kd-time-normal) var(--kd-easing-ease),
    opacity var(--kd-time-normal) var(--kd-easing-ease);
}

.kd-modal-enter-from .kd-modal-container {
  transform: scale(0.96);
  opacity: 0;
}

.kd-modal-leave-to .kd-modal-container {
  transform: scale(0.96);
  opacity: 0;
}
</style>
