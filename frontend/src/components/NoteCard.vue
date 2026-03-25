<template>
  <div class="note-card" @click="handleClick">
    <p class="content-preview">{{ preview }}</p>
    <div class="meta">
      <span class="source">{{ note.source || '未标注来源' }}</span>
      <span class="divider">·</span>
      <span class="time">{{ formatTime(note.createdAt) }}</span>
      <span class="category-badge">
        {{ note.category === 'work' ? '💼' : '🏠' }}
      </span>
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
}

const props = defineProps<{
  note: Note
}>()

const preview = computed(() => {
  const lines = props.note.content.split('\n').slice(0, 2)
  const text = lines.join(' ')
  return text.length > 60 ? text.slice(0, 60) + '...' : text
})

const formatTime = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  if (hours < 48) return '昨天'
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const emit = defineEmits<{
  click: [id: string]
}>()

const handleClick = () => {
  emit('click', props.note.id)
}
</script>

<style scoped>
.note-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s;
}

.note-card:active {
  transform: scale(0.98);
}

.content-preview {
  color: #111827;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.meta {
  display: flex;
  align-items: center;
  color: #6B7280;
  font-size: 14px;
}

.source {
  color: #3B82F6;
}

.divider {
  margin: 0 6px;
}

.category-badge {
  margin-left: auto;
}
</style>
