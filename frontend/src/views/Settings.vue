<template>
  <div class="settings">
    <header class="header">
      <h1 class="title">设置</h1>
    </header>

    <main class="content">
      <!-- 数据管理 -->
      <section class="section">
        <h2 class="section-title">📁 数据管理</h2>
        <div class="menu-list">
          <button class="menu-item" @click="exportData('work')">
            <span>导出工作笔记</span>
            <ChevronRightIcon class="w-5 h-5" />
          </button>
          <button class="menu-item" @click="exportData('personal')">
            <span>导出私人笔记</span>
            <ChevronRightIcon class="w-5 h-5" />
          </button>
          <button class="menu-item" @click="exportData('all')">
            <span>导出全部</span>
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </section>

      <!-- 外观 -->
      <section class="section">
        <h2 class="section-title">🎨 外观</h2>
        <div class="menu-list">
          <div class="menu-item">
            <span>主题</span>
            <span class="value">浅色</span>
          </div>
        </div>
      </section>

      <!-- 关于 -->
      <section class="section">
        <h2 class="section-title">ℹ️ 关于</h2>
        <div class="menu-list">
          <div class="menu-item">
            <span>版本</span>
            <span class="value">1.0.0</span>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <HomeIcon class="w-6 h-6" />
        <span>首页</span>
      </router-link>
      <router-link to="/chat" class="nav-item">
        <ChatBubbleLeftRightIcon class="w-6 h-6" />
        <span>AI</span>
      </router-link>
      <router-link to="/settings" class="nav-item active">
        <CogIcon class="w-6 h-6" />
        <span>设置</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ChevronRightIcon, HomeIcon, ChatBubbleLeftRightIcon, CogIcon } from '@heroicons/vue/24/outline'

const exportData = (type: 'work' | 'personal' | 'all') => {
  console.log('导出', type)
  // 导出逻辑
}
</script>

<style scoped>
.settings {
  min-height: 100vh;
  background: #F3F4F6;
  padding-bottom: 80px;
}

.header {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.title {
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.content {
  padding: 16px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
  padding-left: 4px;
}

.menu-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  color: #111827;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item .value {
  color: #6B7280;
}

.menu-item svg {
  color: #9CA3AF;
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
