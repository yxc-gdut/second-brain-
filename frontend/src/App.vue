<template>
  <div class="app">
    <!-- Navigation -->
    <nav class="app-nav">
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
  background: var(--kd-color-background-base, #F0F0F0);
}

/* Navigation */
.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: var(--kd-color-fill-base, #fff);
  z-index: 1000;
  border-bottom: 1px solid var(--kd-color-line-light, rgba(13,13,13,0.06));
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: var(--kd-font-size-large, 18px);
  font-weight: 600;
  color: var(--kd-color-text-primary, #0D0D0D);
  letter-spacing: -0.374px;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-size: var(--kd-font-size-sub-base, 13px);
  font-weight: 400;
  color: var(--kd-color-text-secondary, #6B6B6B);
  text-decoration: none;
  transition: color var(--kd-time-fast, 120ms) var(--kd-easing-ease);
  position: relative;
  padding-bottom: 2px;
}

.nav-link:hover,
.nav-link.active {
  color: var(--kd-color-text-primary, #0D0D0D);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--kd-color-public-normal, #0A6CFF);
  border-radius: 1px;
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.nav-icon-btn {
  background: transparent;
  border: none;
  color: var(--kd-color-icon-secondary, #757575);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--kd-time-fast, 120ms) var(--kd-easing-ease);
}

.nav-icon-btn:hover {
  color: var(--kd-color-icon-primary, #0D0D0D);
}

/* Search Overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(240, 240, 240, 0.6);
  z-index: 1001;
  animation: fadeIn var(--kd-time-fast, 120ms) var(--kd-easing-ease);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.search-panel {
  max-width: 600px;
  margin: 80px auto 0;
  padding: 24px;
  background: var(--kd-color-fill-base, #fff);
  border-radius: var(--kd-radius-xl, 12px);
  box-shadow: var(--kd-shadow-lg);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--kd-color-fill-light, #F5F5F5);
  border-radius: var(--kd-radius-md, 6px);
  padding: 12px 16px;
  gap: 12px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: var(--kd-color-text-tertiary, #909090);
  flex-shrink: 0;
}

.search-input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--kd-color-text-primary, #0D0D0D);
}

.search-input-field::placeholder {
  color: var(--kd-color-text-tertiary, #909090);
}

.search-cancel {
  background: transparent;
  border: none;
  color: var(--kd-color-text-public, #0A6CFF);
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  transition: opacity var(--kd-time-fast, 120ms) var(--kd-easing-ease);
}

.search-cancel:hover {
  opacity: 0.72;
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
  background: var(--kd-color-fill-regular, #EBEBEB);
  border: none;
  border-radius: var(--kd-radius-sm, 4px);
  color: var(--kd-color-text-secondary, #6B6B6B);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--kd-time-fast, 120ms) var(--kd-easing-ease),
              color var(--kd-time-fast, 120ms) var(--kd-easing-ease);
}

.filter-pill:hover {
  background: var(--kd-color-fill-light, #F5F5F5);
}

.filter-pill.active {
  background: var(--kd-color-public-light, #E6F0FF);
  color: var(--kd-color-text-public, #0A6CFF);
}

/* Search Results */
.search-results {
  margin-top: 20px;
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
  background: var(--kd-color-text-tertiary, #909090);
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
  background: var(--kd-color-fill-base, #fff);
  border: 1px solid var(--kd-color-line-light, rgba(13,13,13,0.06));
  border-radius: var(--kd-radius-lg, 8px);
  padding: 16px;
  cursor: pointer;
  transition: box-shadow var(--kd-time-fast, 120ms) var(--kd-easing-ease);
}

.result-card:hover {
  box-shadow: var(--kd-shadow-sm);
}

.result-content {
  font-size: 14px;
  color: var(--kd-color-text-primary, #0D0D0D);
  line-height: 1.5;
  margin-bottom: 8px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--kd-color-text-tertiary, #909090);
}

.result-category {
  font-size: 14px;
}

.search-empty,
.search-hint {
  text-align: center;
  padding: 60px 20px;
  color: var(--kd-color-text-tertiary, #909090);
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--kd-time-fast, 120ms) var(--kd-easing-ease);
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
    font-size: 12px;
  }

  .search-panel {
    margin: 56px 12px 0;
    padding: 16px;
  }
}
</style>
