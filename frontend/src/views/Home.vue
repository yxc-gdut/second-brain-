<template>
  <div class="home">
    <!-- 顶部栏 -->
    <header class="header">
      <h1 class="title">第二大脑</h1>
      <button class="search-btn" @click="openSearch">
        <MagnifyingGlassIcon class="w-6 h-6" />
      </button>
    </header>

    <!-- 搜索弹窗 -->
    <div v-if="showSearch" class="search-overlay" @click="closeSearch">
      <div class="search-panel" @click.stop>
        <div class="search-header">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜索笔记内容、来源或标签..."
            @keyup.enter="performSearch"
            ref="searchInput"
          />
          <button class="search-close" @click="closeSearch">取消</button>
        </div>
        
        <!-- 搜索筛选 -->
        <div class="search-filters">
          <button
            class="filter-btn"
            :class="{ active: searchCategory === '' }"
            @click="searchCategory = ''"
          >
            全部
          </button>
          <button
            class="filter-btn"
            :class="{ active: searchCategory === 'work' }"
            @click="searchCategory = 'work'"
          >
            💼 工作
          </button>
          <button
            class="filter-btn"
            :class="{ active: searchCategory === 'personal' }"
            @click="searchCategory = 'personal'"
          >
            🏠 私人
          </button>
        </div>
        
        <!-- 搜索结果 -->
        <div class="search-results">
          <div v-if="searching" class="search-loading">搜索中...</div>
          <div v-else-if="searchResults.length > 0" class="results-list">
            <NoteCard
              v-for="note in searchResults"
              :key="note.id"
              :note="note"
              @click="goToDetail(note.id); closeSearch()"
            />
          </div>
          <div v-else-if="searchQuery" class="search-empty">
            未找到相关笔记
          </div>
          <div v-else class="search-tips">
            <p>输入关键词搜索笔记</p>
            <p class="tips">支持搜索：内容、来源、标签</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 录入按钮区 -->
    <section class="capture-section">
      <CaptureButton type="camera" @click="goToCamera" />
      <CaptureButton type="voice" @click="goToVoice" />
      <CaptureButton type="text" @click="goToText" />
    </section>

    <!-- 最近记录 -->
    <section class="recent-section">
      <div class="section-header">
        <h2 class="section-title">最近记录</h2>
        <button class="more-btn" @click="showAll = true">查看更多</button>
      </div>
      <div class="notes-list">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="recentNotes.length === 0" class="empty">暂无笔记</div>
        <NoteCard
          v-else
          v-for="note in recentNotes"
          :key="note.id"
          :note="note"
          @click="goToDetail(note.id)"
        />
      </div>
    </section>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item active">
        <HomeIcon class="w-6 h-6" />
        <span>首页</span>
      </router-link>
      <router-link to="/chat" class="nav-item">
        <ChatBubbleLeftRightIcon class="w-6 h-6" />
        <span>AI</span>
      </router-link>
      <router-link to="/settings" class="nav-item">
        <CogIcon class="w-6 h-6" />
        <span>设置</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CogIcon
} from '@heroicons/vue/24/outline'
import CaptureButton from '@/components/CaptureButton.vue'
import NoteCard from '@/components/NoteCard.vue'
import { getNotes, searchNotes, type Note } from '@/api/notes'

const router = useRouter()

// 笔记数据
const recentNotes = ref<Note[]>([])
const loading = ref(false)
const error = ref('')

// 搜索相关
const showSearch = ref(false)
const searchQuery = ref('')
const searchCategory = ref<'work' | 'personal' | ''>('')
const searchResults = ref<Note[]>([])
const searching = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

// 加载笔记
async function loadNotes() {
  loading.value = true
  error.value = ''
  try {
    const notes = await getNotes()
    recentNotes.value = notes.slice(0, 5) // 只显示最近5条
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
    console.error('加载笔记失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNotes()
})

// 搜索功能
async function openSearch() {
  showSearch.value = true
  await nextTick()
  searchInput.value?.focus()
}

function closeSearch() {
  showSearch.value = false
  searchQuery.value = ''
  searchCategory.value = ''
  searchResults.value = []
}

async function performSearch() {
  if (!searchQuery.value.trim() && !searchCategory.value) return
  
  searching.value = true
  try {
    const results = await searchNotes({
      q: searchQuery.value,
      category: searchCategory.value || undefined
    })
    searchResults.value = results
  } catch (err) {
    console.error('搜索失败:', err)
  } finally {
    searching.value = false
  }
}

const goToCamera = () => router.push('/preview?type=camera')
const goToVoice = () => router.push('/preview?type=voice')
const goToText = () => router.push('/preview?type=text')
const goToDetail = (id: string) => router.push(`/note/${id}`)

const showAll = ref(false)
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #F3F4F6;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
}

.title {
  font-size: 20px;
  font-weight: 600;
}

.search-btn {
  color: #6B7280;
}

/* 搜索弹窗 */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.search-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #F3F4F6;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
}

.search-close {
  padding: 0 16px;
  color: #6B7280;
  font-size: 14px;
}

.search-filters {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.filter-btn {
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 14px;
  background: #F3F4F6;
  color: #6B7280;
  border: none;
}

.filter-btn.active {
  background: #3B82F6;
  color: white;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-loading,
.search-empty {
  text-align: center;
  padding: 40px;
  color: #6B7280;
}

.search-tips {
  text-align: center;
  padding: 60px 20px;
  color: #6B7280;
}

.search-tips .tips {
  font-size: 14px;
  margin-top: 8px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.capture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 16px;
}

.recent-section {
  padding: 0 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.more-btn {
  font-size: 14px;
  color: #3B82F6;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 40px 16px;
  color: #6B7280;
}

.error {
  color: #EF4444;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  background: white;
  border-top: 1px solid #E5E7EB;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 16px;
  color: #6B7280;
  text-decoration: none;
}

.nav-item.active {
  color: #3B82F6;
}

.nav-item span {
  font-size: 12px;
}
</style>