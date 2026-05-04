<template>
  <div class="note-card" @click="handleClick">
    <div class="card-header">
      <span class="category-badge" :class="note.category">
        {{ note.category === 'work' ? '💼' : '🏠' }}
      </span>
      <span class="date">{{ formatDate(note.createdAt) }}</span>
    </div>
    
    <p class="note-content">{{ truncatedContent }}</p>
    
    <div v-if="note.tags?.length || note.source" class="card-footer">
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
  background: var(--kd-color-fill-base, #FFFFFF);
  border-radius: var(--kd-radius-lg, 8px);
  padding: 16px;
  cursor: pointer;
  transition: box-shadow var(--kd-time-fast, 120ms) var(--kd-easing-ease);
  border: 1px solid var(--kd-color-line-light, rgba(13,13,13,0.06));
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-card:hover {
  box-shadow: var(--kd-shadow-md, 0 1px 4px rgba(26,26,26,.14));
  border-color: var(--kd-color-line-regular, rgba(13,13,13,0.12));
}

.note-card:active {
  opacity: var(--kd-opacity-disabled, 0.4);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-badge {
  font-size: var(--kd-font-size-middle, 16px);
}

.date {
  font-size: var(--kd-font-size-small, 12px);
  color: var(--kd-color-text-tertiary, #909090);
}

.note-content {
  font-size: var(--kd-font-size-base, 14px);
  color: var(--kd-color-text-primary, #0D0D0D);
  line-height: 22px;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.source {
  font-size: var(--kd-font-size-small, 12px);
  color: var(--kd-color-text-public, #0A6CFF);
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-left: auto;
}

.tag {
  font-size: var(--kd-font-size-small, 12px);
  padding: 2px 8px;
  background: var(--kd-color-fill-regular, #EEEEEE);
  color: var(--kd-color-text-secondary, #6B6B6B);
  border-radius: var(--kd-radius-sm, 4px);
}

.tag-more {
  font-size: var(--kd-font-size-small, 12px);
  color: var(--kd-color-text-tertiary, #909090);
  padding: 2px 4px;
}
</style>
