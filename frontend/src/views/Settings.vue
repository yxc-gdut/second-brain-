<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1 class="settings-title">设置</h1>
    </header>

    <main class="settings-content">
      <!-- Quick Actions -->
      <section class="quick-actions">
        <button class="quick-action-btn" @click="goToText">
          <div class="qa-icon">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <span class="qa-text">新建文字笔记</span>
          <svg class="qa-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <button class="quick-action-btn" @click="syncToFeishu">
          <div class="qa-icon sync">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span class="qa-text">同步到飞书</span>
          <svg class="qa-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      <!-- Data Section -->
      <section class="settings-section">
        <h2 class="section-title">数据</h2>
        <div class="card">
          <div class="stat-row">
            <span class="stat-label">工作笔记</span>
            <span class="stat-value">{{ stats.work }} 条</span>
          </div>
          <div class="divider"></div>
          <div class="stat-row">
            <span class="stat-label">私人笔记</span>
            <span class="stat-value">{{ stats.personal }} 条</span>
          </div>
          <div class="divider"></div>
          <div class="stat-row">
            <span class="stat-label">标签总数</span>
            <span class="stat-value">{{ stats.tags }} 个</span>
          </div>
        </div>
      </section>

      <!-- Export Section -->
      <section class="settings-section">
        <h2 class="section-title">导出</h2>
        <div class="card">
          <button class="list-btn" @click="exportData('work')">
            <span>导出工作笔记</span>
            <svg class="btn-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <div class="divider"></div>
          <button class="list-btn" @click="exportData('personal')">
            <span>导出私人笔记</span>
            <svg class="btn-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <div class="divider"></div>
          <button class="list-btn" @click="exportData('all')">
            <span>导出全部数据</span>
            <svg class="btn-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </section>

      <!-- About Section -->
      <section class="settings-section">
        <h2 class="section-title">关于</h2>
        <div class="card">
          <div class="list-item static">
            <span>版本</span>
            <span class="text-secondary">1.0.0</span>
          </div>
          <div class="divider"></div>
          <div class="list-item static">
            <span>第二大脑</span>
            <span class="text-secondary">Powered by AI</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotes } from '@/api/notes'

const router = useRouter()

const showToast = ref(false)
const toastMessage = ref('')
const stats = ref({ work: 0, personal: 0, tags: 0 })

onMounted(async () => {
  try {
    const notes = await getNotes()
    stats.value.work = notes.filter((n: any) => n.category === 'work').length
    stats.value.personal = notes.filter((n: any) => n.category === 'personal').length
  } catch (err) {
    console.error('加载统计失败:', err)
  }
})

function goToText() {
  router.push('/preview?type=text')
}

function exportData(type: 'work' | 'personal' | 'all') {
  showToastMessage(`${type === 'all' ? '全部' : type === 'work' ? '工作' : '私人'}笔记导出功能开发中`)
}

function syncToFeishu() {
  showToastMessage('飞书同步功能开发中')
}

function showToastMessage(msg: string) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-black);
  padding-top: 48px;
}

.settings-header {
  padding: 16px 22px;
  text-align: center;
  position: sticky;
  top: 48px;
  z-index: 100;
}

.settings-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-white);
}

.settings-content {
  padding: 16px 22px 100px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  margin-top: 32px;
}

.section-title {
  font-family: var(--font-text);
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 10px;
  padding-left: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-large);
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.quick-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
}

.quick-action-btn:active {
  transform: scale(0.99);
}

.qa-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-micro);
  background: rgba(0, 113, 227, 0.15);
  color: var(--color-apple-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-icon.sync {
  background: rgba(48, 200, 100, 0.15);
  color: #30c864;
}

.qa-text {
  flex: 1;
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-white);
}

.qa-arrow {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

/* Card */
.card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-large);
  overflow: hidden;
}

/* Stats */
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
}

.stat-label {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-white);
}

.stat-value {
  font-family: var(--font-text);
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
}

/* Divider */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 18px;
}

/* List Buttons */
.list-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.list-btn:hover {
  background: rgba(255, 255, 255, 0.03);
}

.list-btn:active {
  background: rgba(255, 255, 255, 0.06);
}

.list-btn span {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-white);
}

.btn-arrow {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

/* List Item Static */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
}

.list-item span {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-white);
}

.text-secondary {
  color: rgba(255, 255, 255, 0.5) !important;
  font-size: 14px !important;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  color: var(--color-white);
  padding: 14px 24px;
  border-radius: var(--radius-pill);
  font-family: var(--font-text);
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toast svg {
  color: #30c864;
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
