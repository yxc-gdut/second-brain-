<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-headline">你的第二大脑</h1>
        <p class="hero-subhead">记录灵感，整理知识，AI 智能归类</p>

        <div class="hero-actions">
          <button class="kd-btn kd-btn-primary kd-btn-large" @click="goToText">
            <svg class="kd-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            文字记录
          </button>
          <button class="kd-btn kd-btn-secondary kd-btn-large" @click="goToCamera">
            <svg class="kd-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            拍照 OCR
          </button>
          <button class="kd-btn kd-btn-secondary kd-btn-large" @click="goToVoice">
            <svg class="kd-btn-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            语音输入
          </button>
        </div>
      </div>
    </section>

    <!-- Recent Notes Section -->
    <section class="notes-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">最近记录</h2>
          <button v-if="recentNotes.length > 3" class="kd-btn kd-btn-light kd-btn-small view-all-btn">
            查看全部
            <svg class="kd-btn-icon-suffix" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-grid">
            <div class="skeleton-card" v-for="i in 3" :key="i">
              <div class="skeleton-title"></div>
              <div class="skeleton-line skeleton-line-short"></div>
              <div class="skeleton-meta">
                <div class="skeleton-tag"></div>
                <div class="skeleton-tag skeleton-tag-wide"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="recentNotes.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="empty-title">开始记录你的第一条笔记</p>
          <p class="empty-description">捕捉阅读中的灵感，构建个人知识库</p>
        </div>

        <!-- Notes Grid -->
        <div v-else class="notes-grid">
          <div
            v-for="note in recentNotes"
            :key="note.id"
            class="note-card"
            @click="goToDetail(note.id)"
          >
            <p class="note-content">{{ note.content.substring(0, 100) }}...</p>
            <div class="note-meta">
              <span class="kd-tag" :class="note.category">
                {{ note.category === 'work' ? '💼 工作' : '🏠 私人' }}
              </span>
              <span v-if="note.source" class="note-source">{{ note.source }}</span>
              <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            </div>
            <div v-if="note.tags?.length" class="note-tags">
              <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="kd-tag kd-tag-light">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-container">
        <h2 class="features-title">核心功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="feature-title">AI 智能标签</h3>
            <p class="feature-desc">自动分析内容，智能提取关键词作为标签</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 class="feature-title">双向同步</h3>
            <p class="feature-desc">本地存储 + 飞书云端备份，数据安全无忧</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 class="feature-title">AI 问答</h3>
            <p class="feature-desc">用自然语言查询你的知识库，即问即答</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotes, type Note } from '@/api/notes'

const router = useRouter()

const recentNotes = ref<Note[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const notes = await getNotes()
    recentNotes.value = notes.slice(0, 5)
  } catch (err) {
    console.error('加载笔记失败:', err)
  } finally {
    loading.value = false
  }
})

function goToCamera() {
  router.push('/preview?type=camera')
}

function goToVoice() {
  router.push('/preview?type=voice')
}

function goToText() {
  router.push('/preview?type=text')
}

function goToDetail(id: string) {
  router.push(`/note/${id}`)
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  
  if (diffHours < 1) return '刚刚'
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffHours < 48) return '昨天'
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--kd-color-background-base);
  font-family: var(--kd-font-family);
  padding-top: 48px;
}

/* ========== Hero Section ========== */
.hero-section {
  background: var(--kd-color-fill-base);
  padding: 64px 24px 48px;
}

.hero-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.hero-headline {
  font-size: 28px;
  font-weight: 600;
  line-height: 36px;
  color: var(--kd-color-text-primary);
  margin-bottom: 8px;
}

.hero-subhead {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: var(--kd-color-text-secondary);
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* ========== KDesign Button (hand-crafted) ========== */
.kd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  font-family: var(--kd-font-family);
  font-weight: 600;
  font-size: 13px;
  line-height: 22px;
  border-radius: var(--kd-radius-md);
  padding: 0 16px;
  height: 32px;
  transition: all var(--kd-time-fast) ease;
  white-space: nowrap;
  user-select: none;
}

.kd-btn:hover {
  text-decoration: none;
}

.kd-btn:active {
  transform: none;
}

/* Sizes */
.kd-btn-large {
  font-size: 14px;
  height: 36px;
  padding: 0 20px;
  border-radius: var(--kd-radius-md);
  min-width: 200px;
}

.kd-btn-medium {
  height: 32px;
  padding: 0 16px;
}

.kd-btn-small {
  font-size: 12px;
  height: 28px;
  padding: 0 12px;
}

/* Primary */
.kd-btn-primary {
  background: var(--kd-color-public-normal);
  color: var(--kd-color-text-white);
}

.kd-btn-primary:hover {
  background: var(--kd-color-public-hover);
}

.kd-btn-primary:active {
  background: var(--kd-color-public-pressed);
}

/* Secondary */
.kd-btn-secondary {
  background: var(--kd-color-fill-base);
  color: var(--kd-color-text-primary);
  border: 1px solid var(--kd-color-line-regular);
}

