<template>
  <div class="note-card" @click="handleClick">
    <div class="card-header">
      <span class="category-badge" :class="note.category">
        {{ note.category === 'work' ? '💼' : '🏠' }}
      </span>
      <span class="date">{{ formatDate(note.createdAt) }}</span>
    </div>
    
    <p class="note-content">{{ truncatedContent }}</p>
    
    <div class="card-footer" v-if="note.tags?.length || note.source">
      <span v-if="note.source" class="source">{{ note.source }}</span>
      <div v-if="note.tags?.length" class="tags">
        <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="tag">
          {{ tag }}
        </span>
        <span v-if="note.tags.length > 2" class="tag-more">
          +{{ note.tags.length - 2 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Note {
  id: string
  content: string
  source?: string
  category: 'work' | 'personal'
  createdAt: string
  tags?: string[]
}

const props = defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

const truncatedContent = computed(() => {
  const text = props.note.content.replace(/\n+/g, ' ').trim()
  return text.length > 120 ? text.substring(0, 120) + '...' : text
})

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  
  if (diffHours < 1) return '刚刚'
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffHours < 48) return '昨天'
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

function handleClick() {
  emit('click', props.note.id)
}
</script>

<style scoped>
.note-card {
  background: var(--color-white);
  border-radius: var(--radius-large);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.note-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-2px);
}

.note-card:active {
  transform: scale(0.99);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-badge {
  font-size: 16px;
}

.date {
  font-family: var(--font-text);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.note-content {
  font-family: var(--font-text);
  font-size: 15px;
  color: var(--color-near-black);
  line-height: 1.55;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.source {
  font-family: var(--font-text);
  font-size: 13px;
  color: var(--color-apple-blue);
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: auto;
}

.tag {
  font-family: var(--font-text);
  font-size: 12px;
  padding: 4px 10px;
  background: var(--color-light-gray);
  color: rgba(0, 0, 0, 0.65);
  border-radius: var(--radius-pill);
}

.tag-more {
  font-family: var(--font-text);
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 4px 6px;
}
</style>
