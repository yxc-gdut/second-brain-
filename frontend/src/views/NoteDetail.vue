<template>
  <div class="note-detail-page">
    <header class="detail-header">
      <button class="back-btn" @click="goBack">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="header-title">笔记详情</h1>
      <button class="delete-btn" @click="confirmDelete">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </header>

    <main v-if="note" class="detail-content">
      <div class="note-meta">
        <span class="category-badge" :class="note.category">
          {{ note.category === 'work' ? '💼 工作' : '🏠 私人' }}
        </span>
        <span class="note-date">{{ formatDate(note.createdAt) }}</span>
      </div>

      <p v-if="note.source" class="note-source">
        <span class="source-label">来源：</span>{{ note.source }}
      </p>

      <div class="note-body">
        <p class="note-text">{{ note.content }}</p>
      </div>

      <div v-if="note.tags?.length" class="note-tags">
        <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </main>

    <div v-else-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else class="error-state">
      <p>笔记不存在</p>
    </div>

    <!-- Delete Confirmation Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <h2 class="modal-title">删除笔记</h2>
          <p class="modal-text">确定要删除这条笔记吗？此操作无法撤销。</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="cancelDelete">取消</button>
            <button class="modal-btn delete" @click="handleDelete">删除</button>
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
.note-detail-page {
  min-height: 100vh;
  background: var(--color-light-gray);
  padding-top: 48px;
}

.detail-header {
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.back-btn {
  width: 44px;
  height: 44px;
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
  background: rgba(0, 0, 0, 0.05);
}

.header-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-near-black);
}

.delete-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #ff3b30;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: rgba(255, 59, 48, 0.1);
}

.detail-content {
  padding: 24px 22px;
  max-width: var(--max-width);
  margin: 0 auto;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-badge {
  font-size: 14px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-near-black);
}

.category-badge.work {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.category-badge.personal {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.note-date {
  font-family: var(--font-text);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.note-source {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-apple-blue);
  margin-bottom: 24px;
}

.source-label {
  color: var(--color-text-secondary);
}

.note-body {
  background: var(--color-white);
  border-radius: var(--radius-large);
  padding: 24px;
  margin-bottom: 20px;
}

.note-text {
  font-family: var(--font-text);
  font-size: 16px;
  color: var(--color-near-black);
  line-height: 1.7;
  white-space: pre-wrap;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  font-family: var(--font-text);
  font-size: 13px;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-pill);
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-apple-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  z-index: 1000;
}

.modal-content {
  background: var(--color-white);
  border-radius: var(--radius-large);
  padding: 24px;
  max-width: 320px;
  width: 100%;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  color: var(--color-near-black);
  margin-bottom: 8px;
}

.modal-text {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 14px;
  border-radius: var(--radius-standard);
  font-family: var(--font-text);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-btn.cancel {
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-near-black);
}

.modal-btn.cancel:hover {
  background: rgba(0, 0, 0, 0.12);
}

.modal-btn.delete {
  background: #ff3b30;
  color: white;
}

.modal-btn.delete:hover {
  background: #dc2626;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
