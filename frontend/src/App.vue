<template>
  <div class="app">
    <!-- Apple Glass Navigation -->
    <nav class="apple-nav">
      <div class="nav-content">
        <div class="nav-logo">
          <span class="logo-text">第二大脑</span>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            首页
          </router-link>
          <router-link to="/chat" class="nav-link" :class="{ active: $route.path === '/chat' }">
            AI 问答
          </router-link>
          <router-link to="/settings" class="nav-link" :class="{ active: $route.path === '/settings' }">
            设置
          </router-link>
        </div>
        <div class="nav-actions">
          <button class="nav-icon-btn" @click="openSearch">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Search Overlay -->
    <div v-if="showSearch" class="search-overlay" @click="closeSearch">
      <div class="search-panel" @click.stop>
        <div class="search-input-wrapper">
          <svg class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            class="search-input-field"
            placeholder="搜索笔记..."
            @keyup.enter="performSearch"
          />
          <button class="search-cancel" @click="closeSearch">取消</button>
        </div>
        
        <!-- Filter Pills -->
        <div class="search-filters">
          <button
            v-for="f in filters"
            :key="f.value"
            class="filter-pill"
            :class="{ active: activeFilter === f.value }"
            @click="activeFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
        
        <!-- Results -->
        <div class="search-results">
          <div v-if="searching" class="search-loading">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
          </div>
          <div v-else-if="searchResults.length > 0" class="results-grid">
            <div
              v-for="note in searchResults"
              :key="note.id"
              class="result-card"
              @click="goToNote(note.id)"
            >
              <p class="result-content">{{ note.content.substring(0, 80) }}...</p>
              <div class="result-meta">
                <span class="result-category" :class="note.category">
                  {{ note.category === 'work' ? '💼' : '🏠' }}
                </span>
                <span class="result-date">{{ formatDate(note.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="searchQuery" class="search-empty">
            <p>未找到相关笔记</p>
          </div>
          <div v-else class="search-hint">
            <p>输入关键词搜索笔记内容</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { searchNotes, type Note } from '@/api/notes'

const router = useRouter()

// Search
const showSearch = ref(false)
const searchQuery = ref('')
const activeFilter = ref('')
const searchResults = ref<Note[]>([])
const searching = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

const filters = [
  { label: '全部', value: '' },
  { label: '💼 工作', value: 'work' },
  { label: '🏠 私人', value: 'personal' },
]

async function openSearch() {
  showSearch.value = true
  await nextTick()
  searchInput.value?.focus()
}

function closeSearch() {
  showSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
  activeFilter.value = ''
}

async function performSearch() {
  if (!searchQuery.value.trim() && !activeFilter.value) return
  
  searching.value = true
  try {
    const results = await searchNotes({
      q: searchQuery.value,
      category: (activeFilter.value || undefined) as 'work' | 'personal' | undefined
    })
    searchResults.value = results
  } catch (err) {
    console.error('搜索失败:', err)
  } finally {
    searching.value = false
  }
}

function goToNote(id: string) {
  closeSearch()
  router.push(`/note/${id}`)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// Watch for search changes
watch([searchQuery, activeFilter], () => {
  if (searchQuery.value || activeFilter.value) {
    performSearch()
  } else {
    searchResults.value = []
  }
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--color-black);
  color: var(--color-white);
}

/* Apple Glass Navigation */
.apple-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-content {
  max-width: var(--max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-white);
  letter-spacing: -0.374px;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-family: var(--font-text);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-white);
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  opacity: 1;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--color-white);
  border-radius: 1px;
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.nav-icon-btn {
  background: transparent;
  border: none;
  color: var(--color-white);
  opacity: 0.8;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.nav-icon-btn:hover {
  opacity: 1;
}

/* Search Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1001;
}

.search-panel {
  max-width: 600px;
  margin: 80px auto 0;
  padding: 0 22px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-comfortable);
  padding: 12px 16px;
  gap: 12px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--color-white);
  opacity: 0.5;
  flex-shrink: 0;
}

.search-input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-text);
  font-size: 17px;
  color: var(--color-white);
  letter-spacing: -0.374px;
}

.search-input-field::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-cancel {
  background: transparent;
  border: none;
  color: var(--color-apple-blue);
  font-family: var(--font-text);
  font-size: 17px;
  cursor: pointer;
  padding: 0;
}

/* Search Filters */
.search-filters {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-pill {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-pill);
  color: var(--color-white);
  font-family: var(--font-text);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}

.filter-pill:hover {
  background: rgba(255, 255, 255, 0.15);
}

.filter-pill.active {
  background: var(--color-apple-blue);
}

/* Search Results */
.search-results {
  margin-top: 24px;
}

.search-loading {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 40px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--color-white);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-large);
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.result-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.result-content {
  font-size: 15px;
  color: var(--color-white);
  line-height: 1.5;
  margin-bottom: 8px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.result-category {
  font-size: 14px;
}

.search-empty,
.search-hint {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .nav-links {
    gap: 20px;
  }
  
  .nav-link {
    font-size: 11px;
  }
}
</style>
