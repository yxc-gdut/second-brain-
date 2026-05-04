<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1 class="settings-title">设置</h1>
    </header>

    <main class="settings-content">
      <!-- Quick Actions -->
      <section class="quick-actions">
        <button class="kd-card quick-action-btn" @click="goToText">
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

        <button class="kd-card quick-action-btn" @click="syncToFeishu">
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
        <div class="kd-card">
          <div class="stat-row">
            <span class="stat-label">工作笔记</span>
            <span class="stat-value">{{ stats.work }} 条</span>
          </div>
          <div class="kd-divider"></div>
          <div class="stat-row">
            <span class="stat-label">私人笔记</span>
            <span class="stat-value">{{ stats.personal }} 条</span>
          </div>
          <div class="kd-divider"></div>
          <div class="stat-row">
            <span class="stat-label">标签总数</span>
            <span class="stat-value">{{ stats.tags }} 个</span>
          </div>
        </div>
      </section>

      <!-- Export Section -->
      <section class="settings-section">
        <h2 class="section-title">导出</h2>
        <div class="kd-card">
          <button class="list-btn" @click="exportData('work')">
            <span>导出工作笔记</span>
            <svg class="btn-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <div class="kd-divider"></div>
          <button class="list-btn" @click="exportData('personal')">
            <span>导出私人笔记</span>
            <svg class="btn-arrow w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <div class="kd-divider"></div>
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
        <div class="kd-card">
          <div class="list-item static">
            <span>版本</span>
            <span class="text-tertiary">1.0.0</span>
          </div>
          <div class="kd-divider"></div>
          <div class="list-item static">
            <span>第二大脑</span>
            <span class="text-tertiary">Powered by AI</span>
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
    stats.value.work = notes.filter((n) => n.category === 'work').length
    stats.value.personal = notes.filter((n) => n.category === 'personal').length
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
/* ========== Layout ========== */
.settings-page {
  min-height: 100vh;
  background: var(--kd-color-background-base);
  padding-top: 0;
}

.settings-header {
  padding: 32px 24px 16px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--kd-color-background-base);
}

.settings-title {
  font-size: var(--kd-font-size-xl, 20px);
  font-weight: 600;
  color: var(--kd-color-text-primary);
  line-height: 32px;
}

.settings-content {
  padding: 0 24px 100px;
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  margin-top: 24px;
}

.section-title {
  font-size: var(--kd-font-size-base, 14px);
  font-weight: 600;
  color: var(--kd-color-text-secondary);
  margin-bottom: 12px;
  padding-left: 4px;
}

/* ========== KDesign Card ========== */
.kd-card {
  background: var(--kd-color-background-middle, #fff);
  border-radius: var(--kd-radius-lg, 8px);
  box-shadow: var(--kd-shadow-sm, 0 1px 4px rgba(26,26,26,.10));
  overflow: hidden;
}

/* ========== Quick Actions ========== */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: none;
  cursor: pointer;
  transition: background var(--kd-time-fast, 120ms) var(--kd-easing-ease, cubic-bezier(.25,.10,.25,1.00));
  width: 100%;
  text-align: left;
  border-radius: var(--kd-radius-lg, 8px);
}

.quick-action-btn:hover {
  background: var(--kd-color-state-hover, rgba(0,0,0,0.04));
}

.quick-action-btn:active {
  background: var(--kd-color-state-pressed, rgba(0,0,0,0.08));
}

.qa-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--kd-radius-md, 6px);
  background: var(--kd-color-info-light, #ECF4FF);
  color: var(--kd-color-info-normal, #0A6CFF);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-icon.sync {
  background: var(--kd-color-success-light, #E9F6E3);
  color: var(--kd-color-success-normal, #418F1F);
}

.qa-text {
  flex: 1;
  font-size: var(--kd-font-size-base, 14px);
  color: var(--kd-color-text-primary, #0D0D0D);
  line-height: 22px;
}

.qa-arrow {
  width: 16px;
  height: 16px;
  color: var(--kd-color-icon-secondary, #757575);
  flex-shrink: 0;
}

/* ========== Stats ========== */
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.stat-label {
  font-size: var(--kd-font-size-base, 14px);
  color: var(--kd-color-text-primary, #0D0D0D);
  line-height: 22px;
}

.stat-value {
  font-size: var(--kd-font-size-base, 14px);
  color: var(--kd-color-text-secondary, #6B6B6B);
  line-height: 22px;
}

/* ========== KDesign Divider ========== */
.kd-divider {
  height: 1px;
  background: var(--kd-color-line-light, rgba(13,13,13,0.06));
  margin: 0 16px;
}

/* ========== List Buttons ========== */
.list-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background var(--kd-time-fast, 120ms) var(--kd-easing-ease, cubic-bezier(.25,.10,.25,1.00));
  text-align: left;
}

.list-btn:hover {
  background: var(--kd-color-state-hover, rgba(0,0,0,0.04));
}

.list-btn:active {
  background: var(--kd-color-state-pressed, rgba(0,0,0,0.08));
}

.list-btn span {
  font-size: var(--kd-font-size-base, 14px);
  color: var(--kd-color-text-primary, #0D0D0D);
  line-height: 22px;
}

.btn-arrow {
  width: 16px;
  height: 16px;
  color: var(--kd-color-icon-secondary, #757575);
  flex-shrink: 0;
}

/* ========== List Item Static ========== */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.list-item span {
  font-size: var(--kd-font-size-base, 14px);
  color: var(--kd-color-text-primary, #0D0D0D);
  line-height: 22px;
}

.text-tertiary {
  color: var(--kd-color-text-tertiary, #909090) !important;
}

/* ========== Toast ========== */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--kd-color-background-bottom, #fff);
  color: var(--kd-color-text-primary);
  padding: 12px 24px;
  border-radius: var(--kd-radius-lg, 8px);
  font-size: var(--kd-font-size-base, 14px);
  line-height: 22px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  box-shadow: var(--kd-shadow-lg, 0 12px 32px rgba(26,26,26,.08));
}

.toast svg {
  color: var(--kd-color-success-normal, #418F1F);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 240ms var(--kd-easing-ease, cubic-bezier(.25,.10,.25,1.00));
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
