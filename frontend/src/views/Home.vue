<template>
  <div class="home">
    <!-- Hero Section - Black Background -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-headline">你的第二大脑</h1>
        <p class="hero-subhead">记录灵感，整理知识，AI 智能归类</p>
        
        <!-- Quick Actions - Pill CTAs -->
        <div class="hero-actions">
          <button class="cta-pill cta-primary" @click="goToText">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            文字记录
          </button>
          <button class="cta-pill cta-secondary" @click="goToCamera">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            拍照 OCR
          </button>
          <button class="cta-pill cta-secondary" @click="goToVoice">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            语音输入
          </button>
        </div>
      </div>
      
      <!-- Decorative Background Elements -->
      <div class="hero-bg-gradient"></div>
    </section>

    <!-- Recent Notes Section - Light Gray -->
    <section class="notes-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">最近记录</h2>
          <button v-if="recentNotes.length > 3" class="view-all-btn">
            查看全部
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-grid">
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="recentNotes.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="empty-title">开始记录你的第一条笔记</p>
          <p class="empty-subtitle">捕捉阅读中的灵感，构建个人知识库</p>
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
              <span class="note-category" :class="note.category">
                {{ note.category === 'work' ? '💼 工作' : '🏠 私人' }}
              </span>
              <span class="note-source" v-if="note.source">{{ note.source }}</span>
              <span class="note-date">{{ formatDate(note.createdAt) }}</span>
            </div>
            <div v-if="note.tags?.length" class="note-tags">
              <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section - Black -->
    <section class="features-section">
      <div class="section-container">
        <h2 class="section-title light">核心功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="feature-title">AI 智能标签</h3>
            <p class="feature-desc">自动分析内容，智能提取关键词作为标签</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 class="feature-title">双向同步</h3>
            <p class="feature-desc">本地存储 + 飞书云端备份，数据安全无忧</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  padding-top: 48px; /* nav height */
}

/* Hero Section - Black */
.hero-section {
  min-height: calc(100vh - 48px);
  background: var(--color-black);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 80px 22px;
}

.hero-content {
  text-align: center;
  max-width: 600px;
  position: relative;
  z-index: 1;
}

.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(40px, 8vw, 56px);
  font-weight: 600;
  line-height: 1.07;
  letter-spacing: -0.28px;
  color: var(--color-white);
  margin-bottom: 16px;
}

.hero-subhead {
  font-family: var(--font-text);
  font-size: clamp(17px, 3vw, 21px);
  font-weight: 400;
  line-height: 1.19;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* CTA Pill Buttons */
.cta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: var(--radius-pill);
  font-family: var(--font-text);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
}

.cta-primary {
  background: var(--color-apple-blue);
  color: var(--color-white);
  border: none;
}

.cta-primary:hover {
  background: #0077ed;
  transform: scale(1.02);
}

.cta-primary:active {
  transform: scale(0.98);
}

.cta-secondary {
  background: transparent;
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.cta-secondary:active {
  transform: scale(0.98);
}

.hero-bg-gradient {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(0, 113, 227, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

/* Notes Section - Light Gray */
.notes-section {
  background: var(--color-light-gray);
  padding: 80px 22px;
}

.section-container {
  max-width: var(--max-width);
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  color: var(--color-near-black);
}

.section-title.light {
  color: var(--color-white);
  text-align: center;
  margin-bottom: 48px;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: var(--color-apple-blue);
  font-family: var(--font-text);
  font-size: 15px;
  cursor: pointer;
  padding: 8px 0;
}

.view-all-btn:hover {
  text-decoration: underline;
}

/* Notes Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.note-card {
  background: var(--color-white);
  border-radius: var(--radius-large);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.note-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.note-content {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-near-black);
  line-height: 1.5;
  margin-bottom: 16px;
}

.note-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.note-category {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-light-gray);
  color: var(--color-near-black);
}

.note-category.work {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.note-category.personal {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.note-source {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.note-date {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.note-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-micro);
}

/* Loading State */
.loading-state {
  padding: 20px 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.skeleton-card {
  height: 150px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-large);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  color: rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.empty-title {
  font-family: var(--font-text);
  font-size: 19px;
  font-weight: 600;
  color: var(--color-near-black);
  margin-bottom: 8px;
}

.empty-subtitle {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-text-secondary);
}

/* Features Section - Black */
.features-section {
  background: var(--color-black);
  padding: 80px 22px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-large);
  transition: background 0.2s;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 113, 227, 0.15);
  border-radius: var(--radius-large);
  color: var(--color-apple-blue);
}

.feature-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  color: var(--color-white);
  margin-bottom: 8px;
}

.feature-desc {
  font-family: var(--font-text);
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 640px) {
  .hero-section {
    min-height: auto;
    padding: 60px 22px;
  }
  
  .hero-actions {
    width: 100%;
  }
  
  .cta-pill {
    width: 100%;
    min-width: unset;
  }
  
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