.kd-btn-secondary:hover {
  background: var(--kd-color-state-hover);
  border-color: var(--kd-color-line-regular);
}

.kd-btn-secondary:active {
  background: var(--kd-color-state-pressed);
}

/* Light */
.kd-btn-light {
  background: transparent;
  color: var(--kd-color-text-primary);
  border: 1px solid transparent;
}

.kd-btn-light:hover {
  background: var(--kd-color-state-hover);
}

.kd-btn-light:active {
  background: var(--kd-color-state-pressed);
}

/* Button icon */
.kd-btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.kd-btn-large .kd-btn-icon {
  width: 18px;
  height: 18px;
}

.kd-btn-icon-suffix {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* ========== Notes Section ========== */
.notes-section {
  padding: 32px 24px;
}

.section-container {
  max-width: 960px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--kd-color-text-primary);
}

.view-all-btn {
  color: var(--kd-color-public-normal);
}

.view-all-btn:hover {
  color: var(--kd-color-public-hover);
}

/* ========== Notes Grid ========== */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.note-card {
  background: var(--kd-color-fill-base);
  border: 1px solid var(--kd-color-line-light);
  border-radius: var(--kd-radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all var(--kd-time-normal) ease;
}

.note-card:hover {
  box-shadow: var(--kd-shadow-md);
  border-color: var(--kd-color-line-regular);
}

.note-content {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: var(--kd-color-text-primary);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.note-source {
  font-size: 12px;
  color: var(--kd-color-text-tertiary);
}

.note-date {
  font-size: 12px;
  color: var(--kd-color-text-tertiary);
  margin-left: auto;
}

.note-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ========== KDesign Tag (hand-crafted) ========== */
.kd-tag {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  padding: 0 8px;
  height: 22px;
  border-radius: var(--kd-radius-sm);
  white-space: nowrap;
}

.kd-tag.work {
  background: var(--kd-color-fill-regular);
  color: var(--kd-color-text-primary);
}

.kd-tag.personal {
  background: var(--kd-color-fill-regular);
  color: var(--kd-color-text-primary);
}

.kd-tag-light {
  background: var(--kd-color-fill-light);
  color: var(--kd-color-text-secondary);
}

/* ========== Loading State (KDesign Skeleton) ========== */
.loading-state {
  padding: 8px 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.skeleton-card {
  background: var(--kd-color-fill-base);
  border: 1px solid var(--kd-color-line-light);
  border-radius: var(--kd-radius-lg);
  padding: 16px;
}

.skeleton-title {
  width: 80%;
  height: 14px;
  background: var(--kd-color-fill-regular);
  border-radius: var(--kd-radius-sm);
  margin-bottom: 12px;
  animation: kd-skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
  width: 60%;
  height: 14px;
  background: var(--kd-color-fill-regular);
  border-radius: var(--kd-radius-sm);
  margin-bottom: 16px;
  animation: kd-skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line-short {
  width: 40%;
  animation-delay: 0.15s;
}

.skeleton-meta {
  display: flex;
  gap: 8px;
}

.skeleton-tag {
  width: 48px;
  height: 22px;
  background: var(--kd-color-fill-light);
  border-radius: var(--kd-radius-sm);
  animation: kd-skeleton-pulse 1.5s ease-in-out infinite;
  animation-delay: 0.3s;
}

.skeleton-tag-wide {
  width: 64px;
  animation-delay: 0.45s;
}

@keyframes kd-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: var(--kd-opacity-disabled); }
}

/* ========== Empty State (KDesign Empty) ========== */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  color: var(--kd-color-text-tertiary);
  margin-bottom: 16px;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: var(--kd-color-text-primary);
  margin-bottom: 4px;
}

.empty-description {
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--kd-color-text-secondary);
}

/* ========== Features Section ========== */
.features-section {
  padding: 32px 24px 48px;
}

.features-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  color: var(--kd-color-text-primary);
  text-align: center;
  margin-bottom: 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  max-width: 960px;
  margin: 0 auto;
}

.feature-card {
  background: var(--kd-color-fill-base);
  border: 1px solid var(--kd-color-line-light);
  border-radius: var(--kd-radius-lg);
  padding: 24px;
  transition: all var(--kd-time-normal) ease;
}

.feature-card:hover {
  box-shadow: var(--kd-shadow-md);
  border-color: var(--kd-color-line-regular);
}

.feature-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--kd-color-public-light);
  border-radius: var(--kd-radius-lg);
  color: var(--kd-color-public-normal);
}

.feature-icon svg {
  width: 20px;
  height: 20px;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  color: var(--kd-color-text-primary);
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  color: var(--kd-color-text-secondary);
}

/* ========== Responsive ========== */
@media (max-width: 640px) {
  .hero-section {
    padding: 48px 16px 32px;
  }

  .hero-actions {
    width: 100%;
  }

  .kd-btn-large {
    width: 100%;
    min-width: unset;
  }

  .notes-section {
    padding: 24px 16px;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
